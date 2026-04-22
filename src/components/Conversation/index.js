import { Box, Stack } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Header from "./Header";
import Body from "./Body";
import Footer from "./Footer";
import axios from "../../utils/axios";
import {
  SetCurrentConversation,
  SetCurrentMessages,
} from "../../redux/slices/conversation";
import { showSnackbar } from "../../redux/slices/app";

const Conversation = () => {
  const dispatch = useDispatch();

  const { room_id } = useSelector((state) => state.app);
  const { token } = useSelector((state) => state.auth);
  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  useEffect(() => {
    const selectedConversation =
      conversations.find((el) => el.id === room_id) || null;

    dispatch(SetCurrentConversation({ conversation: selectedConversation }));

    if (!room_id || !token) {
      dispatch(SetCurrentMessages({ messages: [] }));
      return;
    }

    let isMounted = true;

    const loadMessages = async () => {
      try {
        const response = await axios.get(`/conversation/${room_id}/messages`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) return;

        dispatch(SetCurrentMessages({ messages: response.data.data || [] }));
      } catch (error) {
        if (!isMounted) return;

        dispatch(SetCurrentMessages({ messages: [] }));
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
  }, [room_id, token, conversations, dispatch]);

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
