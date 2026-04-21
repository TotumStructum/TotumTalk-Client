import { Navigate, Outlet } from "react-router-dom";
import { Stack } from "@mui/material";
import React, { useEffect, useRef } from "react";

import SideBar from "./SideBar";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket } from "../../socket";
import axios from "../../utils/axios";
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

  const { isLoggedIn, token } = useSelector((state) => state.auth);
  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const currentSocket = connectSocket(token);

    const refreshRelationshipData = () => {
      dispatch(FetchUsers());
      dispatch(FetchFriends());
      dispatch(FetchFriendRequests());
    };

    const loadConversations = async () => {
      try {
        const response = await axios.get("/conversation/direct", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        dispatch(
          FetchDirectConversations({
            conversations: response.data.data || [],
          }),
        );
      } catch (error) {
        dispatch(
          showSnackbar({
            severity: "error",
            message:
              error?.response?.data?.message ||
              error?.message ||
              "Failed to load conversations",
          }),
        );
      }
    };

    const handleConnect = () => {
      refreshRelationshipData();
      loadConversations();
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

    currentSocket.on("connect", handleConnect);
    currentSocket.on("new_friend_request", handleNewFriendRequest);
    currentSocket.on("request_accepted", handleRequestAccepted);
    currentSocket.on("request_sent", handleRequestSent);
    currentSocket.on("request_error", handleRequestError);
    currentSocket.on("conversation_error", handleConversationError);
    currentSocket.on("message_error", handleMessageError);
    currentSocket.on("start_chat", handleStartChat);
    currentSocket.on("new_message", handleNewMessage);

    loadConversations();
    refreshRelationshipData();

    currentSocket.auth = { token };
    currentSocket.connect();

    return () => {
      currentSocket.off("connect", handleConnect);
      currentSocket.off("new_friend_request", handleNewFriendRequest);
      currentSocket.off("request_accepted", handleRequestAccepted);
      currentSocket.off("request_sent", handleRequestSent);
      currentSocket.off("request_error", handleRequestError);
      currentSocket.off("conversation_error", handleConversationError);
      currentSocket.off("message_error", handleMessageError);
      currentSocket.off("start_chat", handleStartChat);
      currentSocket.off("new_message", handleNewMessage);
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
