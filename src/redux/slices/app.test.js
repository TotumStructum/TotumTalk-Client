import { configureStore } from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import appReducer, {
  CreateGroupConversation,
  FetchGroupConversations,
  ResetConversationSelection,
  SelectConversation,
  ToggleSidebar,
  UpdateSidebarType,
  SelectGroupConversation,
  UpdateGroupConversationMessage,
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    const groups = store.getState().app.groups;

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      _id: "group-1",
      title: "Study Group",
      msg: "",
      time: "",
      lastActivity: 0,
    });
    expect(store.getState().app.room_id).toBe("group-1");
    expect(store.getState().app.chat_type).toBe("group");
  });

  it("fetches group conversations from API with auth token", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        status: "success",
        data: [
          {
            _id: "group-1",
            title: "Study Group",
          },
        ],
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

    await store.dispatch(FetchGroupConversations());

    expect(axios.get).toHaveBeenCalledWith("/conversation/group", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
    });

    const groups = store.getState().app.groups;

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      _id: "group-1",
      title: "Study Group",
      msg: "",
      time: "",
      lastActivity: 0,
    });
  });

  it("selects a group conversation and stores room_id/chat_type", async () => {
    const store = createStore();

    await store.dispatch(
      SelectGroupConversation({
        room_id: "group-123",
      }),
    );

    const state = store.getState().app;

    expect(state.room_id).toBe("group-123");
    expect(state.chat_type).toBe("group");
  });

  it("sorts group conversations and updates preview after a new group message", async () => {
    window.localStorage.setItem("user_id", "current-user");

    axios.get.mockResolvedValueOnce({
      data: {
        status: "success",
        data: [
          {
            _id: "group-old",
            title: "Old Group",
            participants: [],
            messages: [
              {
                _id: "old-message",
                type: "Text",
                text: "Old message",
                created_at: "2026-04-20T10:00:00.000Z",
              },
            ],
            updatedAt: "2026-04-20T10:00:00.000Z",
            createdAt: "2026-04-20T09:00:00.000Z",
          },
          {
            _id: "group-new",
            title: "New Group",
            participants: [],
            messages: [
              {
                _id: "new-message",
                type: "Text",
                text: "New message",
                created_at: "2026-04-21T10:00:00.000Z",
              },
            ],
            updatedAt: "2026-04-21T10:00:00.000Z",
            createdAt: "2026-04-21T09:00:00.000Z",
          },
        ],
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

    await store.dispatch(FetchGroupConversations());

    let groups = store.getState().app.groups;

    expect(groups[0]._id).toBe("group-new");
    expect(groups[0].msg).toBe("New message");
    expect(groups[1]._id).toBe("group-old");

    await store.dispatch(
      UpdateGroupConversationMessage({
        group_id: "group-old",
        message: {
          _id: "live-message",
          type: "Link",
          text: "youtube.com",
          from: {
            _id: "other-user",
          },
          created_at: "2026-04-22T10:00:00.000Z",
        },
      }),
    );

    groups = store.getState().app.groups;

    expect(groups[0]._id).toBe("group-old");
    expect(groups[0].msg).toBe("youtube.com");
    expect(groups[0].lastActivity).toBe("2026-04-22T10:00:00.000Z");
    expect(groups[0].messages).toHaveLength(2);
    expect(groups[0].unread).toBe(1);
  });
  it("resets group unread count when selecting a group conversation", async () => {
    window.localStorage.setItem("user_id", "current-user");

    axios.get.mockResolvedValueOnce({
      data: {
        status: "success",
        data: [
          {
            _id: "group-1",
            title: "Study Group",
            participants: [],
            messages: [],
          },
        ],
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

    await store.dispatch(FetchGroupConversations());

    await store.dispatch(
      UpdateGroupConversationMessage({
        group_id: "group-1",
        message: {
          _id: "message-1",
          type: "Text",
          text: "Unread group message",
          from: {
            _id: "other-user",
          },
          created_at: "2026-04-22T10:00:00.000Z",
        },
      }),
    );

    expect(store.getState().app.groups[0].unread).toBe(1);

    await store.dispatch(
      SelectGroupConversation({
        room_id: "group-1",
      }),
    );

    expect(store.getState().app.groups[0].unread).toBe(0);
    expect(store.getState().app.room_id).toBe("group-1");
    expect(store.getState().app.chat_type).toBe("group");
  });

  it("does not increment group unread for current user's own message", async () => {
    window.localStorage.setItem("user_id", "current-user");

    axios.get.mockResolvedValueOnce({
      data: {
        status: "success",
        data: [
          {
            _id: "group-1",
            title: "Study Group",
            participants: [],
            messages: [],
          },
        ],
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

    await store.dispatch(FetchGroupConversations());

    await store.dispatch(
      UpdateGroupConversationMessage({
        group_id: "group-1",
        message: {
          _id: "own-message",
          type: "Text",
          text: "My own group message",
          from: {
            _id: "current-user",
          },
          created_at: "2026-04-22T10:00:00.000Z",
        },
      }),
    );

    expect(store.getState().app.groups[0].unread).toBe(0);
  });

  it("does not increment group unread for the currently open group", async () => {
    window.localStorage.setItem("user_id", "current-user");

    axios.get.mockResolvedValueOnce({
      data: {
        status: "success",
        data: [
          {
            _id: "group-1",
            title: "Study Group",
            participants: [],
            messages: [],
          },
        ],
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

    await store.dispatch(FetchGroupConversations());

    await store.dispatch(
      SelectGroupConversation({
        room_id: "group-1",
      }),
    );

    await store.dispatch(
      UpdateGroupConversationMessage({
        group_id: "group-1",
        message: {
          _id: "active-group-message",
          type: "Text",
          text: "Message in active group",
          from: {
            _id: "other-user",
          },
          created_at: "2026-04-22T10:00:00.000Z",
        },
      }),
    );

    expect(store.getState().app.groups[0].unread).toBe(0);
    expect(store.getState().app.groups[0].msg).toBe("Message in active group");
  });
});
