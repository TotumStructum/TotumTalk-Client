import { Navigate, Outlet } from "react-router-dom";
import { Stack, Box } from "@mui/material";
import useResponsive from "../../hooks/useResponsive";
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
  UpdateGroupConversationMessage,
  FetchSentFriendRequests,
} from "../../redux/slices/app";
import {
  AddDirectConversation,
  UpdateDirectConversation,
  AddDirectMessage,
  AddGroupMessage,
  FetchDirectConversations,
} from "../../redux/slices/conversation";
import CallDialogs from "../../components/call/CallDialogs";
import {
  AcceptCall,
  CancelCall,
  DeclineCall,
  EndCall,
  FetchCallLogs,
  ReceiveIncomingCall,
  SetCallError,
  UpsertCallLog,
} from "../../redux/slices/call";

const DashboardLayout = () => {
  const dispatch = useDispatch();

  const { isLoggedIn, token } = useSelector((state) => state.auth);
  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  const conversationsRef = useRef(conversations);

  const isMobile = useResponsive("down", "md");

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
      dispatch(FetchSentFriendRequests());
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

    const handleNewGroupMessage = (data) => {
      dispatch(
        AddGroupMessage({
          group_id: data.group_id,
          message: data.message,
        }),
      );

      dispatch(
        UpdateGroupConversationMessage({
          group_id: data.group_id,
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

    const handleFriendRemoved = (data) => {
      dispatch(showSnackbar({ severity: "success", message: data.message }));
      refreshRelationshipData();
    };

    const handleRequestRejected = (data) => {
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

    const handleRequestCancelled = (data) => {
      dispatch(showSnackbar({ severity: "success", message: data.message }));
      refreshRelationshipData();
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

    const handleCallIncoming = (data) => {
      dispatch(ReceiveIncomingCall({ call: data }));
    };

    const handleCallRinging = () => {
      dispatch(
        showSnackbar({
          severity: "info",
          message: "Calling...",
        }),
      );
    };

    const handleCallAccepted = (data) => {
      dispatch(AcceptCall({ call: data }));
    };

    const handleCallDeclined = () => {
      dispatch(DeclineCall());
      dispatch(
        showSnackbar({
          severity: "info",
          message: "Call declined",
        }),
      );
    };

    const handleCallCancelled = () => {
      dispatch(CancelCall());
      dispatch(
        showSnackbar({
          severity: "info",
          message: "Call cancelled",
        }),
      );
    };

    const handleCallEnded = () => {
      dispatch(EndCall());
      dispatch(
        showSnackbar({
          severity: "info",
          message: "Call ended",
        }),
      );
    };

    const handleCallUnavailable = (data) => {
      dispatch(
        SetCallError({
          message: data?.message || "User is unavailable",
        }),
      );

      dispatch(
        showSnackbar({
          severity: "error",
          message: data?.message || "User is unavailable",
        }),
      );
    };

    const handleCallError = (data) => {
      dispatch(
        SetCallError({
          message: data?.message || "Call failed",
        }),
      );

      dispatch(
        showSnackbar({
          severity: "error",
          message: data?.message || "Call failed",
        }),
      );
    };

    const handleCallLogUpdated = (data) => {
      dispatch(UpsertCallLog({ log: data }));
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
    currentSocket.on("request_rejected", handleRequestRejected);
    currentSocket.on("request_sent", handleRequestSent);
    currentSocket.on("request_error", handleRequestError);
    currentSocket.on("conversation_error", handleConversationError);
    currentSocket.on("message_error", handleMessageError);
    currentSocket.on("start_chat", handleStartChat);
    currentSocket.on("new_message", handleNewMessage);
    currentSocket.on("new_group_message", handleNewGroupMessage);
    currentSocket.on("friend_removed", handleFriendRemoved);
    currentSocket.on("request_cancelled", handleRequestCancelled);
    currentSocket.on("call_incoming", handleCallIncoming);
    currentSocket.on("call_ringing", handleCallRinging);
    currentSocket.on("call_accepted", handleCallAccepted);
    currentSocket.on("call_declined", handleCallDeclined);
    currentSocket.on("call_cancelled", handleCallCancelled);
    currentSocket.on("call_ended", handleCallEnded);
    currentSocket.on("call_unavailable", handleCallUnavailable);
    currentSocket.on("call_error", handleCallError);
    currentSocket.on("call_log_updated", handleCallLogUpdated);

    loadConversations();
    refreshRelationshipData();
    dispatch(FetchCallLogs());

    currentSocket.auth = { token };
    currentSocket.connect();

    return () => {
      currentSocket.off("connect", handleConnect);
      currentSocket.off("new_friend_request", handleNewFriendRequest);
      currentSocket.off("request_accepted", handleRequestAccepted);
      currentSocket.off("request_rejected", handleRequestRejected);
      currentSocket.off("request_sent", handleRequestSent);
      currentSocket.off("request_error", handleRequestError);
      currentSocket.off("conversation_error", handleConversationError);
      currentSocket.off("message_error", handleMessageError);
      currentSocket.off("start_chat", handleStartChat);
      currentSocket.off("new_message", handleNewMessage);
      currentSocket.off("new_group_message", handleNewGroupMessage);
      currentSocket.off("friend_removed", handleFriendRemoved);
      currentSocket.off("request_cancelled", handleRequestCancelled);
      currentSocket.off("call_incoming", handleCallIncoming);
      currentSocket.off("call_ringing", handleCallRinging);
      currentSocket.off("call_accepted", handleCallAccepted);
      currentSocket.off("call_declined", handleCallDeclined);
      currentSocket.off("call_cancelled", handleCallCancelled);
      currentSocket.off("call_ended", handleCallEnded);
      currentSocket.off("call_unavailable", handleCallUnavailable);
      currentSocket.off("call_error", handleCallError);
      currentSocket.off("call_log_updated", handleCallLogUpdated);
    };
  }, [isLoggedIn, token, dispatch]);

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" />;
  }

  if (isMobile) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          width: "100vw",
          overflow: "hidden",
        }}
      >
        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <Outlet />
        </Box>

        <SideBar />
        <CallDialogs />
      </Box>
    );
  }

  return (
    <Stack direction="row">
      <SideBar />
      <Outlet />
      <CallDialogs />
    </Stack>
  );
};

export default DashboardLayout;
