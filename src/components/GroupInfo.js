import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import { CaretRight, SignOut, X } from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import {
  LeaveGroupConversation,
  ToggleSidebar,
  UpdateSidebarType,
  showSnackbar,
} from "../redux/slices/app";

const getParticipantName = (participant) => {
  return (
    `${participant?.firstName || ""} ${participant?.lastName || ""}`.trim() ||
    participant?.email ||
    "User"
  );
};

const extractFirstUrl = (text = "") => {
  const match = text.match(
    /((?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#][^\s]*)?)/i,
  );

  if (!match) return null;

  return match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
};

const GroupInfo = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const { current_conversation, current_messages } = useSelector(
    (state) => state.conversation.group_chat,
  );

  if (!current_conversation) return null;

  const participants = current_conversation.participants || [];

  const handleLeaveGroup = async () => {
    if (!current_conversation?._id) return;

    try {
      await dispatch(
        LeaveGroupConversation({
          group_id: current_conversation._id,
        }),
      );

      dispatch(ToggleSidebar());

      dispatch(
        showSnackbar({
          severity: "success",
          message: "You left the group",
        }),
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to leave group",
        }),
      );
    } finally {
      setLeaveDialogOpen(false);
    }
  };

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
              <Typography variant="subtitle2">Group Info</Typography>
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
              <AvatarGroup max={4}>
                {participants.map((participant) => (
                  <Avatar
                    key={participant._id}
                    src={participant.avatar}
                    alt={getParticipantName(participant)}
                  />
                ))}
              </AvatarGroup>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  textAlign="center"
                >
                  {current_conversation.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {participants.length} members
                </Typography>
              </Stack>
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

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Participants</Typography>

              {participants.map((participant) => (
                <Stack
                  key={participant._id}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <Avatar
                    src={participant.avatar}
                    alt={getParticipantName(participant)}
                    sx={{ width: 36, height: 36 }}
                  />
                  <Stack sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {getParticipantName(participant)}
                    </Typography>
                    {participant.email ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {participant.email}
                      </Typography>
                    ) : null}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Divider />

          <Button
            color="error"
            variant="outlined"
            startIcon={<SignOut size={18} />}
            onClick={() => {
              setLeaveDialogOpen(true);
            }}
          >
            Leave group
          </Button>
        </Stack>
      </Box>
      <Dialog
        open={leaveDialogOpen}
        onClose={() => {
          setLeaveDialogOpen(false);
        }}
      >
        <DialogTitle>Leave group?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You will stop seeing this group in your group list. Existing
            messages will stay available for the remaining members.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLeaveDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleLeaveGroup}>
            Leave group
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupInfo;
