import { configureStore } from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import appReducer, {
  CreateGroupConversation,
  ResetConversationSelection,
  SelectConversation,
  ToggleSidebar,
  UpdateSidebarType,
} from "./app";

jest.mock("../../utils/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const createStore = () =>
  configureStore({
    reducer: {
      app: appReducer,
    },
  });

describe("app slice", () => {
  it("toggles sidebar open state", async () => {
    const store = createStore();

    expect(store.getState().app.sidebar.open).toBe(false);

    await store.dispatch(ToggleSidebar());
    expect(store.getState().app.sidebar.open).toBe(true);

    await store.dispatch(ToggleSidebar());
    expect(store.getState().app.sidebar.open).toBe(false);
  });

  it("updates sidebar type", async () => {
    const store = createStore();

    expect(store.getState().app.sidebar.type).toBe("CONTACT");

    await store.dispatch(UpdateSidebarType("SHARED"));
    expect(store.getState().app.sidebar.type).toBe("SHARED");

    await store.dispatch(UpdateSidebarType("STARRED"));
    expect(store.getState().app.sidebar.type).toBe("STARRED");
  });

  it("selects a conversation and stores room_id/chat_type", async () => {
    const store = createStore();

    await store.dispatch(
      SelectConversation({
        room_id: "conversation-123",
      }),
    );

    const state = store.getState().app;

    expect(state.room_id).toBe("conversation-123");
    expect(state.chat_type).toBe("individual");
  });

  it("resets selected conversation state", async () => {
    const store = createStore();

    await store.dispatch(
      SelectConversation({
        room_id: "conversation-123",
      }),
    );

    let state = store.getState().app;
    expect(state.room_id).toBe("conversation-123");
    expect(state.chat_type).toBe("individual");

    await store.dispatch(ResetConversationSelection());

    state = store.getState().app;
    expect(state.room_id).toBe(null);
    expect(state.chat_type).toBe(null);
  });

  it("creates group conversation through API with auth token", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        status: "success",
        data: {
          _id: "group-1",
          title: "Study Group",
        },
      },
    });

    const store = configureStore({
      reducer: {
        app: appReducer,
        auth: () => ({
          token: "token-123",
        }),
      },
    });

    const result = await store.dispatch(
      CreateGroupConversation({
        title: "Study Group",
        members: ["user-1", "user-2"],
      }),
    );

    expect(axios.post).toHaveBeenCalledWith(
      "/conversation/group",
      {
        title: "Study Group",
        members: ["user-1", "user-2"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-123",
        },
      },
    );

    expect(result).toEqual({
      _id: "group-1",
      title: "Study Group",
    });
  });
});
