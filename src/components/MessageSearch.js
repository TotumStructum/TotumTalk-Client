import { useMemo, useState } from "react";
import { useTheme } from "@emotion/react";
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CaretLeft, MagnifyingGlass } from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import { UpdateSidebarType } from "../redux/slices/app";

const getMessageText = (message) => {
  if (!message) return "";

  if (message.text) return message.text;

  if (message.type === "Media") return "Media";
  if (message.type === "Document") return "Document";

  return "";
};

const getSenderName = (message) => {
  const from = message?.from;

  if (!from || typeof from !== "object") return "";

  const fullName = `${from.firstName || ""} ${from.lastName || ""}`.trim();

  return fullName || from.email || "";
};

const getSearchableMessageText = (message, includeSenderName) => {
  return [
    includeSenderName ? getSenderName(message) : "",
    getMessageText(message),
  ]
    .filter(Boolean)
    .join(" ");
};

const MessageSearch = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");

  const { chat_type } = useSelector((state) => state.app);

  const { current_messages: directMessages } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  const { current_messages: groupMessages } = useSelector(
    (state) => state.conversation.group_chat,
  );

  const isGroupChat = chat_type === "group";
  const current_messages = isGroupChat ? groupMessages : directMessages;
  const backSidebarType = isGroupChat ? "GROUP_INFO" : "CONTACT";

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return [];

    return current_messages.filter((message) =>
      getSearchableMessageText(message, isGroupChat)
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [current_messages, isGroupChat, query]);

  return (
    <Box
      sx={{
        width: {
          xs: "100vw",
          md: 320,
        },
        height: {
          xs: "100%",
          md: "100vh",
        },
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <Box
          sx={{
            boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
            width: "100%",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.paper,
          }}
        >
          <Stack
            sx={{
              height: "100%",
              px: { xs: 2, md: 2 },
              py: { xs: 1.5, md: 2 },
            }}
            spacing={{ xs: 1.5, md: 3 }}
            direction="row"
            alignItems="center"
          >
            <IconButton
              onClick={() => {
                dispatch(UpdateSidebarType(backSidebarType));
              }}
            >
              <CaretLeft />
            </IconButton>
            <Typography variant="subtitle2">Search Messages</Typography>
          </Stack>
        </Box>

        <Stack
          p={{ xs: 2, md: 3 }}
          spacing={2}
          sx={{ flexGrow: 1, minHeight: 0 }}
        >
          <TextField
            autoFocus
            size="small"
            placeholder="Search messages..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MagnifyingGlass size={18} />
                </InputAdornment>
              ),
            }}
          />

          <Stack spacing={1.5} sx={{ overflowY: "auto", minHeight: 0 }}>
            {!query.trim() ? (
              <Typography variant="body2" color="text.secondary">
                Type to search in this conversation
              </Typography>
            ) : results.length > 0 ? (
              results.map((message) => {
                const senderName = isGroupChat ? getSenderName(message) : "";

                return (
                  <Box
                    key={message._id}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? theme.palette.common.white
                          : theme.palette.background.paper,
                      boxShadow: "0px 0px 2px rgba(0,0,0,0.18)",
                    }}
                  >
                    {senderName ? (
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      >
                        {senderName}
                      </Typography>
                    ) : null}

                    <Typography
                      variant="body2"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {getMessageText(message)}
                    </Typography>
                  </Box>
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                No messages found
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default MessageSearch;
