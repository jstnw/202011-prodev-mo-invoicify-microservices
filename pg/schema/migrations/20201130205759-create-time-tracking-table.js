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

exports.up = function (db) {
  return db.createTable('times', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    started_at: { type: 'datetime', notNull: true },
    ended_at: { type: 'datetime' },
    client_id: {
      type: 'int', notNull: true, foreignKey: {
        name: 'time_client_id',
        table: 'clients',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT',
        },
      }
    },
  });
};

exports.down = async function (db) {
  return db.dropTable('times');
};

exports._meta = {
  "version": 1
};
