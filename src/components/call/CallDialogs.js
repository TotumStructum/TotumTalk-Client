import React from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Phone, PhoneDisconnect, VideoCamera } from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import useResponsive from "../../hooks/useResponsive";
import { socket } from "../../socket";
import {
  AcceptCall,
  CancelCall,
  DeclineCall,
  EndCall,
} from "../../redux/slices/call";

const getPeerName = (peer) => {
  if (!peer) return "Unknown user";

  const fullName = `${peer.firstName || ""} ${peer.lastName || ""}`.trim();

  return fullName || peer.name || peer.email || "Unknown user";
};

const getPeerId = (call) => {
  return call?.peer?._id || call?.from?._id || call?.to?._id || null;
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const restSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${restSeconds}`;
};

const useCallDuration = (status, startedAt) => {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    if (status !== "active" || !startedAt) {
      setSeconds(0);
      return undefined;
    }

    const updateDuration = () => {
      setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };

    updateDuration();

    const intervalId = window.setInterval(updateDuration, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [status, startedAt]);

  return seconds;
};

const CallAvatar = ({ src, name, size }) => (
  <Stack spacing={1.5} alignItems="center">
    <Avatar
      src={src || ""}
      alt={name}
      sx={{
        width: size,
        height: size,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) => theme.shadows[2],
      }}
    />

    <Typography
      variant="subtitle2"
      sx={{
        maxWidth: 180,
        textAlign: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </Typography>
  </Stack>
);

const CallDialogs = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useResponsive("down", "md");

  const { status, call, started_at } = useSelector((state) => state.call);
  const currentUser = useSelector((state) => state.app.currentUser);

  const duration = useCallDuration(status, started_at);

  if (status === "idle" || !call) {
    return null;
  }

  const peer = call.peer || call.from || call.to;
  const peerId = getPeerId(call);
  const peerName = getPeerName(peer);
  const currentUserName = getPeerName(currentUser);
  const callType = call.call_type || "audio";

  const basePayload = {
    to: peerId,
    call_id: call.call_id,
    conversation_id: call.conversation_id,
    call_type: callType,
  };

  const handleAccept = () => {
    socket?.emit("call_accept", basePayload);
    dispatch(AcceptCall({ call }));
  };

  const handleDecline = () => {
    socket?.emit("call_decline", basePayload);
    dispatch(DeclineCall());
  };

  const handleCancel = () => {
    socket?.emit("call_cancel", basePayload);
    dispatch(CancelCall());
  };

  const handleEnd = () => {
    socket?.emit("call_end", basePayload);
    dispatch(EndCall());
  };

  const isIncoming = status === "incoming";
  const isOutgoing = status === "outgoing";
  const isActive = status === "active";
  const isVideo = callType === "video";

  const statusLabel = isIncoming
    ? "Incoming call"
    : isOutgoing
      ? "Calling..."
      : "Connected";

  const callTypeLabel = isVideo ? "Video call" : "Voice call";

  return (
    <Dialog
      open
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          overflow: "hidden",
          backgroundColor:
            isVideo && isActive ? "grey.900" : "background.paper",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          minHeight: isMobile ? "100vh" : 540,
          background:
            isVideo && isActive
              ? `linear-gradient(135deg, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`
              : `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.08,
                )}, ${alpha(theme.palette.background.paper, 0.95)})`,
        }}
      >
        <Box
          sx={{
            minHeight: isMobile ? "100vh" : 540,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: isMobile ? 3 : 5,
          }}
        >
          <Stack
            spacing={isMobile ? 4 : 5}
            alignItems="center"
            justifyContent="center"
            sx={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 760,
              minHeight: isMobile ? "calc(100vh - 48px)" : 440,
              borderRadius: isMobile ? 0 : 4,
              p: isMobile ? 0 : 4,
              backgroundColor:
                isVideo && isActive
                  ? alpha(theme.palette.common.black, 0.22)
                  : alpha(theme.palette.background.paper, 0.82),
              backdropFilter: "blur(12px)",
              boxShadow: isMobile ? "none" : theme.shadows[8],
            }}
          >
            {isMobile ? (
              <Stack spacing={2.5} alignItems="center">
                <Avatar
                  src={peer?.avatar || ""}
                  alt={peerName}
                  sx={{
                    width: isActive ? 132 : 112,
                    height: isActive ? 132 : 112,
                    border: (innerTheme) =>
                      `1px solid ${innerTheme.palette.divider}`,
                    boxShadow: theme.shadows[4],
                  }}
                />

                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h5">{peerName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {callTypeLabel}
                  </Typography>
                </Stack>
              </Stack>
            ) : (
              <Stack
                direction="row"
                spacing={8}
                alignItems="center"
                justifyContent="center"
                sx={{ width: "100%" }}
              >
                <CallAvatar
                  src={currentUser?.avatar || ""}
                  name={currentUserName}
                  size={150}
                />

                <CallAvatar
                  src={peer?.avatar || ""}
                  name={peerName}
                  size={150}
                />
              </Stack>
            )}

            <Stack spacing={1.25} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                {isVideo ? <VideoCamera size={24} /> : <Phone size={24} />}

                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  color={isActive ? "success.main" : "text.primary"}
                  sx={{ fontWeight: 700 }}
                >
                  {statusLabel}
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {isVideo && isActive
                  ? "Video stream will appear here after WebRTC is connected"
                  : callTypeLabel}
              </Typography>

              {isActive ? (
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 2,
                    color:
                      isVideo && isActive ? "common.white" : "text.primary",
                  }}
                >
                  {formatDuration(duration)}
                </Typography>
              ) : null}
            </Stack>

            <Stack
              direction={isIncoming ? "row" : "column"}
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{ width: isMobile ? "100%" : "auto" }}
            >
              {isIncoming ? (
                <>
                  <Button
                    color="error"
                    variant="outlined"
                    size="large"
                    startIcon={<PhoneDisconnect size={20} />}
                    onClick={handleDecline}
                    sx={{ minWidth: 130 }}
                  >
                    Decline
                  </Button>

                  <Button
                    color="success"
                    variant="contained"
                    size="large"
                    startIcon={<Phone size={20} />}
                    onClick={handleAccept}
                    sx={{ minWidth: 130 }}
                  >
                    Accept
                  </Button>
                </>
              ) : null}

              {isOutgoing ? (
                <Button
                  color="error"
                  variant="outlined"
                  size="large"
                  startIcon={<PhoneDisconnect size={20} />}
                  onClick={handleCancel}
                  sx={{
                    minWidth: isMobile ? "100%" : 160,
                    borderWidth: 1.5,
                  }}
                >
                  Cancel
                </Button>
              ) : null}

              {isActive ? (
                <Button
                  color="error"
                  variant="outlined"
                  size="large"
                  startIcon={<PhoneDisconnect size={20} />}
                  onClick={handleEnd}
                  sx={{
                    minWidth: isMobile ? "100%" : 160,
                    borderWidth: 1.5,
                  }}
                >
                  Hang Up
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CallDialogs;
