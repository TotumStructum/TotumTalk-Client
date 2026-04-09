import { Dialog, DialogContent, Stack, Tab, Tabs } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchFriendRequests,
  FetchFriends,
  FetchUsers,
} from "../../redux/slices/app";
import {
  FriendComponent,
  FriendRequestComponent,
  UserComponent,
} from "../../components/Friends";
import { socket } from "../../socket";

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

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      keepMounted
      onClose={handleClose}
      sx={{ p: 4 }}
    >
      <Stack p={2} sx={{ width: "100%" }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label={"Explore"} />
          <Tab label={"Friends"} />
          <Tab label={"Requests"} />
        </Tabs>
      </Stack>
      <DialogContent>
        <Stack sx={{ height: "100%" }}>
          <Stack spacing={2.5}>
            {(() => {
              switch (value) {
                case 0:
                  return <UsersList />;
                case 1:
                  return <FriendsList handleClose={handleClose} />;
                case 2:
                  return <FriendRequestList />;
                default:
                  return null;
              }
            })()}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default Friends;
