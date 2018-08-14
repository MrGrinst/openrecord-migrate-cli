const OpenrecordStore = require('./OpenrecordStore.js');

const OpenrecordMigration = fn => async next => {
  const store = await OpenrecordStore.getInstance();
  const Migration = { connection: store.connection, store };
  store.utils.mixin(Migration, store.mixinPaths, { only: 'migration' });
  store.utils.mixinCallbacks(Migration, {});

  if (process.env.OPENRECORD_MIGRATION_SETUP_FILE) {
    const setupFunction = require(process.env.OPENRECORD_MIGRATION_SETUP_FILE);
    try {
      await setupFunction();
      await runMigration();
    } catch (error) {
      errorAndExit(error);
    }
  } else {
    await runMigration();
  }

  async function runMigration() {
    await store.connection.transaction(async function(query) {
      Migration.connection = query;
      Migration.queue = [];

      try {
        await fn.call(Migration);
        await store.utils.series(Migration.queue);
      } catch (error) {
        errorAndExit(error);
      }
    });
  }
};

function errorAndExit(error) {
  console.error('Aborting migration due to error: ', error);
  process.exit();
}

module.exports = OpenrecordMigration;
