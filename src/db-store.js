import Vue from 'vue';
import API from 'db-api';
import { User } from 'models';
import localforage from 'localforage';

export default {
  state: {
    user: {},
    rowsLimit: 1000,
    dicts: {},
    packageProductName: JSON.parse(unescape(process.env.PACKAGE_JSON)).productName,
    packageVersion: JSON.parse(unescape(process.env.PACKAGE_JSON)).version,
    packageAuthor: JSON.parse(unescape(process.env.PACKAGE_JSON)).author,
    packageHomepage: JSON.parse(unescape(process.env.PACKAGE_JSON)).homepage
  },
  getters: {
    USER: (state) => state.user,
    ROWS_LIMIT: (state) => state.rowsLimit,
    DICTS: (state) => state.dicts,
    DICT: (state, getters) => (dictName) => getters.DICTS[dictName] || [],
    PACKAGE_PRODUCT_NAME: (state) => state.packageProductName,
    PACKAGE_VERSION: (state) => state.packageVersion,
    PACKAGE_AUTHOR: (state) => state.packageAuthor,
    PACKAGE_HOMEPAGE: (state) => state.packageHomepage
  },
  mutations: {
    SET_USER: (state, user) => {
      state.user = new User(user);
    },
    SET_ROWS_LIMIT: (state, rowsLimit) => {
      state.rowsLimit = rowsLimit;
    },
    SET_DICTS: (state, dicts) => {
      state.dicts = dicts;
    },
    SET_DICT: (state, dict) => {
      Vue.set(state.dicts, dict.name, Object.freeze(dict.node));
    },
    SET_PROPS(state, prop, val) {
      Vue.set(state, prop, val);
    }
  },
  actions: {

    // SETTERS

    SET_USER: async (ctx, user) => {
      ctx.commit('SET_USER', await API.router.getUser());
    },
    SET_ROWS_LIMIT: async (ctx, rowsLimit) => {
      ctx.commit('SET_ROWS_LIMIT', await API.router.getMaxRows());
    },
    SET_DICTS: async (ctx, dicts) => {

      Object.assign(dicts, ctx.rootState.dicts);

      localforage.config({
        name: 'IPNPDB',
        version: 10,
        storeName: 'dictionaries'
      });

      for (const dictName in dicts) {

        let dict = await localforage.getItem(dictName);
        if (dict === null) {
          dict = await API.dict.total(dictName);
          await localforage.setItem(dictName, {...dict.meta, node: dict.node});
        } else {
          //TODO: review dict async parallel...
        }
        ctx.commit('SET_DICT', {name: dictName, node: dict.node});
      }
    },
    SET_DICT: (ctx, dict) => {
      ctx.commit('SET_DICT', dict);
    },
    SET_PROPS: (ctx, payload) => {
      ctx.commit('SET_PROPS', payload.prop, payload.val);
    },

    // GETTERS

    /*LOAD_DICTS: async (ctx, lang) => {
     const dicts = await API.dict.dicts(Object.keys(ctx.getters.DICTS), lang);

     localforage.config({
     name: 'IPNPDB',
     version: 10,
     storeName: 'dictionaries'
     });

     for (const dictName in dicts) {
     ctx.commit('SET_DICT', {name: dictName, node: dicts[dictName].node});
     await localforage.setItem(dictName, {
     ...dicts[dictName].meta,
     node: dicts[dictName].node
     });
     }
     },

     LOAD_DICT: async (ctx, dictName) => {
     const dict = await API.dict.total(dictName);
     ctx.commit('SET_DICT', {name: dictName, node: dict.node});
     await localforage.setItem(dictName, {
     ...dict.meta,
     node: dict.node
     });

     } */
  }
};
