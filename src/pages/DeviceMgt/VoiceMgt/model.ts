import { Effect, Reducer } from 'umi';
import { getAllAgv } from './service';
// import { AgvState } from './data.d'
import { deleteVoiceById , updateVoiceById , insertVoice , getAllVoice } from './service';

export interface ModelType {
  namespace: string;
  state: {};
  effects: {
    fetchAllAgv: Effect;
    fetchAllVoice: Effect;
    fetchDeleteVoice: Effect;
    fetchInsertVoice: Effect;
    fetchUpdateVoice: Effect;
  };
  reducers: {
  };
}

const Model: ModelType = {
  namespace: 'voiceMgt',

  state:{
  },

  effects: {
    *fetchAllAgv(_, { call }) {
        _.callback(yield call(getAllAgv));
    },
    *fetchAllVoice(_, { call }) {
        _.callback(yield call(getAllVoice));
    },
    *fetchDeleteVoice(_, {  call }) {
        _.callback(yield call(deleteVoiceById,_.payload))
    },
    *fetchUpdateVoice(_, {  call }) {
      _.callback(yield call(updateVoiceById,_.payload))
  },
    *fetchInsertVoice(_, {  call }) {
        _.callback(yield call(insertVoice,_.payload))
    }
  },

  reducers: {
  },
};

export default Model;
