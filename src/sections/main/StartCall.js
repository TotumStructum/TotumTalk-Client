import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { MagnifyingGlass, X } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket";
import uuidv4 from "../../utils/uuidv4";
import { StartOutgoingCall } from "../../redux/slices/call";
import { CallElement } from "../../components/CallElement";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StartCall = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const isMobile = useResponsive("down", "md");

  const [query, setQuery] = React.useState("");

  const callStatus = useSelector((state) => state.call.status);
  const conversations = useSelector(
    (state) => state.conversation.direct_chat.conversations,
  );

  const filteredConversations = conversations.filter((conversation) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return true;

    return (
      conversation.name?.toLowerCase().includes(normalizedQuery) ||
      conversation.email?.toLowerCase().includes(normalizedQuery)
    );
  });

  const startCall = (conversation, callType) => {
    if (
      callStatus !== "idle" ||
      conversation.isAI ||
      conversation.isSystem ||
      conversation.blockedByMe
    ) {
      return;
    }

    const callId = uuidv4();

    const peer = {
      _id: conversation.user_id,
      name: conversation.name,
      avatar: conversation.img || "",
      email: conversation.email || "",
    };

    const call = {
      call_id: callId,
      conversation_id: conversation.id,
      call_type: callType,
      peer,
    };

    dispatch(StartOutgoingCall({ call }));

    socket?.emit("call_invite", {
      to: conversation.user_id,
      conversation_id: conversation.id,
      call_id: callId,
      call_type: callType,
    });

    handleClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: isMobile ? "calc(100vw - 32px)" : undefined,
          m: isMobile ? 2 : 4,
          borderRadius: isMobile ? 3 : 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ px: isMobile ? 2 : 3, py: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          Start Call
          {isMobile && (
            <IconButton
              onClick={handleClose}
              aria-label="Close start call dialog"
            >
              <X size={22} />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
        <Stack spacing={2}>
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#709ce6" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              inputProps={{ "aria-label": "Search contacts for call" }}
            />
          </Search>

          <Stack spacing={1.5}>
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => {
                const disabled =
                  callStatus !== "idle" ||
                  conversation.isAI ||
                  conversation.isSystem ||
                  conversation.blockedByMe;

                return (
                  <CallElement
                    key={conversation.id}
                    online={conversation.online}
                    name={conversation.name}
                    img={conversation.img}
                    disabled={disabled}
                    onStartAudio={() => startCall(conversation, "audio")}
                    onStartVideo={() => startCall(conversation, "video")}
                  />
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                No contacts found.
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default StartCall;
