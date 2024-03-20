import { Effect, Reducer, Dispatch, Subscription } from 'umi';
import { getAllAgvStatus, getAllAbnormalList, createWebsocket, getAgvByAgvId } from './service';
import {
  getDmCodeMapInfo, getGridPointMapInfo, getDeviceList, getAllPortType,
  getAllDDL, getCodesOfPortType , getAllArea
} from '@/services/common';

import { StateType } from '@/components/MapPartComponents/data.d';
import { LOStorage } from '@/utils/utils';
import { wsHost } from '@/../config/proxy.ts'
const wsPort = wsHost.split('.')[1]

const pathListFilter = (pathList: Array<object>, addItem: { agvId: any }) => {
  let pathItemIdx = pathList.findIndex((item: any) => {
    return item.agvId === addItem.agvId
  })
  if (pathItemIdx !== -1) {
    pathList.splice(pathItemIdx, 1, addItem)
  } else {
    pathList.push(addItem)
  }
  return pathList
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchRcsMap: Effect;
    fetchDeviceList: Effect;
    fetchPortType: Effect;
    fetchAllDDL: Effect;
    fetchAllCodePortType: Effect;
    fetchAgvStatus: Effect;
    fetchAbnormalList: Effect;
    exceptionMessage: Effect;
    exceptionClose: Effect;
    nowLineMessage: Effect;
    nowLineClose: Effect;
    updatePathList: Effect;
    getAgvByAgvId: Effect;
    nowAgvMessage: Effect,
  };
  reducers: {
    unshiftExceptionList: Reducer<StateType>;
    setExceptionStatus: Reducer<StateType>;
    setNowLineStatus: Reducer<StateType>;
    orgPathList: Reducer<StateType>;
    setPathList: Reducer<StateType>;
    setNowAgvState: Reducer<StateType>;
  };
  subscriptions: {
    exceptionSocket: any;
    pathSocket: any;
    stateSocket: any
  }
}

