import {
  Box,
  Fab,
  IconButton,
  InputAdornment,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  LinkSimple,
  Smiley,
  PaperPlaneTilt,
  File,
  Image,
  X,
} from "phosphor-react";
import React from "react";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import StyledInput from "../StyledInput";
import { socket } from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import axios from "../../utils/axios";
import {
  ClearDirectReplyMessage,
  ClearGroupReplyMessage,
} from "../../redux/slices/conversation";
import useResponsive from "../../hooks/useResponsive";

const URL_DETECTION_REGEX =
  /((?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#][^\s]*)?)/i;

const containsUrl = (text = "") => {
  return URL_DETECTION_REGEX.test(text);
};

const ChatInput = ({
  openPicker,
  setOpenPicker,
  value,
  setValue,
  handleSend,
  documentInputRef,
  handleDocumentSelected,
  mediaInputRef,
  handleMediaSelected,
  isMobile,
}) => {
  const [openActions, setOpenActions] = React.useState(false);

  const uploadActions = [
    {
      color: "#4da5fe",
      icon: <Image size={isMobile ? 20 : 24} />,
      title: "Photo/Video",
      action: () => mediaInputRef.current?.click(),
    },
    {
      color: "#0159b2",
      icon: <File size={isMobile ? 20 : 24} />,
      title: "Document",
      action: () => documentInputRef.current?.click(),
    },
  ];

  const handleActionClick = (action) => {
    action();
    setOpenActions(false);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", minWidth: 0 }}>
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        style={{ display: "none" }}
        onChange={handleDocumentSelected}
        aria-label="Document file input"
      />

      <input
        ref={mediaInputRef}
        type="file"
        aria-label="Media file input"
        accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={handleMediaSelected}
      />

      {openActions ? (
        <Stack
          spacing={1}
          sx={{
            position: "absolute",
            left: 0,
            bottom: "calc(100% + 8px)",
            zIndex: (t) => t.zIndex.modal,
          }}
        >
          {uploadActions.map((el) => (
            <Tooltip key={el.title} placement="right" title={el.title}>
              <Fab
                size={isMobile ? "small" : "medium"}
                onClick={() => {
                  handleActionClick(el.action);
                }}
                sx={{
                  backgroundColor: el.color,
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: el.color,
                  },
                }}
                aria-label={el.title}
              >
                {el.icon}
              </Fab>
            </Tooltip>
          ))}
        </Stack>
      ) : null}

      <StyledInput
        fullWidth
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Write a message..."
        variant="filled"
        sx={{
          "& .MuiFilledInput-root": {
            minHeight: isMobile ? 44 : 48,
            borderRadius: 2,
            alignItems: "center",
            overflow: "visible",
            pr: 0.5,
          },
          "& .MuiInputBase-input": {
            py: isMobile ? 1 : 1.25,
            fontSize: isMobile ? "0.95rem" : undefined,
          },
          "& .MuiInputAdornment-root": {
            mt: "0 !important",
          },
        }}
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                aria-label="Open upload actions"
                size={isMobile ? "small" : "medium"}
                onClick={() => {
                  setOpenActions((prev) => !prev);
                }}
              >
                <LinkSimple size={isMobile ? 20 : 24} />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Open emoji picker"
                size={isMobile ? "small" : "medium"}
                onClick={() => {
                  setOpenPicker((prev) => !prev);
                }}
              >
                <Smiley size={isMobile ? 20 : 24} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

function Footer() {
  const theme = useTheme();
  const isMobile = useResponsive("down", "md");
  const dispatch = useDispatch();
  const [openPicker, setOpenPicker] = React.useState(false);
  const [value, setValue] = React.useState("");
  const documentInputRef = React.useRef(null);
  const mediaInputRef = React.useRef(null);

  const { room_id, chat_type } = useSelector((state) => state.app);
  const { token } = useSelector((state) => state.auth);

  const {
    current_conversation: directConversation,
    current_reply: directReply,
  } = useSelector((state) => state.conversation.direct_chat);

  const { current_conversation: groupConversation, current_reply: groupReply } =
    useSelector((state) => state.conversation.group_chat);

  const isGroupChat = chat_type === "group";

  const currentReply = isGroupChat ? groupReply : directReply;

  const getReplyPreviewText = (reply) => {
    if (!reply) return "";

    if (reply.text) return reply.text;

    if (reply.type === "Document") return "Document";
    if (reply.type === "Media") return "Media";

    return "Message";
  };

  const clearReply = () => {
    dispatch(
      isGroupChat ? ClearGroupReplyMessage() : ClearDirectReplyMessage(),
    );
  };

  const handleSend = () => {
    const trimmed = value.trim();

    if (!trimmed || !socket || !room_id) return;

    const messageType = containsUrl(trimmed) ? "Link" : "Text";

    if (isGroupChat) {
      if (!groupConversation) return;

      const payload = {
        group_id: room_id,
        message: trimmed,
        type: messageType,
      };

      if (currentReply?.messageId) {
        payload.reply_to = currentReply.messageId;
      }

      socket.emit("group_text_message", payload);

      setValue("");

      clearReply();

      return;
    }

    if (!directConversation) return;

    const payload = {
      to: directConversation.user_id,
      message: trimmed,
      conversation_id: room_id,
      type: messageType,
    };

    if (currentReply?.messageId) {
      payload.reply_to = currentReply.messageId;
    }

    socket.emit("text_message", payload);

    setValue("");
    clearReply();
  };

  const uploadAndSendFileMessage = async ({
    selectedFile,
    uploadPath,
    messageType,
    emptyFileError,
  }) => {
    if (!selectedFile || !socket || !room_id || !token) {
      return;
    }

    if (isGroupChat && !groupConversation) {
      return;
    }

    if (!isGroupChat && !directConversation) {
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await axios.post(uploadPath, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const fileUrl = response?.data?.data?.fileUrl;

    if (!fileUrl) {
      throw new Error(emptyFileError);
    }

    const caption = value.trim();

    if (isGroupChat) {
      const payload = {
        group_id: room_id,
        file: fileUrl,
        type: messageType,
        text: caption,
      };

      if (currentReply?.messageId) {
        payload.reply_to = currentReply.messageId;
      }

      socket.emit("group_file_message", payload);
    } else {
      const payload = {
        to: directConversation.user_id,
        conversation_id: room_id,
        file: fileUrl,
        type: messageType,
        text: caption,
      };

      if (currentReply?.messageId) {
        payload.reply_to = currentReply.messageId;
      }

      socket.emit("file_message", payload);
    }

    setValue("");
    clearReply();
  };

  const handleDocumentSelected = async (event) => {
    const selectedFile = event.target.files?.[0];

    try {
      await uploadAndSendFileMessage({
        selectedFile,
        uploadPath: "/upload/document",
        messageType: "Document",
        emptyFileError: "Document upload did not return fileUrl",
      });
    } catch (error) {
      console.error(error);
    } finally {
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleMediaSelected = async (event) => {
    const selectedFile = event.target.files?.[0];

    try {
      await uploadAndSendFileMessage({
        selectedFile,
        uploadPath: "/upload/media",
        messageType: "Media",
        emptyFileError: "Media upload did not return fileUrl",
      });
    } catch (error) {
      console.error(error);
    } finally {
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        flexShrink: 0,
        boxSizing: "border-box",
        px: isMobile ? 1 : 2,
        py: isMobile ? 1 : 2,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#f8faff"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-end"
        spacing={isMobile ? 1 : 2}
        sx={{ width: "100%" }}
      >
        <Stack sx={{ width: "100%", minWidth: 0 }}>
          <Box
            sx={{
              display: openPicker ? "block" : "none",
              zIndex: 10,
              position: "fixed",
              bottom: isMobile ? 72 : 81,
              right: isMobile ? 8 : 100,
              maxWidth: isMobile ? "calc(100vw - 16px)" : "auto",
            }}
          >
            <Picker
              theme={theme.palette.mode}
              data={data}
              onEmojiSelect={(emoji) => {
                setValue((prev) => prev + (emoji.native || ""));
              }}
            />
          </Box>

          {currentReply ? (
            <Box
              sx={{
                mb: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 1.5,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? theme.palette.common.white
                    : "rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                boxShadow: "0px 0px 2px rgba(0,0,0,0.12)",
                maxHeight: isMobile ? 64 : 76,
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Stack sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="primary"
                    fontWeight={600}
                  >
                    Replying to message
                  </Typography>
                  <Typography variant="body2" noWrap color="text.secondary">
                    {getReplyPreviewText(currentReply)}
                  </Typography>
                </Stack>

                <IconButton
                  aria-label="Cancel reply"
                  size="small"
                  onClick={clearReply}
                  sx={{ flexShrink: 0 }}
                >
                  <X size={16} />
                </IconButton>
              </Stack>
            </Box>
          ) : null}

          <ChatInput
            openPicker={openPicker}
            setOpenPicker={setOpenPicker}
            value={value}
            setValue={setValue}
            handleSend={handleSend}
            documentInputRef={documentInputRef}
            handleDocumentSelected={handleDocumentSelected}
            mediaInputRef={mediaInputRef}
            handleMediaSelected={handleMediaSelected}
            isMobile={isMobile}
          />
        </Stack>

        <Box
          sx={{
            height: isMobile ? 44 : 48,
            width: isMobile ? 44 : 48,
            flexShrink: 0,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1.5,
          }}
        >
          <Stack
            sx={{ height: "100%", width: "100%" }}
            alignItems="center"
            justifyContent="center"
          >
            <IconButton
              aria-label="Send message"
              onClick={handleSend}
              size={isMobile ? "small" : "medium"}
            >
              <PaperPlaneTilt color="#fff" size={isMobile ? 20 : 24} />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export default Footer;
