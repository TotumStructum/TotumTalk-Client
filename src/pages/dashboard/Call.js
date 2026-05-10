import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";

import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { useTheme } from "@mui/material/styles";

import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, Plus } from "phosphor-react";
import { SimpleBarStyle } from "../../components/Scrollbar";
import StartCall from "../../sections/main/StartCall";
import useResponsive from "../../hooks/useResponsive";
import { useDispatch, useSelector } from "react-redux";
import { FetchCallLogs, StartOutgoingCall } from "../../redux/slices/call";
import { CallLogElement } from "../../components/CallElement";
import { socket } from "../../socket";
import uuidv4 from "../../utils/uuidv4";

const getFullName = (user) => {
  if (!user) return "Unknown contact";

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return fullName || user.name || user.email || "Unknown contact";
};

const Call = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useResponsive("down", "md");

  const [openDialog, setOpenDialog] = useState(false);
  const [query, setQuery] = useState("");

  const currentUserId = window.localStorage.getItem("user_id");

  const {
    logs,
    isLoadingLogs,
    status: callStatus,
  } = useSelector((state) => state.call);

  useEffect(() => {
    dispatch(FetchCallLogs());
  }, [dispatch]);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return logs;
    }

    return logs.filter((log) => {
      const isOutgoing = log?.caller?._id?.toString() === currentUserId;
      const peer = isOutgoing ? log?.receiver : log?.caller;
      const peerName = getFullName(peer).toLowerCase();

      return (
        peerName.includes(normalizedQuery) ||
        log?.status?.toLowerCase().includes(normalizedQuery) ||
        log?.call_type?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [currentUserId, logs, query]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const startCallFromLog = (log, callType) => {
    if (callStatus !== "idle") {
      return;
    }

    const isOutgoing = log?.caller?._id?.toString() === currentUserId;
    const peer = isOutgoing ? log?.receiver : log?.caller;

    if (!peer?._id || !log?.conversation) {
      return;
    }

    const callId = uuidv4();
    const peerName = getFullName(peer);

    const call = {
      call_id: callId,
      conversation_id: log.conversation,
      call_type: callType,
      peer: {
        _id: peer._id,
        firstName: peer.firstName || "",
        lastName: peer.lastName || "",
        name: peerName,
        avatar: peer.avatar || "",
        email: peer.email || "",
      },
    };

    dispatch(StartOutgoingCall({ call }));

    socket?.emit("call_invite", {
      to: peer._id,
      conversation_id: log.conversation,
      call_id: callId,
      call_type: callType,
    });
  };

  return (
    <>
      <Stack direction="row" sx={{ width: "100%", height: "100%" }}>
        <Box
          sx={{
            height: isMobile ? "100%" : "100vh",
            width: isMobile ? "100vw" : 320,
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.paper,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Stack p={isMobile ? 2 : 3} spacing={2} sx={{ height: "100%" }}>
            <Stack>
              <Typography variant="h5">Call Logs</Typography>
            </Stack>

            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709ce6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                inputProps={{ "aria-label": "search call logs" }}
              />
            </Search>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2" component={Link}>
                Start a call
              </Typography>

              <IconButton
                aria-label="Start call"
                onClick={() => {
                  setOpenDialog(true);
                }}
              >
                <Plus style={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Stack>

            <Divider />

            <SimpleBarStyle
              timeout={500}
              clickOnTrack={false}
              sx={{ flexGrow: 1, minHeight: 0 }}
            >
              <Stack spacing={1.5}>
                {isLoadingLogs ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading call logs...
                  </Typography>
                ) : null}

                {!isLoadingLogs && filteredLogs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No call logs yet.
                  </Typography>
                ) : null}

                {filteredLogs.map((log) => (
                  <CallLogElement
                    key={log._id}
                    log={log}
                    currentUserId={currentUserId}
                    disabled={callStatus !== "idle"}
                    onStartAudio={(selectedLog) =>
                      startCallFromLog(selectedLog, "audio")
                    }
                    onStartVideo={(selectedLog) =>
                      startCallFromLog(selectedLog, "video")
                    }
                  />
                ))}
              </Stack>
            </SimpleBarStyle>
          </Stack>
        </Box>
      </Stack>

      {openDialog && (
        <StartCall open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default Call;
