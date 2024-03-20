import { Effect, Reducer } from 'umi';
import { getActionByCode } from '../service';

export interface ActionState {
    actionList:[]
}

export interface ModelType {
  namespace: string;
  state: ActionState;
  effects: {
    fetchActionByCode: Effect;
  };
  reducers: {
    setAction: Reducer<ActionState>;
  };
}

const Model: ModelType = {
    namespace: 'mapAndCanvas',

    state:{
        actionList:[]
    },

    effects: {
        *fetchActionByCode(_, { call, put }) {
            const repData = yield call(getActionByCode,_.payload);
            _.callback(repData);      
            // yield put({
            //     type: 'setAction',
            //     payload: repData,
            // });
        },
    },

    reducers: {
        setAction(state, { payload }) {
            return {
                ...state,
                actionList: payload
            };
        }
    }
};

export default Model;
