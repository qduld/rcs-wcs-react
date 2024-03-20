import { Effect, Reducer } from 'umi';
// import { AgvState } from './data.d'
import { deleteChargerPileById , insertChargerConfig , updateChargerPileById , getAllChargerPile } from './service';

export interface ModelType {
  namespace: string;
  state: {};
  effects: {
    fetchAllChargerPile: Effect;
    fetchDeleteChargerPile: Effect;
    fetchInsertChargerPile: Effect;
    fetchUpdateChargerPile: Effect;
  };
  reducers: {
  };
}

const Model: ModelType = {
  namespace: 'configInfoMgt',

  state:{
  },

  effects: {
    *fetchAllChargerPile(_, { call }) {
      _.callback(yield call(getAllChargerPile));
    },
    *fetchDeleteChargerPile(_, {  call }) {
        _.callback(yield call(deleteChargerPileById,_.payload))
    },
    *fetchInsertChargerPile(_, {  call }) {
      _.callback(yield call(insertChargerConfig,_.payload))
    },
    *fetchUpdateChargerPile(_, {  call }) {
      _.callback(yield call(updateChargerPileById,_.payload))
    }
  },

  reducers: {
  },
};

export default Model;
