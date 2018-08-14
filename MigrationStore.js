const OpenrecordStore = require('./OpenrecordStore');

module.exports = function() {
  return {
    load: async callback => {
      const store = await OpenrecordStore.getInstance();

      async function createMigrationsTableIfNeeded() {
        const result = await store.connection.raw(
          "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'migrations');"
        );
        const exists = result.rows[0].exists;
        if (!exists) {
          await store.connection.raw('CREATE TABLE migrations (version varchar PRIMARY KEY);');
        }
      }

      await createMigrationsTableIfNeeded();

      store.Model('migrations', () => {});
      await store.ready();
      const Migrations = store.Model('migrations');
      try {
        const migrations = await Migrations;
        const mapped = migrations.map(m => {
          return { title: m.version, timestamp: Date.now() };
        });
        callback(null, { migrations: mapped });
      } catch (error) {
        callback(error);
      }
    },

    save: async (set, callback) => {
      const store = await OpenrecordStore.getInstance();
      store.Model('migrations', () => {});
      await store.ready();
      const Migrations = store.Model('migrations');
      const inserts = set.migrations.filter(m => !!m.timestamp).map(m => ({ version: m.title }));
      await Migrations.destroyAll();
      await Promise.all(inserts.map(migration => Migrations.create(migration)));
      callback();
    }
  };
};
