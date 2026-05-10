import { configureStore } from "@reduxjs/toolkit";
import callReducer, {
  AcceptCall,
  CancelCall,
  DeclineCall,
  EndCall,
  ReceiveIncomingCall,
  SetCallError,
  StartOutgoingCall,
  FetchCallLogs,
  UpsertCallLog,
} from "./call";

import axios from "../../utils/axios";

jest.mock("../../utils/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const createStore = () =>
  configureStore({
    reducer: {
      call: callReducer,
      auth: () => ({
        token: "token-123",
      }),
    },
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("call slice", () => {
  it("starts outgoing call", () => {
    const store = createStore();

    store.dispatch(
      StartOutgoingCall({
        call: {
          call_id: "call-1",
          conversation_id: "conversation-1",
          call_type: "video",
          peer: {
            _id: "user-b",
            name: "John Doe",
          },
        },
      }),
    );

    const state = store.getState().call;

    expect(state.status).toBe("outgoing");
    expect(state.direction).toBe("outgoing");
    expect(state.call.call_id).toBe("call-1");
    expect(state.call.call_type).toBe("video");
    expect(state.call.peer.name).toBe("John Doe");
  });

  it("receives incoming call", () => {
    const store = createStore();

    store.dispatch(
      ReceiveIncomingCall({
        call: {
          call_id: "call-2",
          conversation_id: "conversation-1",
          call_type: "audio",
          from: {
            _id: "user-b",
            firstName: "Jane",
            lastName: "Doe",
          },
        },
      }),
    );

    const state = store.getState().call;

    expect(state.status).toBe("incoming");
    expect(state.direction).toBe("incoming");
    expect(state.call.peer.firstName).toBe("Jane");
  });

  it("accepts call", () => {
    const store = createStore();

    store.dispatch(
      ReceiveIncomingCall({
        call: {
          call_id: "call-3",
          conversation_id: "conversation-1",
          call_type: "audio",
          from: {
            _id: "user-b",
            firstName: "Jane",
          },
        },
      }),
    );

    store.dispatch(AcceptCall());

    expect(store.getState().call.status).toBe("active");
    expect(store.getState().call.started_at).toEqual(expect.any(Number));
  });

  it("clears call on decline cancel and end", () => {
    const store = createStore();

    store.dispatch(
      StartOutgoingCall({
        call: {
          call_id: "call-4",
          conversation_id: "conversation-1",
          call_type: "audio",
          peer: {
            _id: "user-b",
          },
        },
      }),
    );

    store.dispatch(CancelCall());
    expect(store.getState().call.status).toBe("idle");

    store.dispatch(
      ReceiveIncomingCall({
        call: {
          call_id: "call-5",
          conversation_id: "conversation-1",
          call_type: "audio",
          from: {
            _id: "user-b",
          },
        },
      }),
    );

    store.dispatch(DeclineCall());
    expect(store.getState().call.status).toBe("idle");

    store.dispatch(
      StartOutgoingCall({
        call: {
          call_id: "call-6",
          conversation_id: "conversation-1",
          call_type: "audio",
          peer: {
            _id: "user-b",
          },
        },
      }),
    );

    store.dispatch(AcceptCall());
    store.dispatch(EndCall());

    expect(store.getState().call.status).toBe("idle");
    expect(store.getState().call.call).toBeNull();
    expect(store.getState().call.started_at).toBeNull();
    expect(store.getState().call.direction).toBeNull();
  });

  it("stores call error and clears active call", () => {
    const store = createStore();

    store.dispatch(
      StartOutgoingCall({
        call: {
          call_id: "call-7",
          conversation_id: "conversation-1",
          call_type: "audio",
          peer: {
            _id: "user-b",
          },
        },
      }),
    );

    store.dispatch(SetCallError({ message: "User is offline" }));

    expect(store.getState().call.status).toBe("idle");
    expect(store.getState().call.call).toBeNull();
    expect(store.getState().call.error).toBe("User is offline");
  });

  it("fetches call logs from API", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        status: "success",
        data: [
          {
            _id: "log-1",
            call_id: "call-1",
            call_type: "audio",
            status: "completed",
            createdAt: "2026-05-10T10:00:00.000Z",
          },
        ],
      },
    });

    const store = createStore();

    await store.dispatch(FetchCallLogs());

    expect(axios.get).toHaveBeenCalledWith("/call/logs", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
    });

    expect(store.getState().call.logs).toHaveLength(1);
    expect(store.getState().call.logs[0].call_id).toBe("call-1");
  });

  it("upserts call log from socket update", () => {
    const store = createStore();

    store.dispatch(
      UpsertCallLog({
        log: {
          _id: "log-1",
          call_id: "call-1",
          status: "ringing",
          createdAt: "2026-05-10T10:00:00.000Z",
        },
      }),
    );

    store.dispatch(
      UpsertCallLog({
        log: {
          _id: "log-1",
          call_id: "call-1",
          status: "completed",
          createdAt: "2026-05-10T10:00:00.000Z",
        },
      }),
    );

    expect(store.getState().call.logs).toHaveLength(1);
    expect(store.getState().call.logs[0].status).toBe("completed");
  });
});
