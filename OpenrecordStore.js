const EXPECTED_CONFIG_PATHS = ['/', '/src/', '/app/'];

function getStore() {
  let get;
  for (i in EXPECTED_CONFIG_PATHS) {
    const path = EXPECTED_CONFIG_PATHS[i];
    try {
      get = require(process.cwd() + path + '.migration-config.js').getStore;
      break;
    } catch (_) {}
  }
  if (!get) {
    const expectedPathsFormatted = EXPECTED_CONFIG_PATHS.map(p => `'${p}'`).join(', ');
    console.error(
      `Expected .migration-config.js to exist in one of the following directories: ${expectedPathsFormatted}.`
    );
    process.exit(1);
  } else {
    return get();
  }
}

module.exports = (function() {
  let instance;

  async function createInstance() {
    const store = getStore();
    await store.ready();
    return store;
  }

  return {
    getInstance: async function() {
      if (!instance) {
        try {
          instance = await createInstance();
          return instance;
        } catch (error) {
          console.error(error);
          process.exit(1);
        }
      } else {
        return instance;
      }
    }
  };
})();
