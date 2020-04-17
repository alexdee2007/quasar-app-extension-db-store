import Vue from 'vue';
import API from 'db-api';
import { User } from 'models';

export default {
  state: {
    user: {},
    rowsLimit: 1000,
    dicts: {},
    modelsRelations: {},
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
    MODELS_RELATIONS: (state) => state.modelsRelations,
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
    SET_MODELS_RELATIONS: (state, modelsRelations) => {
      state.modelsRelations = modelsRelations;
    },
    SET_PROPS(state, prop, val) {
      Vue.set(state, prop, val);
    }
  },
  actions: {

    // SETTERS

    SET_USER: (ctx, user) => {
      ctx.commit('SET_USER', user);
    },
    SET_ROWS_LIMIT: (ctx, rowsLimit) => {
      ctx.commit('SET_ROWS_LIMIT', rowsLimit);
    },
    SET_DICTS: (ctx, dicts) => {
      Object.assign(dicts, ctx.rootState.dicts); // merge app dicts also
      for (const dictName in dicts) {
        ctx.commit('SET_DICT', {name: dictName, node: dicts[dictName]})
      }
    },
    SET_DICT: (ctx, dict) => {
      ctx.commit('SET_DICT', dict);
    },
    SET_PROPS: (ctx, payload) => {
      ctx.commit('SET_PROPS', payload.prop, payload.val);
    },

    // GETTERS

    GET_USER: async (ctx) => {
      ctx.commit('SET_USER', await API.router.getUser());
    },
    GET_ROWS_LIMIT: async (ctx) => {
      ctx.commit('SET_ROWS_LIMIT', await API.router.getMaxRows());
    },
    GET_DICTS: async (ctx, lang) => {
      const dicts = await API.dict.dicts(Object.keys(ctx.getters.DICTS), lang);
      for (const dictName in dicts) {
        ctx.commit('SET_DICT', {name: dictName, node: dicts[dictName].node});
      }
    },
    GET_DICT: async (ctx, dictName) => {
      const dict = await API.dict.total(dictName);
      ctx.commit('SET_DICT', {name: dictName, node: dict.node});
    },
    GET_MODELS_RELATIONS: async (ctx) => {
      ctx.commit('SET_MODELS_RELATIONS', await API.router.getModelsRelations());
    }
  }
};
