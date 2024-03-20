import { Effect, Reducer } from 'umi';

import { 
    getListInstance ,

} from './service';

import { 
    getDmCodeMapInfo ,
    getAllAction ,
} from '@/services/common';


const Model = {
    namespace: 'chargeMgt',
  
    state:{
    },
  
    effects: {
      *fetchListInstance(_, { call }) {
          _.callback(yield call(getListInstance,_.payload))
      },
    },
  
    reducers: {
    },
};

export default Model;