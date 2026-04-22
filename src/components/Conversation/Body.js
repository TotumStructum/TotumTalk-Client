import { Box, Stack } from "@mui/material";
import React, { useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";

import { DocMsg, LinkMsg, MediaMsg, TextMsg } from "./MsgTypes";

const extractFirstUrl = (text = "") => {
  const match = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);

  if (!match) return null;

  return match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
};

const Body = ({ menu }) => {
  const currentUserId = window.localStorage.getItem("user_id");
  const scrollRef = useRef(null);
  const { room_id } = useSelector((state) => state.app);

  const { current_messages } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    node.scrollTop = node.scrollHeight;
  }, [room_id, current_messages.length]);

  return (
    <Box
      ref={scrollRef}
      sx={{
        height: "100%",
        overflowY: "auto",
        px: 3,
        py: 3,
      }}
    >
      <Stack spacing={3}>
        {current_messages.map((message) => {
          const baseProps = {
            incoming: message.from?.toString() !== currentUserId,
          };

          if (message.type === "Media") {
            return (
              <MediaMsg
                key={message._id}
                el={{ ...baseProps, file: message.file }}
                menu={menu}
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

          if (message.type === "Link") {
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
