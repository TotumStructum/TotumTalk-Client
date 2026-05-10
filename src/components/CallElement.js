import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import StyledBadge from "./StyledBadge";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  VideoCamera,
} from "phosphor-react";

const getFullName = (user) => {
  if (!user) return "Unknown contact";

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return fullName || user.name || user.email || "Unknown contact";
};

const formatCallTime = (value) => {
  if (!value) return "No call time";

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (seconds = 0) => {
  if (!seconds) return "00:00";

  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const restSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${restSeconds}`;
};

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "success";
    case "missed":
    case "declined":
      return "error";
    case "cancelled":
      return "warning";
    case "active":
    case "ringing":
      return "info";
    default:
      return "default";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "missed":
      return "Missed";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
    case "active":
      return "Active";
    case "ringing":
      return "Ringing";
    default:
      return "Unknown";
  }
};

const CallLogElement = ({
  log,
  currentUserId,
  onStartAudio,
  onStartVideo,
  disabled = false,
}) => {
  const isOutgoing = log?.caller?._id?.toString() === currentUserId;
  const peer = isOutgoing ? log?.receiver : log?.caller;
  const peerName = getFullName(peer);
  const isMissed = log?.status === "missed" || log?.status === "declined";
  const isVideo = log?.call_type === "video";

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.background.default,
      }}
      p={2}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2} minWidth={0}>
          <Avatar src={peer?.avatar || ""} alt={peerName} />

          <Stack spacing={0.7} minWidth={0}>
            <Typography variant="subtitle2" noWrap>
              {peerName}
            </Typography>

            <Stack spacing={1} alignItems="center" direction="row">
              {isOutgoing ? (
                <ArrowUpRight color={isMissed ? "red" : "green"} />
              ) : (
                <ArrowDownLeft color={isMissed ? "red" : "green"} />
              )}

              {isVideo ? <VideoCamera size={16} /> : <Phone size={16} />}

              <Typography variant="caption" color="text.secondary" noWrap>
                {isOutgoing ? "Outgoing" : "Incoming"} ·{" "}
                {formatCallTime(log?.started_at)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                color={getStatusColor(log?.status)}
                label={getStatusLabel(log?.status)}
              />

              {log?.status === "completed" ? (
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(log?.duration_seconds)}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center">
          <Tooltip title="Voice call">
            <span>
              <IconButton
                disabled={disabled}
                aria-label={`Start voice call with ${peerName}`}
                onClick={() => onStartAudio?.(log)}
              >
                <Phone color={disabled ? "gray" : "green"} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Video call">
            <span>
              <IconButton
                disabled={disabled}
                aria-label={`Start video call with ${peerName}`}
                onClick={() => onStartVideo?.(log)}
              >
                <VideoCamera color={disabled ? "gray" : "green"} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
};

const CallElement = ({
  online = false,
  name = "Unknown contact",
  img = "",
  disabled = false,
  onStartAudio,
  onStartVideo,
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.background.default,
      }}
      p={2}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2} minWidth={0}>
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar src={img} alt={name} />
            </StyledBadge>
          ) : (
            <Avatar src={img} alt={name} />
          )}

          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center">
          <IconButton
            disabled={disabled}
            aria-label={`Start voice call with ${name}`}
            onClick={onStartAudio}
          >
            <Phone color={disabled ? "gray" : "green"} />
          </IconButton>

          <IconButton
            disabled={disabled}
            aria-label={`Start video call with ${name}`}
            onClick={onStartVideo}
          >
            <VideoCamera color={disabled ? "gray" : "green"} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export { CallElement, CallLogElement };
