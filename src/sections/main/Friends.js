import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ClearUsers,
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
import { MagnifyingGlass, X } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";

const MIN_USER_SEARCH_LENGTH = 2;
const USER_SEARCH_DEBOUNCE_MS = 350;

const UsersList = () => {
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { users } = useSelector((state) => state.app);
  const trimmedSearchQuery = searchQuery.trim();

  useEffect(() => {
    if (trimmedSearchQuery.length < MIN_USER_SEARCH_LENGTH) {
      setHasSearched(false);
      dispatch(ClearUsers());
      return;
    }

    const timeoutId = setTimeout(() => {
      setHasSearched(true);
      dispatch(
        FetchUsers({
          search: trimmedSearchQuery,
          limit: 20,
        }),
      );
    }, USER_SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [dispatch, trimmedSearchQuery]);

  useEffect(() => {
    return () => {
      dispatch(ClearUsers());
    };
  }, [dispatch]);

  return (
    <Stack spacing={2}>
      <Search>
        <SearchIconWrapper>
          <MagnifyingGlass color="#709ce6" />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search users..."
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          inputProps={{ "aria-label": "Search users" }}
        />
      </Search>

      <Typography variant="caption" color="text.secondary">
        {trimmedSearchQuery.length < MIN_USER_SEARCH_LENGTH
          ? "Type at least 2 characters to search users."
          : "Search results"}
      </Typography>

      {users.map((el) => (
        <UserComponent key={el._id} {...el} />
      ))}

      {hasSearched && users.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No users found.
        </Typography>
      ) : null}
    </Stack>
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
