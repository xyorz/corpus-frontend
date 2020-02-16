import {
  PUSH_DOC_INFO_LIST,
  SET_DOC_INFO_LIST,
  DEL_DOC_INFO_LIST,
  SET_USER_INFO
} from './actionTypes'

const defaultState = {
  storedDocInfoList: [],
  userInfo: {}
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case PUSH_DOC_INFO_LIST:
      state.storedDocInfoList.push(action.payload);
      return {
        ...state
      };
    case SET_DOC_INFO_LIST:
      const {index, docInfo} = action.payload;
      state.storedDocInfoList[index] = docInfo;
      return {
        ...state
      };
    case DEL_DOC_INFO_LIST:
      state.storedDocInfoList.splice(action.payload);
      return {
        ...state
      };
    case SET_USER_INFO:
      const userInfo = action.payload;
      state.userInfo = userInfo;
      return {
        ...state
      };
    default: 
      return state;
  }
}