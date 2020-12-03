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
  await db.createTable('invoice_items', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    invoice_id: {
      type: 'int', notNull: true, foreignKey: {
        name: 'invoices_invoice_item_id',
        table: 'invoices',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT',
        },
      }
    },
    item_id: {
      type: 'int', notNull: true, foreignKey: {
        name: 'times_invoice_item_id',
        table: 'times',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT',
        },
      }
    },
  });

  await db.addIndex('invoice_items', 'invoice_items_unique', ['invoice_id', 'item_id'], true);
};

exports.down = async function (db) {
  return db.dropTable('invoice_items');
};
exports._meta = {
  "version": 1
};
