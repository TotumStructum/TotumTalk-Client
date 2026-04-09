import { Box, Stack } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Header from "./Header";
import Body from "./Body";
import Footer from "./Footer";
import { socket } from "../../socket";
import {
  SetCurrentConversation,
  SetCurrentMessages,
} from "../../redux/slices/conversation";

const Conversation = () => {
  const dispatch = useDispatch();

  const { room_id } = useSelector((state) => state.app);
  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  useEffect(() => {
    const selectedConversation =
      conversations.find((el) => el.id === room_id) || null;

    dispatch(SetCurrentConversation({ conversation: selectedConversation }));

    if (!socket || !room_id) {
      dispatch(SetCurrentMessages({ messages: [] }));
      return;
    }

    socket.emit("get_messages", { conversation_id: room_id }, (messages) => {
      dispatch(SetCurrentMessages({ messages }));
    });
  }, [room_id, conversations, dispatch]);

  return (
    <Stack height={"100%"} maxHeight={"100vh"}>
      <Header />
      <Box
        width={"100%"}
        sx={{ flexGrow: 1, height: "100vh", overflowY: "scroll" }}
      >
        <Body menu={true} />
      </Box>
      <Footer />
    </Stack>
  );
};

export default Conversation;
