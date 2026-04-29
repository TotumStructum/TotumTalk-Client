import { Box, Stack } from "@mui/material";
import React, { useCallback, useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";

import { DocMsg, LinkMsg, MediaMsg, TextMsg } from "./MsgTypes";

const URL_PATTERN =
  /((?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#][^\s]*)?)/i;

const extractFirstUrl = (text = "") => {
  const match = text.match(URL_PATTERN);

  if (!match) return null;

  return match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
};

const Body = ({ menu }) => {
  const currentUserId = window.localStorage.getItem("user_id");
  const scrollRef = useRef(null);
  const { room_id, chat_type } = useSelector((state) => state.app);

  const { current_messages: directMessages } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  const { current_messages: groupMessages } = useSelector(
    (state) => state.conversation.group_chat,
  );
  const current_messages =
    chat_type === "group" ? groupMessages : directMessages;

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    node.scrollTop = node.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [room_id, current_messages.length, scrollToBottom]);

  const getSenderId = (from) => {
    if (!from) return "";

    if (typeof from === "object") {
      return from._id?.toString() || "";
    }

    return from.toString();
  };

  const getSenderName = (from) => {
    if (!from || typeof from !== "object") return "";

    const fullName = `${from.firstName || ""} ${from.lastName || ""}`.trim();

    return fullName || from.email || "";
  };

  return (
    <Box
      ref={scrollRef}
      sx={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        px: 3,
        py: 3,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          width: 0,
          height: 0,
        },
      }}
    >
      <Stack spacing={3}>
        {current_messages.map((message) => {
          const incoming = getSenderId(message.from) !== currentUserId;

          const baseProps = {
            incoming,
            senderName:
              chat_type === "group" && incoming
                ? getSenderName(message.from)
                : "",
          };

          if (message.type === "Media") {
            return (
              <MediaMsg
                key={message._id}
                el={{
                  ...baseProps,
                  file: message.file,
                  text: message.text || "",
                }}
                menu={menu}
                onLoad={scrollToBottom}
              />
            );
          }

          if (message.type === "Document") {
            return (
              <DocMsg
                key={message._id}
                el={{
                  ...baseProps,
                  file: message.file,
                  text: message.text || "",
                }}
                menu={menu}
              />
            );
          }

          if (message.type === "Link" || extractFirstUrl(message.text || "")) {
            return (
              <LinkMsg
                key={message._id}
                el={{
                  ...baseProps,
                  text: message.text || "",
                  url: extractFirstUrl(message.text || ""),
                }}
                menu={menu}
              />
            );
          }

          return (
            <TextMsg
              key={message._id}
              el={{
                ...baseProps,
                message: message.text || "",
              }}
              menu={menu}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

export default Body;
