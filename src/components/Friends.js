import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import StyledBadge from "./StyledBadge";
import { socket } from "../socket";
import { Chat, UserMinus } from "phosphor-react";
import { useState } from "react";

const StyledChatBox = styled(Box)(() => ({
  "&:hover": {
    cursor: "pointer",
  },
}));

const UserComponent = ({ firstName, lastName, _id, status, avatar }) => {
  const theme = useTheme();
  const name = `${firstName} ${lastName}`;
  const isOnline = status === "Online";

  return (
    <StyledChatBox
      sx={{
        width: "100%",
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
      }}
      p={2}
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Stack direction={"row"} alignItems={"center"} spacing={2}>
          {isOnline ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar alt={name} src={avatar} />
            </StyledBadge>
          ) : (
            <Avatar alt={name} src={avatar} />
          )}
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{name}</Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <Button
            onClick={() => {
              socket.emit("friend_request", { to: _id });
            }}
          >
            Send Request
          </Button>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

const FriendRequestComponent = ({
  firstName,
  lastName,
  status,
  avatar,
  id,
}) => {
  const theme = useTheme();
  const name = `${firstName} ${lastName}`;
  const isOnline = status === "Online";

  return (
    <StyledChatBox
      sx={{
        width: "100%",
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
      }}
      p={2}
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Stack direction={"row"} alignItems={"center"} spacing={2}>
          {isOnline ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar alt={name} src={avatar} />
            </StyledBadge>
          ) : (
            <Avatar alt={name} src={avatar} />
          )}
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{name}</Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <Button
            size="small"
            onClick={() => {
              socket.emit("accept_request", { request_id: id });
            }}
          >
            Accept
          </Button>

          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => {
              socket.emit("reject_request", { request_id: id });
            }}
          >
            Decline
          </Button>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

const FriendComponent = ({ firstName, lastName, _id, status, avatar }) => {
  const theme = useTheme();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const name = `${firstName} ${lastName}`;
  const isOnline = status === "Online";

  const handleRemoveFriend = () => {
    socket.emit("remove_friend", { friend_id: _id });
    setRemoveDialogOpen(false);
  };

  return (
    <>
      <StyledChatBox
        sx={{
          width: "100%",
          borderRadius: 1,
          backgroundColor: theme.palette.background.paper,
        }}
        p={2}
      >
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Stack direction={"row"} alignItems={"center"} spacing={2}>
            {isOnline ? (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
              >
                <Avatar alt={name} src={avatar} />
              </StyledBadge>
            ) : (
              <Avatar alt={name} src={avatar} />
            )}
            <Stack spacing={0.3}>
              <Typography variant="subtitle2">{name}</Typography>
            </Stack>
          </Stack>

          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            <IconButton
              aria-label="Start chat"
              onClick={() => {
                socket.emit("start_conversation", { to: _id });
              }}
            >
              <Chat />
            </IconButton>

            <IconButton
              aria-label="Remove friend"
              color="error"
              onClick={() => {
                setRemoveDialogOpen(true);
              }}
            >
              <UserMinus />
            </IconButton>
          </Stack>
        </Stack>
      </StyledChatBox>

      <Dialog
        open={removeDialogOpen}
        onClose={() => {
          setRemoveDialogOpen(false);
        }}
      >
        <DialogTitle>Remove friend?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to remove ${name} from your friends?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRemoveDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button color="error" onClick={handleRemoveFriend}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export { UserComponent, FriendRequestComponent, FriendComponent };
