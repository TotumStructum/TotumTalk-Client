import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import { createTransform } from "redux-persist";
import appReducer from "./slices/app";
import authReducer from "./slices/auth";
import conversationReducer from "./slices/conversation";

const resetRuntimeUiTransform = createTransform(
  (inboundState, key) => {
    if (key === "app") {
      return {
        ...inboundState,
        chat_type: null,
        room_id: null,
      };
    }

    if (key === "conversation") {
      return {
        ...inboundState,
        direct_chat: {
          ...inboundState.direct_chat,
          current_conversation: null,
          current_messages: [],
        },
      };
    }

    return inboundState;
  },
  (outboundState, key) => {
    if (key === "app") {
      return {
        ...outboundState,
        chat_type: null,
        room_id: null,
      };
    }

    if (key === "conversation") {
      return {
        ...outboundState,
        direct_chat: {
          ...outboundState.direct_chat,
          current_conversation: null,
          current_messages: [],
        },
      };
    }

    return outboundState;
  },
  { whitelist: ["app", "conversation"] },
);

const rootPeristConfig = {
  key: "root",
  storage,
  keyPrefix: "redux=",
  transforms: [resetRuntimeUiTransform],
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  conversation: conversationReducer,
});

export { rootPeristConfig, rootReducer };
