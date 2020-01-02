import {
  PUSH_DOC_INFO_LIST,
  SET_DOC_INFO_LIST
} from './actionTypes'

const defaultState = {
  storedDocInfoList: [],
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case PUSH_DOC_INFO_LIST:
      state.storedDocInfoList.push(action.payload);
      return {
        ...state
      }
    case SET_DOC_INFO_LIST:
      const {index, docInfo} = action.payload;
      state.storedDocInfoList[index] = docInfo;
      return {
        ...state
      }
    default: 
      return state;
  }
}