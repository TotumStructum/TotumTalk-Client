import { useTheme } from "@emotion/react";
import {
  Box,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import { CaretLeft, File, Image } from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import { UpdateSidebarType } from "../redux/slices/app";

const URL_PATTERN =
  /((?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#][^\s]*)?)/i;

const getSenderId = (from) => {
  if (!from) return null;

  if (typeof from === "object") {
    return from._id?.toString() || null;
  }

  return from.toString();
};

const getFileName = (file = "") => {
  if (!file) return "Document";

  const parts = file.split("/");

  return decodeURIComponent(parts[parts.length - 1] || "Document");
};

const extractFirstUrl = (text = "") => {
  const match = text.match(URL_PATTERN);

  if (!match) return null;

  return match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
};

const isMessageStarredByCurrentUser = (message, currentUserId) => {
  return Array.isArray(message.starredBy)
    ? message.starredBy.some((userId) => getSenderId(userId) === currentUserId)
    : false;
};

const StarredMessagePreview = ({ message, incoming }) => {
  const theme = useTheme();
  const textColor = theme.palette.text.primary;

  if (message.type === "Media") {
    return (
      <Stack spacing={1}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Image size={20} />
          <Typography variant="subtitle2">Media</Typography>
        </Stack>

        {message.file ? (
          <Box
            component="img"
            src={message.file}
            alt="Starred media"
            sx={{
              width: "100%",
              maxHeight: 160,
              borderRadius: 1.5,
              objectFit: "cover",
            }}
          />
        ) : null}

        {message.text ? (
          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            {message.text}
          </Typography>
        ) : null}
      </Stack>
    );
  }

  if (message.type === "Document") {
    const fileName = getFileName(message.file);

    return (
      <Stack spacing={1}>
        <MuiLink
          href={message.file}
          target="_blank"
          rel="noreferrer"
          underline="hover"
          sx={{ color: textColor }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <File size={20} />
            <Typography variant="subtitle2" noWrap title={fileName}>
              {fileName}
            </Typography>
          </Stack>
        </MuiLink>

        {message.text ? (
          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            {message.text}
          </Typography>
        ) : null}
      </Stack>
    );
  }

  const link = extractFirstUrl(message.text || "");

  if (message.type === "Link" || link) {
    return (
      <MuiLink href={link} target="_blank" rel="noreferrer" underline="hover">
        {message.text || link}
      </MuiLink>
    );
  }

  return (
    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
      {message.text || "Message"}
    </Typography>
  );
};

const StarredMessages = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentUserId = window.localStorage.getItem("user_id");

  const { current_messages } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  const starredMessages = current_messages.filter((message) =>
    isMessageStarredByCurrentUser(message, currentUserId),
  );

  return (
    <Box sx={{ width: 320, height: "100vh" }}>
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
            sx={{ height: "100%", p: 2 }}
            direction="row"
            alignItems={"center"}
            spacing={3}
          >
            <IconButton
              onClick={() => {
                dispatch(UpdateSidebarType("CONTACT"));
              }}
            >
              <CaretLeft />
            </IconButton>
            <Typography variant="subtitle2">Starred Messages</Typography>
          </Stack>
        </Box>

        <Stack
          sx={{
            position: "relative",
            flexGrow: 1,
            minHeight: 0,
            overflowY: "auto",
          }}
          p={3}
          spacing={2}
        >
          {starredMessages.length > 0 ? (
            starredMessages.map((message) => {
              const incoming = getSenderId(message.from) !== currentUserId;

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
                  <Stack spacing={0.75}>
                    <Typography variant="caption" color="text.secondary">
                      {incoming ? "Incoming" : "You"}
                    </Typography>

                    <StarredMessagePreview
                      message={message}
                      incoming={incoming}
                    />
                  </Stack>
                </Box>
              );
            })
          ) : (
            <Stack
              sx={{ flexGrow: 1 }}
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="body2" color="text.secondary">
                No starred messages yet
              </Typography>
            </Stack>
          )}
        </Stack>

        <Box
          sx={{
            height: 88,
            flexShrink: 0,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#f8faff"
                : theme.palette.background.paper,
          }}
        />
      </Stack>
    </Box>
  );
};

export default StarredMessages;
