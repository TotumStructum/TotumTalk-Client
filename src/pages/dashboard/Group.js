import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { MagnifyingGlass, Plus } from "phosphor-react";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { SimpleBarStyle } from "../../components/Scrollbar";
import CreateGroup from "../../sections/main/CreateGroup";
import { useDispatch, useSelector } from "react-redux";
import { FetchGroupConversations } from "../../redux/slices/app";
import Conversation from "../../components/Conversation";
import NoChatSVG from "../../assets/Illustration/NoChat";
import { SelectGroupConversation } from "../../redux/slices/app";

const getParticipantName = (participant) => {
  return (
    `${participant?.firstName || ""} ${participant?.lastName || ""}`.trim() ||
    participant?.email ||
    "User"
  );
};

const GroupElement = ({ group, isSelected, onSelect }) => {
  const theme = useTheme();
  const participants = Array.isArray(group.participants)
    ? group.participants
    : [];

  return (
    <Box
      onClick={onSelect}
      sx={{
        width: "100%",
        borderRadius: 1,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.background.paper,
        border: `1px solid ${
          theme.palette.mode === "light"
            ? "transparent"
            : alpha(theme.palette.common.white, 0.08)
        }`,
      }}
      p={2}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <AvatarGroup
          max={3}
          sx={{
            "& .MuiAvatar-root": {
              width: 36,
              height: 36,
              fontSize: 14,
            },
          }}
        >
          {participants.map((participant) => (
            <Avatar
              key={participant._id}
              src={participant.avatar}
              alt={getParticipantName(participant)}
            />
          ))}
        </AvatarGroup>

        <Stack spacing={0.3} sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {group.title}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <Typography
              variant="caption"
              noWrap
              color="text.secondary"
              sx={{ flex: 1 }}
            >
              {group.msg || `${participants.length} members`}
            </Typography>

            {group.time ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ flexShrink: 0 }}
              >
                {group.time}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

const Group = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { groups, room_id, chat_type } = useSelector((state) => state.app);

  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const groupList = Array.isArray(groups) ? groups : [];

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return groupList;

    return groupList.filter((group) =>
      group.title?.toLowerCase().includes(query),
    );
  }, [groupList, searchQuery]);

  useEffect(() => {
    dispatch(FetchGroupConversations());
  }, [dispatch]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Stack direction={"row"} sx={{ width: "100%" }}>
        <Box
          sx={{
            height: "100vh",
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.paper,
            width: 320,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Stack p={3} spacing={2} sx={{ height: "100%" }}>
            <Stack>
              <Typography variant="h5">Groups</Typography>
            </Stack>

            <Stack sx={{ width: "100%" }}>
              <Search>
                <SearchIconWrapper>
                  <MagnifyingGlass color="#709ce6" />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search..."
                  inputProps={{ "aria-label": "search" }}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </Search>
            </Stack>

            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant="subtitle2" component={Link}>
                Create New Group
              </Typography>
              <IconButton
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
              <Stack spacing={2.4}>
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <GroupElement
                      key={group._id}
                      group={group}
                      isSelected={
                        chat_type === "group" && room_id === group._id
                      }
                      onSelect={() => {
                        dispatch(
                          SelectGroupConversation({ room_id: group._id }),
                        );
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery.trim()
                      ? "No groups found."
                      : "No group conversations yet."}
                  </Typography>
                )}
              </Stack>
            </SimpleBarStyle>
          </Stack>
        </Box>
        <Box
          sx={{
            height: "100%",
            flexGrow: 1,
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.default,
          }}
        >
          {room_id !== null && chat_type === "group" ? (
            <Conversation />
          ) : (
            <Stack
              spacing={2}
              sx={{ height: "100%", width: "100%" }}
              alignItems="center"
              justifyContent="center"
            >
              <NoChatSVG />
              <Typography variant="subtitle2">
                Select a group conversation
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>

      {openDialog && (
        <CreateGroup open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default Group;
