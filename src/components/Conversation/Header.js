import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
  AvatarGroup,
} from "@mui/material";
import {
  ArrowLeft,
  CaretDown,
  MagnifyingGlass,
  Phone,
  VideoCamera,
} from "phosphor-react";
import React from "react";
import StyledBadge from "../StyledBadge";
import {
  ResetConversationSelection,
  ToggleSidebar,
  UpdateSidebarType,
} from "../../redux/slices/app";
import {
  ClearCurrentConversation,
  ClearCurrentGroupConversation,
} from "../../redux/slices/conversation";
import { useDispatch, useSelector } from "react-redux";
import useResponsive from "../../hooks/useResponsive";
import { socket } from "../../socket";
import uuidv4 from "../../utils/uuidv4";
import { StartOutgoingCall } from "../../redux/slices/call";

const Header = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useResponsive("down", "md");

  const { chat_type, sidebar } = useSelector((state) => state.app);

  const { current_conversation: directConversation } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  const { current_conversation: groupConversation } = useSelector(
    (state) => state.conversation.group_chat,
  );

  const isGroupChat = chat_type === "group";
  const current_conversation = isGroupChat
    ? groupConversation
    : directConversation;

  if (!current_conversation) return null;

  const isAIConversation = Boolean(
    !isGroupChat &&
    (current_conversation.isAI || current_conversation.isSystem),
  );

  const isCallDisabled =
    isGroupChat ||
    isAIConversation ||
    Boolean(current_conversation.blockedByMe);

  const handleStartCall = (callType) => {
    if (isCallDisabled) {
      return;
    }

    const callId = uuidv4();

    const peer = {
      _id: current_conversation.user_id,
      name: current_conversation.name,
      avatar: current_conversation.img || "",
    };

    const call = {
      call_id: callId,
      conversation_id: current_conversation.id,
      call_type: callType,
      peer,
    };

    dispatch(StartOutgoingCall({ call }));

    socket?.emit("call_invite", {
      to: current_conversation.user_id,
      conversation_id: current_conversation.id,
      call_id: callId,
      call_type: callType,
    });
  };

  const handleContactSidebarToggle = () => {
    const sidebarType = isGroupChat ? "GROUP_INFO" : "CONTACT";
    const isCurrentSidebarOpen = sidebar.open && sidebar.type === sidebarType;

    if (isCurrentSidebarOpen) {
      dispatch(ToggleSidebar());
      return;
    }

    dispatch(UpdateSidebarType(sidebarType));

    if (!sidebar.open) {
      dispatch(ToggleSidebar());
    }
  };

  const handleMessageSearchOpen = () => {
    dispatch(UpdateSidebarType("MESSAGE_SEARCH"));

    if (!sidebar.open) {
      dispatch(ToggleSidebar());
    }
  };

  const handleBack = (event) => {
    event.stopPropagation();

    dispatch(ResetConversationSelection());

    if (isGroupChat) {
      dispatch(ClearCurrentGroupConversation());
    } else {
      dispatch(ClearCurrentConversation());
    }

    if (sidebar.open) {
      dispatch(ToggleSidebar());
    }
  };

  return (
    <Box
      p={isMobile ? 1 : 2}
      sx={{
        width: "100%",
        height: 72,
        boxSizing: "border-box",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#f8faff"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        sx={{ width: "100%", height: "100%" }}
      >
        <Stack
          direction="row"
          spacing={isMobile ? 1 : 2}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          {isMobile && (
            <IconButton
              onClick={handleBack}
              size="small"
              aria-label="Go back"
              sx={{ color: theme.palette.text.primary }}
            >
              <ArrowLeft size={22} />
            </IconButton>
          )}

          <Stack
            onClick={handleContactSidebarToggle}
            direction="row"
            spacing={isMobile ? 1 : 2}
            sx={{ cursor: "pointer", minWidth: 0 }}
            alignItems="center"
          >
            <Box sx={{ flexShrink: 0 }}>
              {isGroupChat ? (
                <AvatarGroup max={3}>
                  {(current_conversation.participants || []).map(
                    (participant) => (
                      <Avatar
                        key={participant._id}
                        alt={`${participant.firstName || ""} ${
                          participant.lastName || ""
                        }`.trim()}
                        src={participant.avatar}
                        sx={isMobile ? { width: 32, height: 32 } : undefined}
                      />
                    ),
                  )}
                </AvatarGroup>
              ) : current_conversation.online ? (
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                >
                  <Avatar
                    alt={current_conversation.name}
                    src={current_conversation.img}
                    sx={isMobile ? { width: 32, height: 32 } : undefined}
                  />
                </StyledBadge>
              ) : (
                <Avatar
                  alt={current_conversation.name}
                  src={current_conversation.img}
                  sx={isMobile ? { width: 32, height: 32 } : undefined}
                />
              )}
            </Box>

            <Stack spacing={0.2} sx={{ minWidth: 0 }}>
              <Typography
                variant={isMobile ? "body2" : "subtitle2"}
                sx={{ fontWeight: 600 }}
                noWrap
              >
                {isGroupChat
                  ? current_conversation.title
                  : current_conversation.name}
              </Typography>
              <Typography variant="caption" noWrap>
                {isGroupChat
                  ? `${current_conversation.participants?.length || 0} members`
                  : isAIConversation
                    ? "AI assistant"
                    : current_conversation.online
                      ? "Online"
                      : "Offline"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={isMobile ? 0.5 : 3}
          sx={{ height: "100%", flexShrink: 0 }}
        >
          <IconButton
            disabled={isCallDisabled}
            onClick={() => handleStartCall("video")}
            size={isMobile ? "small" : "medium"}
            aria-label="Start video call"
          >
            <VideoCamera size={isMobile ? 20 : 24} />
          </IconButton>

          <IconButton
            aria-label="Start voice call"
            disabled={isCallDisabled}
            onClick={() => handleStartCall("audio")}
            size={isMobile ? "small" : "medium"}
          >
            <Phone size={isMobile ? 20 : 24} />
          </IconButton>

          <IconButton
            aria-label="Search messages"
            onClick={handleMessageSearchOpen}
            size={isMobile ? "small" : "medium"}
          >
            <MagnifyingGlass size={isMobile ? 20 : 24} />
          </IconButton>

          {!isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <IconButton onClick={handleContactSidebarToggle}>
                <CaretDown
                  style={{
                    transform: sidebar.open ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </IconButton>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default Header;
