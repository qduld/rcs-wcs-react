import { Effect, Reducer } from 'umi';
// import { AgvState } from './data.d'
import { getAllSupplementary , deleteSupplementaryById , updateSupplementaryById , insertSupplementary } from './service';

export interface ModelType {
  namespace: string;
  state: {};
  effects: {
    fetchAllSupple: Effect;
    fetchDeleteSupple: Effect;
    fetchInsertSupple: Effect;
    fetchUpdateSupple: Effect;
  };
  reducers: {
  };
}

const Model: ModelType = {
  namespace: 'supplementaryMgt',

  state:{
  },

  effects: {
    *fetchAllSupple(_, { call }) {
        _.callback(yield call(getAllSupplementary));
    },
    *fetchDeleteSupple(_, {  call }) {
        _.callback(yield call(deleteSupplementaryById,_.payload))
    },
    *fetchInsertSupple(_, {  call }) {
        _.callback(yield call(insertSupplementary,_.payload))
    },
    *fetchUpdateSupple(_, {  call }) {
      _.callback(yield call(updateSupplementaryById,_.payload))
  }
  },

  reducers: {
  },
};

export default Model;
