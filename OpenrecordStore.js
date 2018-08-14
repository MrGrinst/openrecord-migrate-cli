const { getStore } = require(process.cwd() + '/.migration-config.js');

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
          console.log(error);
          exit();
        }
      } else {
        return instance;
      }
    }
  };
})();
