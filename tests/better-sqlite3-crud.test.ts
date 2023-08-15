import { beforeEach, describe, test } from 'mocha';
import { insertIntoDB, updateDB } from '../src/runtime/better-sqlite3';
import Database, { Database as SQLiteDatabase } from 'better-sqlite3';
import { assert } from 'chai';

//
//

describe('CRUD methods on /runtime/better-sqlite3', () => {
  let db: SQLiteDatabase;

  //
  //

  beforeEach(() => {
    db = new Database(':memory:');
    db.prepare('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)').run();
  });

  //
  //

  afterEach(() => {
    db.close();
  });

  //
  //

  test('Deve executar insertIntoDB com sucesso', () => {
    insertIntoDB(db, 'test', { id: 1, name: 'Test' });

    const result = db.prepare('SELECT * FROM test').all() as any;

    assert.deepEqual(result, [{ id: 1, name: 'Test' }]);
  });

  //
  //

  test('Deve executar insertIntoDB com sucesso e returning', () => {
    const { id } = insertIntoDB(db, 'test', { id: 1, name: 'Test' }, 'id');

    const result = db.prepare('SELECT * FROM test').all() as any;

    assert.deepEqual(result, [{ id: 1, name: 'Test' }]);
    assert.equal(id, 1);
  });

  //
  //

  test('Deve executar updateDB com sucesso', () => {
    insertIntoDB(db, 'test', { id: 1, name: 'Test' });
    insertIntoDB(db, 'test', { id: 2, name: 'Test something' });

    updateDB(db, 'test', { name: 'Test updated' }, { id: 1 });

    const result = db.prepare('SELECT * FROM test').all() as any;

    assert.deepEqual(result, [
      { id: 1, name: 'Test updated' },
      { id: 2, name: 'Test something' },
    ]);
  });

  //
  //

  test('Deve dar erro em updateDB caso não passe propriedades', () => {
    insertIntoDB(db, 'test', { id: 1, name: 'Test' });

    assert.throws(
      () => updateDB(db, 'test', {}, { id: 1 }),
      'data must have at least one property',
    );

    assert.throws(
      () => updateDB(db, 'test', { name: 'Updated' }, {}),
      'where must have at least one property',
    );

    const result = db.prepare('SELECT * FROM test').all() as any;

    assert.deepEqual(result, [{ id: 1, name: 'Test' }]);
  });
});
