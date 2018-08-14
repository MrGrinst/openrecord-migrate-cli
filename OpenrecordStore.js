const openrecordConfig = require(process.cwd() + '/.migration-config.js')()
const Store = require(openrecordConfig.storePath)

module.exports = (function () {
  let instance;

  async function createInstance() {
    const store = new Store(openrecordConfig.storeConfig);
    await store.ready()
    return store
  }

  return {
    getInstance: async function() {
      if (!instance) {
        try {
          instance = await createInstance()
          return instance
        } catch (error) {
          console.log(error);
          exit();
        }
      } else {
        return instance
      }
    }
  };
})();

