import { Effect, Reducer } from 'umi';

import { 
    getAllUserInfo ,
    getAllRole , 
    getUserInfoById , 
    deleteUserInfo ,
    saveUserInfo ,
    updateUserInfo ,
} from './service';

import { 
    getDmCodeMapInfo ,
    getAllAction ,
} from '@/services/common';

const Model = {
    namespace: 'userMgt',
  
    state:{
    },
  
    effects: {
      *fetchAllUser(_, { call }) {
          _.callback(yield call(getAllUserInfo,_.payload))
      },
      *fetchAllRole(_, {  call }){
          _.callback(yield call(getAllRole,_.payload))
      },
      *fetchUserInfoById(_, {  call }){
          _.callback(yield call(getUserInfoById,_.payload))
      },
      *fetchDeleteUser(_, {  call }) {
          _.callback(yield call(deleteUserInfo,_.payload))
      },
      *fetchSaveUser(_, {  call }) {
          _.callback(yield call(saveUserInfo,_.payload))
      },
      *fetchUpdateUser(_, {  call }) {
          _.callback(yield call(updateUserInfo,_.payload))
      },
    },
  
    reducers: {
    },
};

export default Model;