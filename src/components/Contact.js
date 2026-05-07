import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { CaretRight, Phone, Star, Trash, VideoCamera, X } from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import {
  ResetConversationSelection,
  ToggleSidebar,
  UpdateSidebarType,
  showSnackbar,
  BlockUser,
} from "../redux/slices/app";
import {
  ClearCurrentConversation,
  DeleteDirectConversation,
} from "../redux/slices/conversation";

const extractFirstUrl = (text = "") => {
  const match = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);

  if (!match) return null;

  return match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
};

const Contact = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { current_conversation, current_messages } = useSelector(
    (state) => state.conversation.direct_chat,
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEveryoneDialogOpen, setDeleteEveryoneDialogOpen] =
    useState(false);

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  const handleDeleteConversation = async (scope) => {
    if (!current_conversation?.id) return;

    await dispatch(
      DeleteDirectConversation({
        conversation_id: current_conversation.id,
        scope,
      }),
    );

    dispatch(ResetConversationSelection());
    dispatch(ClearCurrentConversation());
    dispatch(ToggleSidebar());

    dispatch(
      showSnackbar({
        severity: "success",
        message:
          scope === "everyone"
            ? "Conversation deleted for everyone"
            : "Conversation deleted for you",
      }),
    );

    setDeleteDialogOpen(false);
    setDeleteEveryoneDialogOpen(false);
  };

  const handleBlockUser = async () => {
    if (!current_conversation?.user_id) return;

    await dispatch(
      BlockUser({
        user_id: current_conversation.user_id,
      }),
    );

    dispatch(ResetConversationSelection());
    dispatch(ClearCurrentConversation());
    dispatch(ToggleSidebar());

    dispatch(
      showSnackbar({
        severity: "success",
        message: "User blocked successfully",
      }),
    );

    setBlockDialogOpen(false);
  };

  if (!current_conversation) return null;

  const isProtectedSystemContact = Boolean(
    current_conversation.isAI || current_conversation.isSystem,
  );

  const sharedMedia = current_messages.filter(
    (message) => message.type === "Media" && message.file,
  );

  const sharedDocs = current_messages.filter(
    (message) => message.type === "Document" && message.file,
  );

  const sharedLinks = current_messages.filter(
    (message) =>
      message.type === "Link" || Boolean(extractFirstUrl(message.text)),
  );

  const sharedCount =
    sharedMedia.length + sharedDocs.length + sharedLinks.length;

  return (
    <>
      <Box sx={{ width: 320, height: "100vh" }}>
        <Stack sx={{ height: "100%" }}>
          <Box
            sx={{
              boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
              width: "100%",
              height: 72,
              boxSizing: "border-box",
              backgroundColor:
                theme.palette.mode === "light"
                  ? "#F8FAFF"
                  : theme.palette.background.paper,
            }}
          >
            <Stack
              sx={{ p: 2, height: "100%" }}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={3}
            >
              <Typography variant="subtitle2">Contact Info</Typography>
              <IconButton
                onClick={() => {
                  dispatch(ToggleSidebar());
                }}
              >
                <X />
              </IconButton>
            </Stack>
          </Box>

          <Stack
            p={3}
            spacing={3}
            sx={{
              flexGrow: 1,
              minHeight: 0,
              overflowY: "auto",
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <Avatar
                src={current_conversation.img}
                alt={current_conversation.name}
                sx={{ height: 72, width: 72 }}
              />
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="subtitle1" fontWeight={600}>
                  {current_conversation.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {current_conversation.email || "No e-mail available"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isProtectedSystemContact
                    ? "AI assistant"
                    : current_conversation.online
                      ? "Online"
                      : "Offline"}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" justifyContent="center" spacing={4}>
              <Stack spacing={1} alignItems="center">
                <IconButton disabled>
                  <VideoCamera />
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  Video
                </Typography>
              </Stack>

              <Stack spacing={1} alignItems="center">
                <IconButton disabled>
                  <Phone />
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  Voice
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            <Stack spacing={0.5}>
              <Typography variant="subtitle2">About</Typography>
              <Typography variant="body2" color="text.secondary">
                {current_conversation.about ||
                  (isProtectedSystemContact
                    ? "Virtual AI interlocutor in TotumTalk."
                    : "No description provided yet")}
              </Typography>
            </Stack>

            <Divider />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle2">Media, links and docs</Typography>
              <Button
                onClick={() => {
                  dispatch(UpdateSidebarType("SHARED"));
                }}
                endIcon={<CaretRight />}
              >
                {sharedCount}
              </Button>
            </Stack>

            {sharedMedia.length > 0 ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                {sharedMedia.slice(0, 3).map((message) => (
                  <Box
                    key={message._id}
                    component="img"
                    src={message.file}
                    alt="Shared media"
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 1.5,
                      objectFit: "cover",
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No shared media yet
              </Typography>
            )}

            <Divider />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ cursor: "pointer" }}
              onClick={() => {
                dispatch(UpdateSidebarType("STARRED"));
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Star size={18} />
                <Typography variant="subtitle2">Starred Messages</Typography>
              </Stack>
              <CaretRight />
            </Stack>

            <Divider />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle2">Mute notifications</Typography>
              <FormControlLabel
                control={<Switch checked={false} disabled />}
                label=""
                sx={{ mr: 0 }}
              />
            </Stack>

            <Divider />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Shared groups</Typography>
              <Typography variant="body2" color="text.secondary">
                No shared groups yet
              </Typography>
            </Stack>
          </Stack>

          {!isProtectedSystemContact ? (
            <Box
              sx={{
                height: 88,
                flexShrink: 0,
                boxSizing: "border-box",
                boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "#f8faff"
                    : theme.palette.background.paper,
                display: "flex",
                alignItems: "center",
                px: 2,
              }}
            >
              <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  startIcon={<Star size={18} />}
                  onClick={() => {
                    setBlockDialogOpen(true);
                  }}
                >
                  Block
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<Trash size={18} />}
                  onClick={() => {
                    setDeleteDialogOpen(true);
                  }}
                >
                  Delete
                </Button>
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </Box>

      <Dialog
        open={blockDialogOpen}
        onClose={() => {
          setBlockDialogOpen(false);
        }}
      >
        <DialogTitle>Block user?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to block ${current_conversation.name}? They will be removed from your friends and will not be able to message you.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setBlockDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleBlockUser}>
            Block
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
      >
        <DialogTitle>Delete conversation?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose whether to delete this conversation only for you or for both
            users.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() => {
              handleDeleteConversation("me");
            }}
          >
            Delete for me
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteEveryoneDialogOpen(true);
            }}
          >
            Delete for everyone
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteEveryoneDialogOpen}
        onClose={() => {
          setDeleteEveryoneDialogOpen(false);
        }}
      >
        <DialogTitle>Delete for everyone?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete this conversation and all messages for
            both users. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteEveryoneDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              handleDeleteConversation("everyone");
            }}
          >
            Delete for everyone
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Contact;
