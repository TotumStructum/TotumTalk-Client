import React from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Microphone,
  MicrophoneSlash,
  Phone,
  PhoneDisconnect,
  VideoCamera,
  VideoCameraSlash,
} from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import useResponsive from "../../hooks/useResponsive";
import { socket } from "../../socket";
import { showSnackbar } from "../../redux/slices/app";
import {
  AcceptCall,
  CancelCall,
  DeclineCall,
  EndCall,
  SetCallError,
} from "../../redux/slices/call";

const ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

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

const serializeSessionDescription = (description) => {
  if (!description) return null;

  return {
    type: description.type,
    sdp: description.sdp,
  };
};

const isClosedPeerConnection = (connection) => {
  if (!connection) return true;

  return (
    connection.signalingState === "closed" ||
    connection.connectionState === "closed"
  );
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

const CallControlButton = ({
  icon,
  label,
  color = "default",
  active = false,
  onClick,
}) => {
  const isDanger = color === "error";

  return (
    <Stack spacing={0.75} alignItems="center">
      <IconButton
        onClick={onClick}
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          color: isDanger
            ? "common.white"
            : active
              ? "common.black"
              : "text.primary",
          backgroundColor: isDanger
            ? "error.main"
            : active
              ? "warning.main"
              : "background.paper",
          border: (theme) =>
            isDanger
              ? "none"
              : `1px solid ${alpha(theme.palette.text.primary, 0.16)}`,
          boxShadow: (theme) => theme.shadows[4],
          "&:hover": {
            backgroundColor: isDanger
              ? "error.dark"
              : active
                ? "warning.dark"
                : "action.hover",
          },
          "&.Mui-disabled": {
            opacity: 0.42,
          },
        }}
      >
        {icon}
      </IconButton>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          maxWidth: 86,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};

