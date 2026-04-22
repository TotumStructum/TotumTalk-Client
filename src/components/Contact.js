import {
  Avatar,
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { CaretRight, Phone, Star, Trash, VideoCamera, X } from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import { ToggleSidebar, UpdateSidebarType } from "../redux/slices/app";

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

  if (!current_conversation) return null;

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
            sx={{ p: 2 }}
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
                {current_conversation.online ? "Online" : "Offline"}
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
              {current_conversation.about || "No description provided yet"}
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

        <Box
          sx={{
            height: 88,
            flexShrink: 0,
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
              disabled
              startIcon={<Star size={18} />}
            >
              Block
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              disabled
              startIcon={<Trash size={18} />}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default Contact;
