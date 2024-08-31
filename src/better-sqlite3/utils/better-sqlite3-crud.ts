import type { Database } from 'better-sqlite3';

/**
 * Object that will be inserted in the database
 */
export interface DBObject {
  [key: string]: any;
}

//
//

/**
 * Convert booleans to 1 or 0
 *
 * Convert objects or arrays to JSON
 *
 * Remove undefined values
 * @param name Name of the object, for debugging
 */
export function dbParse(
  name: string,
  obj: any,
): Record<string, string | number | null> {
  if (typeof obj !== 'object' && obj !== null) {
    throw new Error(name + ' must be an object');
  }

  let values = 0;

  const result = Object.keys(obj).reduce((acc, key) => {
    const value = (obj as any)[key];
    if (value === undefined) {
      return acc;
    }

    if (typeof value === 'boolean') {
      acc[key] = value ? 1 : 0;
    } else if (typeof value === 'object' && value !== null) {
      acc[key] = JSON.stringify(value);
    } else {
      acc[key] = value;
    }

    ++values;

    return acc;
  }, {} as any);

  if (values === 0) {
    throw new Error(name + ' must have at least one property');
  }

  return result;
}

/**
 * Insert a row in the database
 */
export function insertIntoDB(
  db: Database,
  table: string,
  data: DBObject,
  ...returning: string[]
): any {
  const _data = dbParse('data', data);

  const keys = Object.keys(_data);
  const values = Object.values(_data);

  const placeholders = values.map(() => '?').join(', ');
  let sql = `INSERT INTO ${table} (${keys.join(
    ', ',
  )}) VALUES (${placeholders})`;

  if (returning.length) {
    sql += ` RETURNING ${returning.join(', ')}`;

    return db.prepare(sql).get(values) as any;
  }

  return db.prepare(sql).run(values);
}

/**
 * Update a row in the database
 */
export function updateDB(
  db: Database,
  table: string,
  data: DBObject,
  where: DBObject,
): void {
  const _data = dbParse('data', data);
  const values = Object.values(_data);
  const dataSQL = Object.keys(_data)
    .map((key) => key + ' = ?')
    .join(', ');

  const _where = dbParse('where', where);
  const whereValues = Object.values(_where);
  const whereSQL = Object.keys(_where)
    .map((key) => key + ' = ?')
    .join(' AND ');

  const sql = `UPDATE ${table} SET ${dataSQL} WHERE ${whereSQL};`;

  db.prepare(sql).run([...values, ...whereValues]);
}