const CallDialogs = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useResponsive("down", "md");

  const { status, direction, call, started_at } = useSelector(
    (state) => state.call,
  );
  const currentUser = useSelector((state) => state.app.currentUser);

  const peerConnectionRef = React.useRef(null);
  const localStreamRef = React.useRef(null);
  const remoteStreamRef = React.useRef(null);
  const pendingIceCandidatesRef = React.useRef([]);
  const hasStartedOfferRef = React.useRef(false);
  const activeCallIdRef = React.useRef(null);

  const localVideoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);
  const remoteAudioRef = React.useRef(null);

  const [localStream, setLocalStream] = React.useState(null);
  const [remoteStream, setRemoteStream] = React.useState(null);
  const [mediaStatus, setMediaStatus] = React.useState("idle");
  const [mediaError, setMediaError] = React.useState(null);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = React.useState(false);
  const [isCameraOff, setIsCameraOff] = React.useState(false);

  const duration = useCallDuration(status, started_at);

  const peer = call?.peer || call?.from || call?.to || null;
  const peerId = getPeerId(call);
  const peerName = getPeerName(peer);
  const currentUserName = getPeerName(currentUser);
  const callType = call?.call_type || "audio";
  const isVideo = callType === "video";
  const isDarkMode = theme.palette.mode === "dark";

  const basePayload = React.useMemo(
    () => ({
      to: peerId,
      call_id: call?.call_id,
      conversation_id: call?.conversation_id,
      call_type: callType,
    }),
    [peerId, call?.call_id, call?.conversation_id, callType],
  );

  const cleanupMedia = React.useCallback(() => {
    hasStartedOfferRef.current = false;
    pendingIceCandidatesRef.current = [];
    activeCallIdRef.current = null;

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setMediaStatus("idle");
    setMediaError(null);
    setIsMicrophoneMuted(false);
    setIsCameraOff(false);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  }, []);

  const handleMediaFailure = React.useCallback(
    (error) => {
      const message =
        error?.name === "NotAllowedError"
          ? "Camera or microphone permission was denied"
          : error?.message || "Failed to start media call";

      socket?.emit("call_end", basePayload);

      cleanupMedia();
      setMediaError(message);

      dispatch(SetCallError({ message }));
      dispatch(
        showSnackbar({
          severity: "error",
          message,
        }),
      );
    },
    [basePayload, cleanupMedia, dispatch],
  );

  const ensureLocalStream = React.useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
      throw new Error("WebRTC is not supported in this browser");
    }

    setMediaStatus("requesting");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        : false,
    });

    localStreamRef.current = stream;
    setLocalStream(stream);
    setMediaStatus("ready");

    return stream;
  }, [isVideo]);

  const addPendingIceCandidates = React.useCallback(async (connection) => {
    if (isClosedPeerConnection(connection)) {
      pendingIceCandidatesRef.current = [];
      return;
    }

    const candidates = pendingIceCandidatesRef.current;

    pendingIceCandidatesRef.current = [];

    for (const candidate of candidates) {
      if (!isClosedPeerConnection(connection)) {
        await connection.addIceCandidate(candidate);
      }
    }
  }, []);

  const ensurePeerConnection = React.useCallback(async () => {
    const existingConnection = peerConnectionRef.current;

    if (existingConnection && !isClosedPeerConnection(existingConnection)) {
      return existingConnection;
    }

    if (existingConnection) {
      existingConnection.onicecandidate = null;
      existingConnection.ontrack = null;
      existingConnection.onconnectionstatechange = null;
      peerConnectionRef.current = null;
    }

    const connection = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });

    connection.onicecandidate = (event) => {
      if (!event.candidate || isClosedPeerConnection(connection)) {
        return;
      }

      socket?.emit("ice_candidate", {
        ...basePayload,
        candidate: event.candidate.toJSON
          ? event.candidate.toJSON()
          : event.candidate,
      });
    };

    connection.ontrack = (event) => {
      if (isClosedPeerConnection(connection)) {
        return;
      }

      const [streamFromEvent] = event.streams;
      const nextRemoteStream =
        streamFromEvent || remoteStreamRef.current || new MediaStream();

      if (!streamFromEvent && event.track) {
        nextRemoteStream.addTrack(event.track);
      }

      remoteStreamRef.current = nextRemoteStream;
      setRemoteStream(nextRemoteStream);
      setMediaStatus("connected");
    };

    connection.onconnectionstatechange = () => {
      if (connection.connectionState === "connected") {
        setMediaStatus("connected");
        return;
      }

      if (
        connection.connectionState === "failed" ||
        connection.connectionState === "disconnected"
      ) {
        setMediaStatus(connection.connectionState);
      }
    };

    peerConnectionRef.current = connection;

    const stream = await ensureLocalStream();

    if (
      peerConnectionRef.current !== connection ||
      isClosedPeerConnection(connection)
    ) {
      stream.getTracks().forEach((track) => track.stop());
      return null;
    }

    stream.getTracks().forEach((track) => {
      if (isClosedPeerConnection(connection)) {
        return;
      }

      const alreadyAdded = connection
        .getSenders()
        .some((sender) => sender.track === track);

      if (!alreadyAdded) {
        connection.addTrack(track, stream);
      }
    });

    return connection;
  }, [basePayload, ensureLocalStream]);

  const isEventForCurrentCall = React.useCallback(
    (data) => {
      return Boolean(call?.call_id && data?.call_id === call.call_id);
    },
    [call?.call_id],
  );

  const handleCallOffer = React.useCallback(
    async (data) => {
      if (!isEventForCurrentCall(data) || !data.offer) {
        return;
      }

      try {
        const connection = await ensurePeerConnection();

        if (!connection || isClosedPeerConnection(connection)) {
          return;
        }

        await connection.setRemoteDescription(data.offer);
        await addPendingIceCandidates(connection);

        const answer = await connection.createAnswer();

        await connection.setLocalDescription(answer);

        socket?.emit("call_answer", {
          ...basePayload,
          answer: serializeSessionDescription(connection.localDescription),
        });
      } catch (error) {
        handleMediaFailure(error);
      }
    },
    [
      addPendingIceCandidates,
      basePayload,
      ensurePeerConnection,
      handleMediaFailure,
      isEventForCurrentCall,
    ],
  );

  const handleCallAnswer = React.useCallback(
    async (data) => {
      if (!isEventForCurrentCall(data) || !data.answer) {
        return;
      }

      const connection = peerConnectionRef.current;

      if (!connection || isClosedPeerConnection(connection)) {
        return;
      }

      try {
        await connection.setRemoteDescription(data.answer);
        await addPendingIceCandidates(connection);
      } catch (error) {
        handleMediaFailure(error);
      }
    },
    [addPendingIceCandidates, handleMediaFailure, isEventForCurrentCall],
  );

  const handleIceCandidate = React.useCallback(
    async (data) => {
      if (!isEventForCurrentCall(data) || !data.candidate) {
        return;
      }

      const candidate = data.candidate;
      const connection = peerConnectionRef.current;

      if (!connection) {
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      if (isClosedPeerConnection(connection)) {
        return;
      }

      if (!connection.remoteDescription) {
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      try {
        await connection.addIceCandidate(candidate);
      } catch (error) {
        handleMediaFailure(error);
      }
    },
    [handleMediaFailure, isEventForCurrentCall],
  );

  React.useEffect(() => {
    if (!socket || !call?.call_id) {
      return undefined;
    }

    socket.on("call_offer", handleCallOffer);
    socket.on("call_answer", handleCallAnswer);
    socket.on("ice_candidate", handleIceCandidate);

    return () => {
      socket.off("call_offer", handleCallOffer);
      socket.off("call_answer", handleCallAnswer);
      socket.off("ice_candidate", handleIceCandidate);
    };
  }, [call?.call_id, handleCallAnswer, handleCallOffer, handleIceCandidate]);

  React.useEffect(() => {
    if (!remoteAudioRef.current || !remoteStream || isVideo) {
      return;
    }

    remoteAudioRef.current.srcObject = remoteStream;

    const playPromise = remoteAudioRef.current.play?.();

    if (playPromise?.catch) {
      playPromise.catch(() => {
        // Browser can block autoplay in some cases.
        // The user already accepted the call, so retry usually works after interaction.
      });
    }
  }, [isVideo, remoteStream]);

  React.useEffect(() => {
    if (
      status !== "active" ||
      direction !== "outgoing" ||
      !call?.call_id ||
      hasStartedOfferRef.current
    ) {
      return;
    }

    hasStartedOfferRef.current = true;

    const startOffer = async () => {
      const connection = await ensurePeerConnection();

      if (!connection || isClosedPeerConnection(connection)) {
        return;
      }

      const offer = await connection.createOffer();

      await connection.setLocalDescription(offer);

      socket?.emit("call_offer", {
        ...basePayload,
        offer: serializeSessionDescription(connection.localDescription),
      });
    };

    startOffer().catch(handleMediaFailure);
  }, [
    basePayload,
    call?.call_id,
    direction,
    ensurePeerConnection,
    handleMediaFailure,
    status,
  ]);

  React.useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  React.useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  React.useEffect(() => {
    if (status === "idle") {
      cleanupMedia();
    }
  }, [cleanupMedia, status]);

  React.useEffect(() => {
    if (!call?.call_id) {
      return;
    }

    if (activeCallIdRef.current && activeCallIdRef.current !== call.call_id) {
      cleanupMedia();
    }

    activeCallIdRef.current = call.call_id;
  }, [call?.call_id, cleanupMedia]);

  React.useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, [cleanupMedia]);

  if (status === "idle" || !call) {
    return null;
  }

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
    cleanupMedia();
    dispatch(EndCall());
  };

  const handleToggleMicrophone = () => {
    const audioTracks = localStreamRef.current?.getAudioTracks?.() || [];

    if (audioTracks.length === 0) {
      return;
    }

    const nextMuted = !isMicrophoneMuted;

    audioTracks.forEach((track) => {
      track.enabled = !nextMuted;
    });

    setIsMicrophoneMuted(nextMuted);
  };

  const handleToggleCamera = () => {
    const videoTracks = localStreamRef.current?.getVideoTracks?.() || [];

    if (videoTracks.length === 0) {
      return;
    }

    const nextCameraOff = !isCameraOff;

    videoTracks.forEach((track) => {
      track.enabled = !nextCameraOff;
    });

    setIsCameraOff(nextCameraOff);
  };

  const isIncoming = status === "incoming";
  const isOutgoing = status === "outgoing";
  const isActive = status === "active";

  const statusLabel = isIncoming
    ? "Incoming call"
    : isOutgoing
      ? "Calling..."
      : mediaStatus === "connected"
        ? "Connected"
        : "Connecting media...";

  const callTypeLabel = isVideo ? "Video call" : "Voice call";

  const renderVideoContent = () => (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: isMobile ? 320 : 360,
        borderRadius: isMobile ? 3 : 4,
        overflow: "hidden",
        backgroundColor: "grey.900",
        boxShadow: theme.shadows[8],
      }}
    >
      {remoteStream ? (
        <Box
          component="video"
          ref={remoteVideoRef}
          autoPlay
          playsInline
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <Stack
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ width: "100%", height: "100%", color: "common.white" }}
        >
          <Avatar
            src={peer?.avatar || ""}
            alt={peerName}
            sx={{ width: 112, height: 112 }}
          />

          <Typography variant="subtitle1">{peerName}</Typography>

          <Typography variant="body2" sx={{ opacity: 0.72 }}>
            Waiting for remote video...
          </Typography>
        </Stack>
      )}

      {localStream && !isCameraOff ? (
        <Box
          component="video"
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          sx={{
            position: "absolute",
            right: 16,
            bottom: 16,
            width: isMobile ? 110 : 160,
            height: isMobile ? 150 : 110,
            borderRadius: 2,
            objectFit: "cover",
            backgroundColor: "grey.800",
            border: "2px solid",
            borderColor: "common.white",
            boxShadow: theme.shadows[8],
          }}
        />
      ) : null}
      {localStream && isCameraOff ? (
        <Stack
          spacing={0.5}
          alignItems="center"
          justifyContent="center"
          sx={{
            position: "absolute",
            right: 16,
            bottom: 16,
            width: isMobile ? 110 : 160,
            height: isMobile ? 150 : 110,
            borderRadius: 2,
            backgroundColor: "grey.800",
            border: "2px solid",
            borderColor: "common.white",
            boxShadow: theme.shadows[8],
            color: "common.white",
          }}
        >
          <VideoCameraSlash size={24} />
          <Typography variant="caption">Camera off</Typography>
        </Stack>
      ) : null}
    </Box>
  );

  const renderAudioAvatars = () =>
    isMobile ? (
      <Stack spacing={2.5} alignItems="center">
        <Avatar
          src={peer?.avatar || ""}
          alt={peerName}
          sx={{
            width: isActive ? 104 : 96,
            height: isActive ? 104 : 96,
            border: (innerTheme) => `1px solid ${innerTheme.palette.divider}`,
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

        <CallAvatar src={peer?.avatar || ""} name={peerName} size={150} />
      </Stack>
    );

  const renderActiveControls = () => (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isMobile ? 2 : 2.5,
        flexWrap: "wrap",
        px: isMobile ? 1 : 0,
        pb: isMobile ? "max(12px, env(safe-area-inset-bottom))" : 0,
      }}
    >
      <CallControlButton
        active={isMicrophoneMuted}
        label={isMicrophoneMuted ? "Unmute" : "Mute"}
        icon={
          isMicrophoneMuted ? (
            <MicrophoneSlash size={24} />
          ) : (
            <Microphone size={24} />
          )
        }
        onClick={handleToggleMicrophone}
      />

      {isVideo ? (
        <CallControlButton
          active={isCameraOff}
          label={isCameraOff ? "Camera On" : "Camera Off"}
          icon={
            isCameraOff ? (
              <VideoCameraSlash size={24} />
            ) : (
              <VideoCamera size={24} />
            )
          }
          onClick={handleToggleCamera}
        />
      ) : null}

      <CallControlButton
        color="error"
        label="Hang Up"
        icon={<PhoneDisconnect size={24} />}
        onClick={handleEnd}
      />
    </Box>
  );

  return (
    <Dialog
      open
      fullScreen={false}
      fullWidth
      maxWidth={isMobile ? "xs" : "md"}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: "background.paper",
          m: isMobile ? 2 : 3,
          width: isMobile ? "calc(100% - 32px)" : undefined,
          maxHeight: isMobile ? "calc(100vh - 32px)" : undefined,
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          minHeight: isMobile ? "auto" : 540,
          background:
            isVideo && isActive && isDarkMode
              ? `linear-gradient(135deg, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`
              : `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.08,
                )}, ${alpha(theme.palette.background.paper, 0.96)})`,
        }}
      >
        {!isVideo ? <audio ref={remoteAudioRef} autoPlay playsInline /> : null}
        <Box
          sx={{
            minHeight: isMobile ? "auto" : 540,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: isMobile ? 2 : 5,
            py: isMobile ? 2.5 : 5,
          }}
        >
          <Stack
            spacing={isMobile ? 3 : 4}
            alignItems="center"
            justifyContent="center"
            sx={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 760,
              minHeight: isMobile ? "auto" : 440,
              borderRadius: 3,
              p: isMobile ? 2 : 4,
              backgroundColor:
                isVideo && isActive && isDarkMode
                  ? alpha(theme.palette.common.black, 0.22)
                  : alpha(theme.palette.background.paper, 0.9),
              backdropFilter: "blur(12px)",
              boxShadow: isMobile ? "none" : theme.shadows[8],
            }}
          >
            {isVideo && isActive ? renderVideoContent() : renderAudioAvatars()}

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

              <Typography
                variant="body2"
                color={isVideo && isActive ? "grey.300" : "text.secondary"}
              >
                {mediaError || callTypeLabel}
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

              {isActive ? renderActiveControls() : null}
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CallDialogs;
