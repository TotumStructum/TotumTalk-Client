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
  User,
  Camera,
  File,
  Sticker,
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

const Actions = [
  {
    color: "#4da5fe",
    icon: <Image size={24} />,
    y: 102,
    title: "Photo/Video",
  },
  {
    color: "#1b8cfe",
    icon: <Sticker size={24} />,
    y: 172,
    title: "Stickers",
  },
  {
    color: "#0172e4",
    icon: <Camera size={24} />,
    y: 242,
    title: "Image",
  },
  {
    color: "#0159b2",
    icon: <File size={24} />,
    y: 312,
    title: "Document",
  },
  {
    color: "#013f7f",
    icon: <User size={24} />,
    y: 382,
    title: "Contact",
  },
];

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
}) => {
  const [openActions, setOpenActions] = React.useState(false);

  const handleActionClick = (title) => {
    if (title === "Document") {
      documentInputRef.current?.click();
    }

    if (title === "Photo/Video" || title === "Image") {
      mediaInputRef.current?.click();
    }

    setOpenActions(false);
  };

  return (
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
      InputProps={{
        disableUnderline: true,
        startAdornment: (
          <Stack sx={{ width: "max-content" }}>
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

            <Stack
              sx={{
                position: "relative",
                display: openActions ? "inline-block" : "none",
              }}
            >
              {Actions.map((el) => (
                <Tooltip key={el.title} placement="right" title={el.title}>
                  <Fab
                    onClick={() => {
                      handleActionClick(el.title);
                    }}
                    sx={{
                      position: "absolute",
                      top: -el.y,
                      backgroundColor: el.color,
                    }}
                    aria-label={el.title}
                  >
                    {el.icon}
                  </Fab>
                </Tooltip>
              ))}
            </Stack>

            <InputAdornment position="start">
              <IconButton
                onClick={() => {
                  setOpenActions((prev) => !prev);
                }}
              >
                <LinkSimple />
              </IconButton>
            </InputAdornment>
          </Stack>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => {
                setOpenPicker((prev) => !prev);
              }}
            >
              <Smiley />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

function Footer() {
  const theme = useTheme();
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
      p={2}
      sx={{
        width: "100%",
        height: 88,
        boxSizing: "border-box",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#f8faff"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack direction={"row"} alignItems={"center"} spacing={3}>
        <Stack sx={{ width: "100%" }}>
          <Box
            sx={{
              display: openPicker ? "inline" : "none",
              zIndex: 10,
              position: "fixed",
              bottom: 81,
              right: 100,
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
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? theme.palette.common.white
                    : "rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                boxShadow: "0px 0px 2px rgba(0,0,0,0.12)",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
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
          />
        </Stack>

        <Box
          sx={{
            height: 48,
            width: 48,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1.5,
          }}
        >
          <Stack
            sx={{ height: "100%", width: "100%" }}
            alignItems="center"
            justifyContent="center"
          >
            <IconButton aria-label="Send message" onClick={handleSend}>
              <PaperPlaneTilt color="#fff" />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export default Footer;
