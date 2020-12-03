'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.createTable('invoice_statuses', {
    id: { type: 'int', primaryKey: true },
    name: { type: 'string', notNull: true },
  });

  await db.insert('invoice_statuses', ['id', 'name'], [1, 'Created']);
  await db.insert('invoice_statuses', ['id', 'name'], [2, 'Generated']);
  await db.insert('invoice_statuses', ['id', 'name'], [3, 'Closed']);
};

exports.down = async function (db) {
  return db.dropTable('invoice_statuses');
};

exports._meta = {
  "version": 1
};
