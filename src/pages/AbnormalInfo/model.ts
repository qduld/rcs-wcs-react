import { Effect, Reducer } from 'umi';
// import { AgvState } from './data.d'
import { getAllAbnormalInfo , getRcsErrorType } from './service';

export interface ModelType {
  namespace: string;
  state: {};
  effects: {
    fetchAllAbnormal: Effect;
    getRcsErrorType: Effect;
  };
  reducers: {
  };
}

const Model: ModelType = {
  namespace: 'abnormalInfo',

  state:{
  },

  effects: {
    *fetchAllAbnormal(_, { call }) {
      _.callback(yield call(getAllAbnormalInfo));
    },
    *getRcsErrorType(_, { call }) {
      _.callback(yield call(getRcsErrorType));
    },
  },

  reducers: {
  },
};

export default Model;
