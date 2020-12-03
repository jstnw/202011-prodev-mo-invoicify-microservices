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
  await db.createTable('people', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    email: { type: 'string', unique: true, notNull: true },
    password_hash: { type: 'string', notNull: true },
  });

  await db.addIndex('people', 'people_email_index', ['email']);
};

exports.down = async function (db) {
  return db.dropTable('people');
};

exports._meta = {
  "version": 1
};
