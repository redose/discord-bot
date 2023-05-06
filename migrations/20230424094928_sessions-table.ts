import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema
    .createTable('users', (table) => {
      table
        .text('id')
        .notNullable()
        .unique()
        .primary();

      table.text('emergencyNotes');
      table.timestamp('emergencyNotesLastUpdatedAt');

      table
        .enum('emergencyContactPolicy', [
          'WHITELIST_ONLY',
          'WHITELIST_AND_STAFF',
          'DISABLED',
        ], {
          useNative: true,
          enumName: 'emergency_contact_policy',
        })
        .notNullable()
        .defaultTo('DISABLED');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('webSessions', (table) => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      table.timestamp('loggedOutAt');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('emergencyContacts', (table) => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      table
        .text('contactId')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      table.string('email', 320);

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTableIfExists('emergencyContacts')
    .dropTableIfExists('webSessions')
    .dropTableIfExists('users');

  await knex.raw('DROP TYPE IF EXISTS "emergency_contact_policy"');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}
