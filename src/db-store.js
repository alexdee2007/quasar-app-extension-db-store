import Vue from 'vue';
import API from 'db-api';
import { User } from 'models';
import db from './db-dictionaries';

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
    SET_PROPS(state, prop, val) { // helper
      Vue.set(state, prop, val);
    }
  },
  actions: {

    fetchUser: async (ctx, user) => {
      ctx.commit('SET_USER', await API.router.getUser());
    },

    fetchRowsLimit: async (ctx, rowsLimit) => {
      ctx.commit('SET_ROWS_LIMIT', await API.router.getMaxRows());
    },

    fetchDicts: async (ctx, dicts) => {
      Object.assign(dicts, ctx.rootState.dicts);
      await Promise.all(Object.keys(dicts).map(dictName => ctx.dispatch('fetchDict', dictName)));
    },

    fetchDict: async (ctx, dictName) => {

      const [name, language = 'UK'] = dictName.split(',');

      let dict = await db.dictionaries.get({name, language}); // fetch from storage
      if (!dict) {
        dict = await API.dict.total(name, language);
        await db.dictionaries.put({...dict.meta, node: dict.node});
        ctx.commit('SET_DICT', {name: dictName, node: dict.node});
      } else {
        ctx.commit('SET_DICT', {name: dictName, node: dict.node});
        ctx.dispatch('reviewDict', {dictName, dict});
      }
    },

    reviewDict: async(ctx, {dictName, dict}) => {
      const reviewData = await API.dict.review(dict.name, dict.language, dict.hash); // review dict
      if (reviewData.hash !== dict.hash) {
        await db.dictionaries.put({...reviewData.meta, node: reviewData.node});
        ctx.commit('SET_DICT', {name: dictName, node: reviewData.node});
    }
    }
  }

};
