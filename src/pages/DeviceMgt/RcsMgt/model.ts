import { Effect, Reducer } from 'umi';
// import { AgvState } from './data.d'
import { deleteDeviceRcsById , insertDeviceRcs , updateDeviceRcsById , getAllDeviceRcs } from './service';

export interface ModelType {
  namespace: string;
  state: {};
  effects: {
    fetchAllDeviceRcs: Effect;
    fetchDeleteDeviceRcs: Effect;
    fetchInsertDeviceRcs: Effect;
    fetchUpdateDeviceRcs: Effect;
  };
  reducers: {
  };
}

const Model: ModelType = {
  namespace: 'rcsMgt',

  state:{
  },

  effects: {
    *fetchAllDeviceRcs(_, { call }) {
        _.callback(yield call(getAllDeviceRcs));
    },
    *fetchDeleteDeviceRcs(_, {  call }) {
        _.callback(yield call(deleteDeviceRcsById,_.payload))
    },
    *fetchInsertDeviceRcs(_, {  call }) {
      _.callback(yield call(insertDeviceRcs,_.payload))
    },
    *fetchUpdateDeviceRcs(_, {  call }) {
      _.callback(yield call(updateDeviceRcsById,_.payload))
    }
  },

  reducers: {
  },
};

export default Model;
