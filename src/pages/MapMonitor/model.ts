import { Effect, Reducer } from 'umi';
import { insertOrUpdateAction , simulationPath , beginSimulation , deleteActionGroup , saveCmdTemplate , getAllCmdTemplate , deleteCmdTemplate } from './service';
import { getDmCodeMapInfo, getGridPointMapInfo, getDeviceList, getAllPortType ,
   getAllDDL , getCodesOfPortType , getAllDoor , getAllChargePile , getIdleAgv , getSimulateAgv , findMapDistance , getAllAction } from '@/services/common';

import { StateType } from './data.d'

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchRcsMap: Effect;
    fetchDeviceList: Effect;
    fetchPortType: Effect;
    fetchAllDDL: Effect;
    fetchAllCodePortType: Effect;
    fetchDoor: Effect;
    fetchChargePile: Effect;
    fetchIdleAgv: Effect;
    fetchSimulateAgv: Effect;
    fetchAllAction: Effect;
    saveAction: Effect;
    genPath: Effect;
    startSimulation: Effect;
    deleteActionGroup: Effect;
    saveCmdTemplate: Effect;
    getAllCmdTemplate: Effect;
    deleteCmdTemplate: Effect;
  };
  reducers: {
    show: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'mapAndMonitor',

  state:{
    dmCodeList:[],
    gridPointList:[],
    portTypeList:[],
    ddlList:[]
  },

  effects: {
    *fetchRcsMap(_, { all, call }) {
        let [dmCode, gridPoint]  = yield all([
            call(getDmCodeMapInfo),
            call(getGridPointMapInfo)
        ])
        _.callback(dmCode.Payload,gridPoint.Payload);
    },
    *fetchPortType(_, { call }) {
      _.callback(yield call(getAllPortType));
    },
    *fetchAllDDL(_, { call }) {
      _.callback(yield call(getAllDDL));
    },
    *fetchAllCodePortType(_, { call }) {
      _.callback(yield call(getCodesOfPortType));
    },
    *fetchDoor(_, { call }) {
      _.callback(yield call(getAllDoor));
    },
    *fetchChargePile(_, { call }) {
      _.callback(yield call(getAllChargePile));
    },
    *fetchDeviceList(_, { call }) {
      _.callback(yield call(getDeviceList));
    },
    *fetchIdleAgv(_, { call }) {
      _.callback(yield call(getIdleAgv));
    },
    *fetchSimulateAgv(_, { call }) {
      _.callback(yield call(getSimulateAgv,_.payload));
    },
    *startSimulation(_, { call }) {
      _.callback(yield call(beginSimulation,_.payload));
    },
    *saveAction(_, { call }) {
      _.callback(yield call(insertOrUpdateAction,_.payload));
    },
    *genPath(_, { call , all }) {      //生成线路返回动作集和路径
      let mapObj = {fromCode:_.payload.startCode,toCode:_.payload.endCode}
      let reqStr = ''
      Object.entries(mapObj).map((item:any,idx:number)=>{
           reqStr+=item[0]+'='+item[1]+'&'
      })
      reqStr.substr(0,reqStr.length-1)
      let [actionList, codeList]  = yield all([
        call(simulationPath,_.payload),
        call(findMapDistance,reqStr)
      ])
      _.callback(actionList,codeList);
    },
    *fetchAllAction(_, { call }) {
      _.callback(yield call(getAllAction));
    },
    *deleteActionGroup(_, { call }) {
      _.callback(yield call(deleteActionGroup,_.payload));
    },
    *saveCmdTemplate(_, { call }){
      _.callback(yield call(saveCmdTemplate,_.payload));
    },
    *getAllCmdTemplate(_, { call }){
      _.callback(yield call(getAllCmdTemplate));
    },
    *deleteCmdTemplate(_, { call }){
      _.callback(yield call(deleteCmdTemplate,_.payload));
    },
  },

  reducers: {
    show(state, { payload }) {
      return {
        dmCodeList:payload[0],
        gridPointList:payload[1]
      };
    },
  }
};

export default Model;
