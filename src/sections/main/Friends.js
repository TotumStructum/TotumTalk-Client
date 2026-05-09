import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchFriendRequests,
  FetchFriends,
  FetchUsers,
  FetchSentFriendRequests,
} from "../../redux/slices/app";
import {
  FriendComponent,
  FriendRequestComponent,
  UserComponent,
  SentFriendRequestComponent,
} from "../../components/Friends";
import { socket } from "../../socket";
import { X } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";

const UsersList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(FetchUsers());
  }, [dispatch]);

  const { users } = useSelector((state) => state.app);

  return (
    <>
      {users.map((el) => (
        <UserComponent key={el._id} {...el} />
      ))}
    </>
  );
};

const FriendsList = ({ handleClose }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(FetchFriends());
  }, [dispatch]);

  const { friends } = useSelector((state) => state.app);

  const list = Array.isArray(friends) ? friends : (friends?.friends ?? []);

  return (
    <>
      {list.map((el) => (
        <FriendComponent key={el._id} {...el} />
      ))}
    </>
  );
};

const FriendRequestList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(FetchFriendRequests());
  }, [dispatch]);

  const { friendRequests } = useSelector((state) => state.app);

  return (
    <>
      {friendRequests.map((el) => (
        <FriendRequestComponent key={el._id} {...el.sender} id={el._id} />
      ))}
    </>
  );
};

const SentFriendRequestList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(FetchSentFriendRequests());
  }, [dispatch]);

  const { sentFriendRequests } = useSelector((state) => state.app);

  return (
    <>
      {sentFriendRequests.map((el) => (
        <SentFriendRequestComponent
          key={el._id}
          {...el.recipient}
          id={el._id}
        />
      ))}
    </>
  );
};

const Friends = ({ open, handleClose }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!open || !socket) return;

    const handleStartChat = () => {
      handleClose();
    };

    socket.on("start_chat", handleStartChat);

    return () => {
      socket.off("start_chat", handleStartChat);
    };
  }, [open, handleClose]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const isMobile = useResponsive("down", "md");

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      keepMounted
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: isMobile ? "calc(100vw - 32px)" : undefined,
          m: isMobile ? 2 : 4,
          borderRadius: isMobile ? 3 : 2,
          maxHeight: isMobile ? "76vh" : "calc(100% - 64px)",
          overflow: "hidden",
        },
      }}
    >
      {isMobile && (
        <DialogTitle
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: (theme) => theme.palette.background.paper,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            Friends
            <IconButton onClick={handleClose} aria-label="Close friends dialog">
              <X size={22} />
            </IconButton>
          </Stack>
        </DialogTitle>
      )}

      <Stack
        px={isMobile ? 1 : 2}
        pt={isMobile ? 1 : 2}
        pb={isMobile ? 1 : 0}
        sx={{
          width: "100%",
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          centered={!isMobile}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
        >
          <Tab label="Explore" />
          <Tab label="Friends" />
          <Tab label="Requests" />
          <Tab label="Sent" />
        </Tabs>
      </Stack>

      <DialogContent
        sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 3,
          maxHeight: isMobile ? "48vh" : undefined,
          overflowY: "auto",
        }}
      >
        <Stack spacing={2.5}>
          {(() => {
            switch (value) {
              case 0:
                return <UsersList />;
              case 1:
                return <FriendsList handleClose={handleClose} />;
              case 2:
                return <FriendRequestList />;
              case 3:
                return <SentFriendRequestList />;
              default:
                return null;
            }
          })()}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default Friends;
