import {
  Box,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";
import { CaretLeft } from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import { UpdateSidebarType } from "../redux/slices/app";
import { useTheme } from "@emotion/react";
import { LinkMsg, DocMsg } from "../components/Conversation/MsgTypes.js";

const URL_PATTERN =
  /((?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#][^\s]*)?)/i;

const extractFirstUrl = (text = "") => {
  const match = text.match(URL_PATTERN);

  if (!match) return null;

  return match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
};

const getSenderId = (from) => {
  if (!from) return null;

  if (typeof from === "object") {
    return from._id?.toString() || null;
  }

  return from.toString();
};

const SharedMessages = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [value, setValue] = React.useState(0);

  const currentUserId = window.localStorage.getItem("user_id");

  const { chat_type } = useSelector((state) => state.app);

  const { current_messages: directMessages } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  const { current_messages: groupMessages } = useSelector(
    (state) => state.conversation.group_chat,
  );

  const current_messages =
    chat_type === "group" ? groupMessages : directMessages;

  const mediaMessages = current_messages.filter(
    (message) => message.type === "Media" && message.file,
  );

  const linkMessages = current_messages.filter(
    (message) =>
      message.type === "Link" || Boolean(extractFirstUrl(message.text)),
  );

  const docMessages = current_messages.filter(
    (message) => message.type === "Document" && message.file,
  );

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const renderEmpty = (text) => (
    <Typography variant="body2" color="text.secondary">
      {text}
    </Typography>
  );

  const handleBackClick = () => {
    if (chat_type === "group") {
      dispatch(UpdateSidebarType("GROUP_INFO"));
      return;
    }

    dispatch(UpdateSidebarType("CONTACT"));
  };

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
            sx={{ px: { xs: 2, md: 2 }, py: { xs: 1.5, md: 2 } }}
            direction="row"
            alignItems="center"
            spacing={{ xs: 1.5, md: 3 }}
          >
            <IconButton onClick={handleBackClick}>
              <CaretLeft />
            </IconButton>
            <Typography variant="subtitle2">Shared Messages</Typography>
          </Stack>
        </Box>

        <Tabs
          sx={{ px: { xs: 1, md: 2 }, pt: { xs: 1, md: 2 } }}
          variant="fullWidth"
          value={value}
          onChange={handleChange}
          centered
        >
          <Tab label="Media" />
          <Tab label="Links" />
          <Tab label="Docs" />
        </Tabs>

        <Stack
          p={{ xs: 2, md: 3 }}
          spacing={value === 1 ? 1 : { xs: 2, md: 3 }}
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          {value === 0 &&
            (mediaMessages.length > 0 ? (
              <Grid container spacing={2}>
                {mediaMessages.map((message) => (
                  <Grid key={message._id} item xs={4}>
                    <Box
                      component="a"
                      href={message.file}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open shared media"
                      sx={{
                        display: "block",
                        lineHeight: 0,
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        component="img"
                        src={message.file}
                        alt="Shared media"
                        sx={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          objectFit: "cover",
                          borderRadius: 1.5,
                          transition: "opacity 0.2s ease",
                          "&:hover": {
                            opacity: 0.85,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              renderEmpty("No shared media yet")
            ))}

          {value === 1 &&
            (linkMessages.length > 0
              ? linkMessages.map((message) => (
                  <LinkMsg
                    key={message._id}
                    el={{
                      incoming: getSenderId(message.from) !== currentUserId,
                      text: message.text || "",
                      url: extractFirstUrl(message.text),
                    }}
                  />
                ))
              : renderEmpty("No shared links yet"))}

          {value === 2 &&
            (docMessages.length > 0
              ? docMessages.map((message) => (
                  <DocMsg
                    key={message._id}
                    el={{
                      incoming: getSenderId(message.from) !== currentUserId,
                      file: message.file,
                      text: message.text || "",
                    }}
                  />
                ))
              : renderEmpty("No shared documents yet"))}
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

export default SharedMessages;
