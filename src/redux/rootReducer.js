import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import { createTransform } from "redux-persist";
import appReducer from "./slices/app";
import authReducer from "./slices/auth";
import conversationReducer from "./slices/conversation";

//slices

const resetActiveChatTransform = createTransform(
  (inboundState, key) => {
    if (key !== "app") return inboundState;

    return {
      ...inboundState,
      chat_type: null,
      room_id: null,
    };
  },
  (outboundState, key) => {
    if (key !== "app") return outboundState;

    return {
      ...outboundState,
      chat_type: null,
      room_id: null,
    };
  },
  { whitelist: ["app"] },
);

const rootPeristConfig = {
  key: "root",
  storage,
  keyPrefix: "redux=",
  transforms: [resetActiveChatTransform],
  // whiteList: [],
  // blackList: [],
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  conversation: conversationReducer,
});

export { rootPeristConfig, rootReducer };
