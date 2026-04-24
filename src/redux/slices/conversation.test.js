import { configureStore } from "@reduxjs/toolkit";
import conversationReducer, {
  AddDirectMessage,
  FetchDirectConversations,
  MarkConversationRead,
  SetCurrentConversation,
  SetCurrentMessages,
} from "./conversation";

const currentUserId = "current-user-id";

const createConversation = ({
  id,
  otherUserId,
  otherFirstName,
  otherLastName,
  messageText,
  messageType = "Text",
  createdAt,
}) => ({
  _id: id,
  participants: [
    {
      _id: currentUserId,
      firstName: "Current",
      lastName: "User",
      email: "current@example.com",
      status: "Online",
      avatar: "",
      about: "",
    },
    {
      _id: otherUserId,
      firstName: otherFirstName,
      lastName: otherLastName,
      email: `${otherUserId}@example.com`,
      status: "Offline",
      avatar: "",
      about: "",
    },
  ],
  messages: [
    {
      _id: `${id}-message`,
      to: otherUserId,
      from: currentUserId,
      type: messageType,
      text: messageText,
      created_at: createdAt,
    },
  ],
  updatedAt: createdAt,
  createdAt,
});

const createStore = () =>
  configureStore({
    reducer: {
      conversation: conversationReducer,
    },
  });

describe("conversation slice", () => {
  beforeEach(() => {
    window.localStorage.setItem("user_id", currentUserId);
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("maps and sorts direct conversations by latest activity", async () => {
    const store = createStore();

    const olderConversation = createConversation({
      id: "conversation-old",
      otherUserId: "user-b",
      otherFirstName: "Old",
      otherLastName: "Chat",
      messageText: "Older message",
      createdAt: "2026-04-20T10:00:00.000Z",
    });

    const newerConversation = createConversation({
      id: "conversation-new",
      otherUserId: "user-c",
      otherFirstName: "New",
      otherLastName: "Chat",
      messageText: "Newer message",
      createdAt: "2026-04-21T10:00:00.000Z",
    });

    await store.dispatch(
      FetchDirectConversations({
        conversations: [olderConversation, newerConversation],
      }),
    );

    const state = store.getState().conversation.direct_chat.conversations;

    expect(state).toHaveLength(2);
    expect(state[0].id).toBe("conversation-new");
    expect(state[0].name).toBe("New Chat");
    expect(state[0].msg).toBe("Newer message");
    expect(state[1].id).toBe("conversation-old");
  });

  it("moves an inactive conversation to the top and increments unread on incoming message", async () => {
    const store = createStore();

    const firstConversation = createConversation({
      id: "conversation-1",
      otherUserId: "user-b",
      otherFirstName: "First",
      otherLastName: "Chat",
      messageText: "Initial message 1",
      createdAt: "2026-04-20T10:00:00.000Z",
    });

    const secondConversation = createConversation({
      id: "conversation-2",
      otherUserId: "user-c",
      otherFirstName: "Second",
      otherLastName: "Chat",
      messageText: "Initial message 2",
      createdAt: "2026-04-21T10:00:00.000Z",
    });

    await store.dispatch(
      FetchDirectConversations({
        conversations: [firstConversation, secondConversation],
      }),
    );

    await store.dispatch(
      AddDirectMessage({
        conversation_id: "conversation-1",
        message: {
          _id: "new-message",
          to: currentUserId,
          from: "user-b",
          type: "Text",
          text: "Newest incoming message",
          created_at: "2026-04-22T10:00:00.000Z",
        },
      }),
    );

    const state = store.getState().conversation.direct_chat.conversations;

    expect(state[0].id).toBe("conversation-1");
    expect(state[0].msg).toBe("Newest incoming message");
    expect(state[0].unread).toBe(1);
    expect(state[1].id).toBe("conversation-2");
  });

  it("does not increment unread and appends to current messages for the active conversation", async () => {
    const store = createStore();

    const conversation = createConversation({
      id: "conversation-active",
      otherUserId: "user-b",
      otherFirstName: "Active",
      otherLastName: "Chat",
      messageText: "Initial message",
      createdAt: "2026-04-20T10:00:00.000Z",
    });

    await store.dispatch(
      FetchDirectConversations({
        conversations: [conversation],
      }),
    );

    await store.dispatch(
      SetCurrentConversation({
        conversation: {
          id: "conversation-active",
        },
      }),
    );

    await store.dispatch(
      SetCurrentMessages({
        messages: [
          {
            _id: "existing-message",
            text: "Existing message",
          },
        ],
      }),
    );

    await store.dispatch(
      AddDirectMessage({
        conversation_id: "conversation-active",
        message: {
          _id: "active-message",
          to: currentUserId,
          from: "user-b",
          type: "Text",
          text: "Message in active chat",
          created_at: "2026-04-22T10:00:00.000Z",
        },
      }),
    );

    const state = store.getState().conversation.direct_chat;

    expect(state.conversations[0].unread).toBe(0);
    expect(state.current_messages).toHaveLength(2);
    expect(state.current_messages[1].text).toBe("Message in active chat");
  });

  it("resets unread count with MarkConversationRead", async () => {
    const store = createStore();

    const conversation = createConversation({
      id: "conversation-read",
      otherUserId: "user-b",
      otherFirstName: "Read",
      otherLastName: "Chat",
      messageText: "Initial message",
      createdAt: "2026-04-20T10:00:00.000Z",
    });

    await store.dispatch(
      FetchDirectConversations({
        conversations: [conversation],
      }),
    );

    await store.dispatch(
      AddDirectMessage({
        conversation_id: "conversation-read",
        message: {
          _id: "incoming-message",
          to: currentUserId,
          from: "user-b",
          type: "Text",
          text: "Unread message",
          created_at: "2026-04-22T10:00:00.000Z",
        },
      }),
    );

    let state = store.getState().conversation.direct_chat.conversations;
    expect(state[0].unread).toBe(1);

    await store.dispatch(
      MarkConversationRead({
        conversation_id: "conversation-read",
      }),
    );

    state = store.getState().conversation.direct_chat.conversations;
    expect(state[0].unread).toBe(0);
  });
});
