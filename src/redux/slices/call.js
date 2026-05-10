import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: "idle", // idle | outgoing | incoming | active
  call: null,
  started_at: null,
  error: null,
};

const normalizeCall = (call = {}) => ({
  call_id: call.call_id || call.callId || "",
  conversation_id: call.conversation_id || call.conversationId || "",
  call_type: call.call_type || call.callType || "audio",
  peer: call.peer || call.from || call.to || null,
  from: call.from || null,
  to: call.to || null,
});

const slice = createSlice({
  name: "call",
  initialState,
  reducers: {
    startOutgoingCall(state, action) {
      state.status = "outgoing";
      state.call = normalizeCall(action.payload.call);
      state.error = null;
    },
    receiveIncomingCall(state, action) {
      state.status = "incoming";
      state.call = normalizeCall(action.payload.call);
      state.error = null;
    },
    acceptCall(state, action) {
      state.status = "active";
      state.started_at = Date.now();

      if (action.payload?.call) {
        state.call = {
          ...state.call,
          ...normalizeCall(action.payload.call),
          peer:
            state.call?.peer ||
            action.payload.call.peer ||
            action.payload.call.from ||
            action.payload.call.to ||
            null,
        };
      }

      state.error = null;
    },
    declineCall(state) {
      state.status = "idle";
      state.call = null;
      state.error = null;
      state.started_at = null;
    },
    cancelCall(state) {
      state.status = "idle";
      state.call = null;
      state.error = null;
      state.started_at = null;
    },
    endCall(state) {
      state.status = "idle";
      state.call = null;
      state.error = null;
      state.started_at = null;
    },
    resetCall(state) {
      state.status = "idle";
      state.call = null;
      state.error = null;
      state.started_at = null;
    },
    setCallError(state, action) {
      state.error = action.payload.message;
      state.status = "idle";
      state.call = null;
      state.started_at = null;
    },
  },
});

export default slice.reducer;

export const StartOutgoingCall =
  ({ call }) =>
  (dispatch) => {
    dispatch(slice.actions.startOutgoingCall({ call }));
  };

export const ReceiveIncomingCall =
  ({ call }) =>
  (dispatch) => {
    dispatch(slice.actions.receiveIncomingCall({ call }));
  };

export const AcceptCall =
  ({ call } = {}) =>
  (dispatch) => {
    dispatch(slice.actions.acceptCall({ call }));
  };

export const DeclineCall = () => (dispatch) => {
  dispatch(slice.actions.declineCall());
};

export const CancelCall = () => (dispatch) => {
  dispatch(slice.actions.cancelCall());
};

export const EndCall = () => (dispatch) => {
  dispatch(slice.actions.endCall());
};

export const ResetCall = () => (dispatch) => {
  dispatch(slice.actions.resetCall());
};

export const SetCallError =
  ({ message }) =>
  (dispatch) => {
    dispatch(slice.actions.setCallError({ message }));
  };
