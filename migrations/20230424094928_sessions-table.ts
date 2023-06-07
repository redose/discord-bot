import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema
    .createTable('guilds', (table) => {
      table
        .text('id')
        .notNullable()
        .unique()
        .primary();

      table.text('announcementsChannelId');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })

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
        .inTable('users');

      table
        .text('guildId')
        .notNullable()
        .references('id')
        .inTable('guilds');

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
        .inTable('users');

      table
        .text('contactId')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('emergencyAlerts', (table) => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .text('targetUserId')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .text('guildId')
        .notNullable()
        .references('id')
        .inTable('guilds');

      table
        .text('channelId')
        .notNullable();

      table.text('description');

      table
        .text('createdBy')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .text('closedBy')
        .references('id')
        .inTable('users');

      table.timestamp('closedAt');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })

    .createTable('userNotes', (table) => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('users');

      table.text('channelId');

      table
        .text('content')
        .notNullable();

      table
        .boolean('deleted')
        .notNullable()
        .defaultTo(false);

      table
        .timestamp('updatedAt')
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .text('createdBy')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTableIfExists('userNotes')
    .dropTableIfExists('emergencyContacts')
    .dropTableIfExists('webSessions')
    .dropTableIfExists('users')
    .dropTableIfExists('guilds');

  await knex.raw('DROP TYPE IF EXISTS "emergency_contact_policy"');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}
