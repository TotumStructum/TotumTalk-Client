import { Stack, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useEffect, useRef } from "react";

import Conversation from "../../components/Conversation";
import Chats from "./Chats";
import Contact from "../../components/Contact";
import { useDispatch, useSelector } from "react-redux";
import SharedMessages from "../../components/SharedMessages";
import StarredMessages from "../../components/StarredMessages";
import MessageSearch from "../../components/MessageSearch";

import useResponsive from "../../hooks/useResponsive";

import NoChatSVG from "../../assets/Illustration/NoChat";
import {
  ResetConversationSelection,
  ToggleSidebar,
  UpdateSidebarType,
} from "../../redux/slices/app";
import { ClearCurrentConversation } from "../../redux/slices/conversation";

const GeneralApp = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { sidebar, room_id, chat_type } = useSelector((store) => store.app);
  const sidebarOpenRef = useRef(sidebar.open);

  const isMobile = useResponsive("down", "md");
  const hasConversation = room_id !== null && chat_type === "individual";

  useEffect(() => {
    sidebarOpenRef.current = sidebar.open;
  }, [sidebar.open]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      dispatch(ResetConversationSelection());
      dispatch(ClearCurrentConversation());

      if (sidebarOpenRef.current) {
        dispatch(UpdateSidebarType("CONTACT"));
        dispatch(ToggleSidebar());
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(ResetConversationSelection());
      dispatch(ClearCurrentConversation());

      if (sidebarOpenRef.current) {
        dispatch(UpdateSidebarType("CONTACT"));
        dispatch(ToggleSidebar());
      }
    };
  }, [dispatch]);

  if (isMobile) {
    if (sidebar.open) {
      return (
        <Box
          sx={{
            width: "100vw",
            height: "100%",
            overflow: "hidden",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.default,
          }}
        >
          {sidebar.type === "CONTACT" && <Contact />}
          {sidebar.type === "SHARED" && <SharedMessages />}
          {sidebar.type === "STARRED" && <StarredMessages />}
          {sidebar.type === "MESSAGE_SEARCH" && <MessageSearch />}
        </Box>
      );
    }

    if (hasConversation) {
      return (
        <Box
          sx={{
            width: "100vw",
            height: "100%",
            overflow: "hidden",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.default,
          }}
        >
          <Conversation />
        </Box>
      );
    }

    return (
      <Box sx={{ width: "100vw", height: "100%", overflow: "hidden" }}>
        <Chats />
      </Box>
    );
  }

  return (
    <Stack direction={"row"} sx={{ width: "100%" }}>
      <Chats />
      <Box
        sx={{
          height: "100%",
          width: sidebar.open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.default,
        }}
      >
        {hasConversation ? (
          <Conversation />
        ) : (
          <Stack
            spacing={2}
            sx={{ height: "100%", width: "100%" }}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <NoChatSVG />
            <Typography variant="subtitle2">
              Select a conversation or start new one
            </Typography>
          </Stack>
        )}
      </Box>
      {sidebar.open &&
        ((sidebar.type === "CONTACT" && <Contact />) ||
          (sidebar.type === "SHARED" && <SharedMessages />) ||
          (sidebar.type === "STARRED" && <StarredMessages />) ||
          (sidebar.type === "MESSAGE_SEARCH" && <MessageSearch />) ||
          null)}
    </Stack>
  );
};

export default GeneralApp;