const Model: ModelType = {
  namespace: 'homeAndMonitor',

  state: {
    dmCodeList: [],
    gridPointList: [],
    exceptionList: [],
    socketStatus: '',
    pathList: JSON.parse(LOStorage.getItem('wi_path_list')) || [],
    nowAgvState: []
  },

  effects: {
    *fetchRcsMap(_, { all, call }) {
      let [dmCode, gridPoint] = yield all([
        call(getDmCodeMapInfo),
        call(getGridPointMapInfo)
      ])
      _.callback(dmCode.Payload, gridPoint.Payload);
    },
    *fetchPortType(_, { call }) {
      _.callback(yield call(getAllPortType));
    },
    *fetchAllDDL(_, { call }) {
      _.callback(yield call(getAllDDL));
    },
    *fetchAllArea(_, { call }) {
      _.callback(yield call(getAllArea));
    },
    *fetchAllCodePortType(_, { call }) {
      _.callback(yield call(getCodesOfPortType));
    },
    *fetchDeviceList(_, { call }) {
      _.callback(yield call(getDeviceList));
    },
    *fetchAgvStatus(_, { call }) {
      _.callback(yield call(getAllAgvStatus));
    },
    *fetchAbnormalList(_, { call }) {
      _.callback(yield call(getAllAbnormalList));
    },
    *getAgvByAgvId(_, { call }) {
      _.callback(yield call(getAgvByAgvId, _.payload));
    },
    *exceptionMessage(_, { call, put }) {
      let dealData = _.payload.data
      if (dealData.charAt(0) === '{') {
        dealData = JSON.parse(dealData)
        yield put({
          type: 'unshiftExceptionList',
          payload: dealData,
        });
      }
    },
    *exceptionClose(_, { call, put }) {
      let status = 'close'
      if (typeof _.payload !== 'string') {
        status = 'error'
      }
      // yield put({
      //   type: 'setExceptionStatus',
      //   status: status,
      //   payload: _.payload,
      // });
    },
    *nowLineMessage(_, { call, put }) {
      let addData = _.payload.data
      if (addData.charAt(0) === '{') {
        addData = JSON.parse(addData)
        yield put({
          type: 'orgPathList',
          payload: addData,
        });
      }
    },
    *nowLineClose(_, { call, put }) {
      let status = 'close'
      if (typeof _.payload !== 'string') {
        status = 'error'
      }
      yield put({
        type: 'setNowLineStatus',
        status: status,
        payload: _.payload,
      });
    },
    *updatePathList(_, { call, put }) {
      yield put({
        type: 'setPathList',
        payload: _.payload,
      });
    },
    *nowAgvMessage(_, { call, put }) {
      yield put({
        type: 'setNowAgvState',
        payload: _.payload,
      });
    },
  },

  reducers: {
    unshiftExceptionList(state, { payload }) {              //填充异常数组
      let listArr = state ? state.exceptionList ? JSON.parse(JSON.stringify(state.exceptionList)) : [] : []
      function isHasObj(listArr: Array<Object>, payload: Object) {
        var flag = false;
        for (let i = 0; i < listArr.length; i++) {
          if (JSON.stringify(listArr[i]).indexOf(payload['deviceId']) != -1 && JSON.stringify(listArr[i]).indexOf(payload['errorType']) != -1) {
            flag = true;
          }
        }
        return flag
      }
      if (!isHasObj(listArr, payload)) {
        listArr.unshift(payload)
      }

      return {
        ...state,
        exceptionList: listArr.slice(0, 60)
      };
    },
    setExceptionStatus(state, { status, payload }) {        //设置异常socket的状态
      let exceptionLS = state ? state.exceptionList : []
      LOStorage.setItem('wi_exception_list', JSON.stringify(exceptionLS))
      return {
        ...state,
        socketStatus: status
      };
    },
    orgPathList(state, { payload }) {                      //组装线路列表
      let listArr = state ? state.pathList ? JSON.parse(JSON.stringify(state.pathList)) : [] : []
      let pathFilterBack = pathListFilter(listArr, payload)
      LOStorage.setItem('wi_path_list', JSON.stringify(pathFilterBack))
      return {
        ...state,
        pathList: JSON.parse(JSON.stringify(pathFilterBack)),
      };
    },
    setNowLineStatus(state, { status, payload }) {        //设置线路socket的状态
      let pathLS = state ? state.pathList : []
      LOStorage.setItem('wi_path_list', JSON.stringify(pathLS))
      return {
        ...state,
        pathList: JSON.parse(JSON.stringify(pathLS)),
        socketStatus: status,
      };
    },
    setPathList(state, { payload }) {        //设置线路socket的状态
      let pathLS = state ? state.pathList : []
      LOStorage.setItem('wi_path_list', JSON.stringify(pathLS))
      return {
        ...state,
        pathList: JSON.parse(JSON.stringify(pathLS)),
      };
    },
    setNowAgvState(state, { payload }) {
      //获取实时小车状态
      let nowAgvState = state ? state.nowAgvState : []
      if (payload.data == 'HEARTBEAT') {
      } else {
        let obj = JSON.parse(payload.data)
        let nowAgvStates = { actionLabel: '', agvId: '' }
        if (obj.actionGroupId) {
          nowAgvStates.actionLabel = obj.code + '  ' + obj.ddlName + '  '
          nowAgvStates.agvId = obj.agvId
          if (JSON.stringify(nowAgvState).indexOf(nowAgvStates.agvId) == -1) {
            nowAgvState.push(nowAgvStates)
          } else {
            for (let index = 0; index < nowAgvState.length; index++) {
              const element = nowAgvState[index];
              if (element.agvId == nowAgvStates.agvId && element.actionLabel != nowAgvStates.actionLabel) {
                nowAgvState[index] = nowAgvStates

              }
            }
          }
        }
        LOStorage.setItem('now_agv_state', JSON.stringify(nowAgvState))
      }
      return {
        ...state,
        nowAgvState: JSON.parse(JSON.stringify(nowAgvState)),
      };
    }
  },

  subscriptions: {
    exceptionSocket({ dispatch }: { dispatch: Dispatch }) { // 异常socket
      return createWebsocket((data: any) => {
        switch (data.state) {
          case 'success':
            if (data.cb === 'message') {
              dispatch({
                type: 'exceptionMessage',
                payload: data.payload
              })
            } else if (data.cb === 'close') {
              dispatch({
                type: 'exceptionClose',
                payload: data.payload
              })
            }
            break;
          case 'fail':
            dispatch({
              type: 'exceptionClose',
              payload: data.payload
            });
            break;
        }
      },
        wsPort, 'exception', new Date().getTime() + '')             //附加毫秒时间戳
    },
    pathSocket({ dispatch }: { dispatch: Dispatch }) {      // 路径socket
      return createWebsocket((data: any) => {
        switch (data.state) {
          case 'success':
            if (data.cb === 'message') {
              dispatch({
                type: 'nowLineMessage',
                payload: data.payload
              })
            } else if (data.cb === 'close') {
              dispatch({
                type: 'nowLineClose',
                payload: data.payload
              })
            }
            break;
          case 'fail':
            dispatch({
              type: 'nowLineClose',
              payload: data.payload
            });
            break;
        }
      }, wsPort, 'agvnowline', new Date().getTime() + '')
    },
    stateSocket({ dispatch }: { dispatch: Dispatch }) { // 小车实时状态socket
      return createWebsocket((data: any) => {
        switch (data.state) {
          case 'success':
            if (data.cb === 'message') {
              dispatch({
                type: 'nowAgvMessage',
                payload: data.payload
              })
            } else if (data.cb === 'close') {
              dispatch({
                type: 'nowAgvMessage',
                payload: data.payload
              })
            }
            break;
          case 'fail':
            dispatch({
              type: 'nowAgvMessage',
              payload: data.payload
            });
            break;
        }
      },
        wsPort, 'location', new Date().getTime() + '')             //附加毫秒时间戳
    },
  }
};

export default Model;
