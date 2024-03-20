import { Effect, Reducer } from 'umi';
import { getAllAgv } from './service';
import { getAllAction } from '@/services/common';
// import { AgvState } from './data.d'
import { deleteDeviceAgvByAgvId, insertAgv, updateDeviceAgvByAgvId, } from './service';
import { getDmCodeMapInfo } from '@/services/common';

export interface ModelType {
  namespace: string;
  state: {};
  effects: {
    fetchAllAgv: Effect;
    fetchAllAction: Effect;
    fetchAllCode: Effect;
    fetchDeleteAgv: Effect;
    fetchInsertAgv: Effect;
    fetchUpdateAgv: Effect;
  };
  reducers: {
  };
}

const Model: ModelType = {
  namespace: 'agvMgt',

  state: {
  },

  effects: {
    *fetchAllAgv(_, { call }) {
      _.callback(yield call(getAllAgv, _.payload))
    },
    *fetchAllAction(_, { call }) {
      _.callback(yield call(getAllAction, _.payload))
    },
    *fetchAllCode(_, { call }) {
      _.callback(yield call(getDmCodeMapInfo, _.payload))
    },
    *fetchDeleteAgv(_, { call }) {
      _.callback(yield call(deleteDeviceAgvByAgvId, _.payload))
    },
    *fetchInsertAgv(_, { call }) {
      _.callback(yield call(insertAgv, _.payload))
    },
    *fetchUpdateAgv(_, { call }) {
      _.callback(yield call(updateDeviceAgvByAgvId, _.payload))
    },

  },

  reducers: {
  },
};

export default Model;
