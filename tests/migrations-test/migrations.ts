import ts1 from './002-blureal';

export default [
  {
    "file": "001-facal",
    "migration": "CREATE TABLE users (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  email TEXT NOT NULL,\n  password TEXT NOT NULL,\n  created_at TEXT NOT NULL,\n  updated_at TEXT NOT NULL\n);\n"
  },
  {
    "file": "002-blureal",
    "migration": ts1
  }
];