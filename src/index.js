const path = require('path');

/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

function extendConf(conf) {
  conf.build.transpileDependencies.push(/quasar-app-extension-db-store[\\/]src/)
}

module.exports = function (api) {

  api.compatibleWith('quasar', '^1.8.0');
  api.compatibleWith('@quasar/app', '^1.5.0');

  api.extendQuasarConf(extendConf);
  api.chainWebpack(chain => chain.resolve.alias.set('db-store', path.resolve(__dirname, 'db-store.js')));

}
