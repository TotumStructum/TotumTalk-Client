import { createSlice } from "@reduxjs/toolkit";

const getStoredUserId = () => window.localStorage.getItem("user_id");

const formatMessageTime = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMessagePreview = (message) => {
  if (!message) return "";

  switch (message.type) {
    case "Text":
      return message.text || "";
    case "Link":
      return message.text || "Link";
    case "Document":
      return "Document";
    case "Media":
      return "Media";
    default:
      return "";
  }
};

const getConversationLastActivity = (conversation) => {
  const lastMessage =
    conversation.messages && conversation.messages.length > 0
      ? conversation.messages[conversation.messages.length - 1]
      : null;

  return (
    lastMessage?.created_at ||
    conversation.updatedAt ||
    conversation.createdAt ||
    0
  );
};

const sortConversationList = (list) => {
  return [...list].sort((a, b) => {
    const aTime = new Date(a.lastActivity || 0).getTime();
    const bTime = new Date(b.lastActivity || 0).getTime();

    return bTime - aTime;
  });
};

const mapConversation = (conversation, user_id) => {
  const this_user = conversation.participants.find(
    (participant) => participant._id.toString() !== user_id,
  );

  const lastMessage =
    conversation.messages && conversation.messages.length > 0
      ? conversation.messages[conversation.messages.length - 1]
      : null;

  return {
    id: conversation._id,
    user_id: this_user._id,
    name: `${this_user.firstName} ${this_user.lastName}`.trim(),
    online: this_user.status === "Online",
    img: this_user.avatar || "",
    email: this_user.email || "",
    about: this_user.about || "",
    msg: getMessagePreview(lastMessage),
    time: formatMessageTime(lastMessage?.created_at),
    unread: 0,
    pinned: false,
    lastActivity: getConversationLastActivity(conversation),
  };
};

const initialState = {
  direct_chat: {
    conversations: [],
    current_conversation: null,
    current_messages: [],
  },
  group_chat: {},
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      const user_id = getStoredUserId();

      state.direct_chat.conversations = sortConversationList(
        action.payload.conversations.map((el) => mapConversation(el, user_id)),
      );
    },

    updateDirectConversation(state, action) {
      const user_id = getStoredUserId();
      const this_conversation = action.payload.conversation;

      state.direct_chat.conversations = sortConversationList(
        state.direct_chat.conversations.map((el) => {
          if (el.id !== this_conversation._id) {
            return el;
          }

          return {
            ...mapConversation(this_conversation, user_id),
            unread: el.unread,
          };
        }),
      );
    },

    addDirectConversation(state, action) {
      const user_id = getStoredUserId();
      const this_conversation = action.payload.conversation;

      state.direct_chat.conversations = sortConversationList([
        ...state.direct_chat.conversations,
        mapConversation(this_conversation, user_id),
      ]);
    },

    setCurrentConversation(state, action) {
      state.direct_chat.current_conversation = action.payload.conversation;
    },

    setCurrentMessages(state, action) {
      state.direct_chat.current_messages = action.payload.messages;
    },

    addDirectMessage(state, action) {
      const user_id = getStoredUserId();
      const { conversation_id, message } = action.payload;

      if (
        state.direct_chat.current_conversation &&
        state.direct_chat.current_conversation.id === conversation_id
      ) {
        state.direct_chat.current_messages.push(message);
      }

      state.direct_chat.conversations = sortConversationList(
        state.direct_chat.conversations.map((el) => {
          if (el.id !== conversation_id) return el;

          const isIncoming = message.from?.toString() !== user_id;

          return {
            ...el,
            msg: getMessagePreview(message),
            time: formatMessageTime(message.created_at || Date.now()),
            lastActivity: message.created_at || Date.now(),
            unread:
              state.direct_chat.current_conversation?.id === conversation_id
                ? 0
                : isIncoming
                  ? el.unread + 1
                  : el.unread,
          };
        }),
      );
    },

    markConversationRead(state, action) {
      const conversationId = action.payload.conversation_id;

      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (el) =>
          el.id === conversationId
            ? {
                ...el,
                unread: 0,
              }
            : el,
      );
    },

    clearCurrentConversation(state) {
      state.direct_chat.current_conversation = null;
      state.direct_chat.current_messages = [];
    },
  },
});

export default slice.reducer;

export const FetchDirectConversations = ({ conversations }) => {
  return async (dispatch) => {
    dispatch(slice.actions.fetchDirectConversations({ conversations }));
  };
};

export const UpdateDirectConversation = ({ conversation }) => {
  return async (dispatch) => {
    dispatch(slice.actions.updateDirectConversation({ conversation }));
  };
};

export const AddDirectConversation = ({ conversation }) => {
  return async (dispatch) => {
    dispatch(slice.actions.addDirectConversation({ conversation }));
  };
};

export const SetCurrentConversation = ({ conversation }) => {
  return async (dispatch) => {
    dispatch(slice.actions.setCurrentConversation({ conversation }));
  };
};

export const SetCurrentMessages = ({ messages }) => {
  return async (dispatch) => {
    dispatch(slice.actions.setCurrentMessages({ messages }));
  };
};

export const AddDirectMessage = ({ conversation_id, message }) => {
  return async (dispatch) => {
    dispatch(slice.actions.addDirectMessage({ conversation_id, message }));
  };
};

export const ClearCurrentConversation = () => {
  return async (dispatch) => {
    dispatch(slice.actions.clearCurrentConversation());
  };
};

export const MarkConversationRead = ({ conversation_id }) => {
  return async (dispatch) => {
    dispatch(slice.actions.markConversationRead({ conversation_id }));
  };
};
