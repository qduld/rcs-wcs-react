import { Effect, Reducer , Dispatch } from 'umi';
import { getAgvPathList , getSupplementaryDeviceStatus , createWebsocket } from './service';
import { getDmCodeMapInfo, getGridPointMapInfo, getDeviceList } from '@/services/common';
import { routerRedux } from 'dva';

import { StateType } from '@/components/MapPartComponents/data.d'

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchRcsMap: Effect;
    fetchDeviceList: Effect;
    redirectDeviceList: Effect;
    fetchAgvPathList: Effect;
    fetchSupplementaryDeviceStatus: Effect;
    supplySocket: Effect;
    supplyMessage: Effect;
    supplyClose: Effect;
  };
  reducers: {
  };
  subscriptions:{
  }
}

const Model: ModelType = {
  namespace: 'deviceAndMonitor',

  state:{
    dmCodeList:[],
    gridPointList:[],
    portTypeList:[],
    ddlList:[],
    socketObj: Object
  },

  effects: {
    *fetchRcsMap(_, { all, call }) {
        let [dmCode, gridPoint]  = yield all([
            call(getDmCodeMapInfo),
            call(getGridPointMapInfo)
        ])
        _.callback(dmCode.Payload,gridPoint.Payload);
    },
    *fetchDeviceList(_, { call }) {
      _.callback(yield call(getDeviceList));
    },
    *redirectDeviceList(_, { put }) {
       yield put(routerRedux.push('/deviceMgt/agvmgt'))
    },
    *fetchAgvPathList(_, { call }) {
       _.callback(yield call(getAgvPathList,_.payload));
    },
    *fetchSupplementaryDeviceStatus(_, { call }){
       _.callback(yield call(getSupplementaryDeviceStatus));
    },
    *supplySocket(_, { call }){
        
    },
    *supplyMessage(_, { call }){
      _.callback(yield call(getSupplementaryDeviceStatus));
    },
    *supplyClose(_, { call }){
      _.callback(yield call(getSupplementaryDeviceStatus));
    },
  },
  subscriptions:{
  },
  reducers: {
  }
};

export default Model;
