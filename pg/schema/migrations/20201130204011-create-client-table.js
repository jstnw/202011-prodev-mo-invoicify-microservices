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
  return db.createTable('clients', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    name: { type: 'string', notNull: true },
    person_id: {
      type: 'int', notNull: true, foreignKey: {
        name: 'client_person_id',
        table: 'people',
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
  return db.dropTable('clients');
};

exports._meta = {
  "version": 1
};
