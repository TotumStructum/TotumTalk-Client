import { Navigate, Outlet } from "react-router-dom";
import { Stack } from "@mui/material";
import React, { useEffect, useRef } from "react";

import SideBar from "./SideBar";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, socket } from "../../socket";
import {
  FetchFriendRequests,
  FetchFriends,
  FetchUsers,
  SelectConversation,
  showSnackbar,
} from "../../redux/slices/app";
import {
  AddDirectConversation,
  UpdateDirectConversation,
  AddDirectMessage,
  FetchDirectConversations,
} from "../../redux/slices/conversation";

const DashboardLayout = () => {
  const dispatch = useDispatch();

  const { isLoggedIn } = useSelector((state) => state.auth);
  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  const conversationsRef = useRef(conversations);

  const token = window.localStorage.getItem("token");

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    if (!socket) {
      connectSocket(token);
    }

    const refreshRelationshipData = () => {
      dispatch(FetchUsers());
      dispatch(FetchFriends());
      dispatch(FetchFriendRequests());
    };

    const loadConversations = () => {
      socket.emit("get_direct_conversations", null, (data) => {
        dispatch(FetchDirectConversations({ conversations: data }));
      });
    };

    const loadInitialData = () => {
      loadConversations();
      refreshRelationshipData();
    };

    const handleNewMessage = (data) => {
      dispatch(
        AddDirectMessage({
          conversation_id: data.conversation_id,
          message: data.message,
        }),
      );
    };

    const handleNewFriendRequest = (data) => {
      dispatch(showSnackbar({ severity: "success", message: data.message }));
      refreshRelationshipData();
    };

    const handleRequestAccepted = (data) => {
      dispatch(showSnackbar({ severity: "success", message: data.message }));
      refreshRelationshipData();
    };

    const handleRequestSent = (data) => {
      dispatch(showSnackbar({ severity: "success", message: data.message }));
      refreshRelationshipData();
    };

    const handleRequestError = (data) => {
      dispatch(
        showSnackbar({
          severity: "error",
          message: data?.message || "Request action failed",
        }),
      );
    };

    const handleConversationError = (data) => {
      dispatch(
        showSnackbar({
          severity: "error",
          message: data?.message || "Conversation action failed",
        }),
      );
    };

    const handleMessageError = (data) => {
      dispatch(
        showSnackbar({
          severity: "error",
          message: data?.message || "Message action failed",
        }),
      );
    };

    const handleStartChat = (data) => {
      const existingConversation = conversationsRef.current.find(
        (el) => el.id === data._id,
      );

      if (existingConversation) {
        dispatch(UpdateDirectConversation({ conversation: data }));
      } else {
        dispatch(AddDirectConversation({ conversation: data }));
      }

      dispatch(SelectConversation({ room_id: data._id }));
    };

    if (socket.connected) {
      loadInitialData();
    }

    socket.on("connect", loadInitialData);
    socket.on("new_friend_request", handleNewFriendRequest);
    socket.on("request_accepted", handleRequestAccepted);
    socket.on("request_sent", handleRequestSent);
    socket.on("request_error", handleRequestError);
    socket.on("conversation_error", handleConversationError);
    socket.on("message_error", handleMessageError);
    socket.on("start_chat", handleStartChat);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket?.off("connect", loadInitialData);
      socket?.off("new_friend_request", handleNewFriendRequest);
      socket?.off("request_accepted", handleRequestAccepted);
      socket?.off("request_sent", handleRequestSent);
      socket?.off("request_error", handleRequestError);
      socket?.off("conversation_error", handleConversationError);
      socket?.off("message_error", handleMessageError);
      socket?.off("start_chat", handleStartChat);
      socket?.off("new_message", handleNewMessage);
    };
  }, [isLoggedIn, token, dispatch]);

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <Stack direction="row">
      <SideBar />
      <Outlet />
    </Stack>
  );
};

export default DashboardLayout;
