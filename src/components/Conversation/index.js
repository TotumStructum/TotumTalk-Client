import { Box, Stack } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import Body from "./Body";
import Footer from "./Footer";
import axios from "../../utils/axios";
import {
  SetCurrentConversation,
  SetCurrentGroupConversation,
  SetCurrentGroupMessages,
  SetCurrentMessages,
} from "../../redux/slices/conversation";
import { showSnackbar } from "../../redux/slices/app";

const Conversation = () => {
  const dispatch = useDispatch();

  const { room_id, chat_type, groups } = useSelector((state) => state.app);
  const { token } = useSelector((state) => state.auth);
  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  useEffect(() => {
    const isGroupChat = chat_type === "group";

    if (isGroupChat) {
      const selectedGroup = groups.find((el) => el._id === room_id) || null;
      dispatch(SetCurrentGroupConversation({ conversation: selectedGroup }));
      return;
    }

    const selectedConversation =
      conversations.find((el) => el.id === room_id) || null;

    dispatch(SetCurrentConversation({ conversation: selectedConversation }));
  }, [room_id, chat_type, conversations, groups, dispatch]);

  useEffect(() => {
    const isGroupChat = chat_type === "group";

    if (!room_id || !token) {
      if (isGroupChat) {
        dispatch(SetCurrentGroupMessages({ messages: [] }));
      } else {
        dispatch(SetCurrentMessages({ messages: [] }));
      }

      return;
    }

    let isMounted = true;

    const loadMessages = async () => {
      try {
        const endpoint = isGroupChat
          ? `/conversation/group/${room_id}/messages`
          : `/conversation/${room_id}/messages`;

        const response = await axios.get(endpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) return;

        if (isGroupChat) {
          dispatch(
            SetCurrentGroupMessages({ messages: response.data.data || [] }),
          );
        } else {
          dispatch(SetCurrentMessages({ messages: response.data.data || [] }));
        }
      } catch (error) {
        if (!isMounted) return;

        if (isGroupChat) {
          dispatch(SetCurrentGroupMessages({ messages: [] }));
        } else {
          dispatch(SetCurrentMessages({ messages: [] }));
        }

        dispatch(
          showSnackbar({
            severity: "error",
            message:
              error?.response?.data?.message ||
              error?.message ||
              "Failed to load messages",
          }),
        );
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [room_id, token, chat_type, dispatch]);

  return (
    <Stack height={"100%"} maxHeight={"100vh"} sx={{ minHeight: 0 }}>
      <Header />
      <Box
        width={"100%"}
        sx={{ flexGrow: 1, minHeight: 0, overflow: "hidden" }}
      >
        <Body menu={true} />
      </Box>
      <Footer />
    </Stack>
  );
};

export default Conversation;
