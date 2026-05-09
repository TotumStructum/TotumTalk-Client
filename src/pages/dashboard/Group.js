import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
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
import {
  FetchGroupConversations,
  SelectGroupConversation,
} from "../../redux/slices/app";
import Conversation from "../../components/Conversation";
import NoChatSVG from "../../assets/Illustration/NoChat";
import SharedMessages from "../../components/SharedMessages";
import StarredMessages from "../../components/StarredMessages";
import GroupInfo from "../../components/GroupInfo";
import MessageSearch from "../../components/MessageSearch";
import useResponsive from "../../hooks/useResponsive";

const getParticipantName = (participant) => {
  return (
    `${participant?.firstName || ""} ${participant?.lastName || ""}`.trim() ||
    participant?.email ||
    "User"
  );
};

const GroupElement = ({ group, isSelected, onSelect }) => {
  const theme = useTheme();

  const isMobile = useResponsive("down", "md");

  const participants = Array.isArray(group.participants)
    ? group.participants
    : [];

  return (
    <Box
      onClick={onSelect}
      sx={{
        width: "100%",
        borderRadius: 1,
        cursor: "pointer",
        backgroundColor: isSelected
          ? alpha(
              theme.palette.primary.main,
              theme.palette.mode === "light" ? 0.12 : 0.2,
            )
          : theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.background.paper,
        border: isSelected
          ? `1px solid ${alpha(theme.palette.primary.main, 0.32)}`
          : `1px solid ${
              theme.palette.mode === "light"
                ? "transparent"
                : alpha(theme.palette.common.white, 0.08)
            }`,
      }}
      p={isMobile ? 1.5 : 2}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          spacing={isMobile ? 1.5 : 2}
          alignItems="center"
          sx={{ minWidth: 0, flex: 1 }}
        >
          <AvatarGroup
            max={3}
            sx={{
              "& .MuiAvatar-root": {
                width: isMobile ? 32 : 36,
                height: isMobile ? 32 : 36,
                fontSize: isMobile ? 12 : 14,
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
            <Typography variant="caption" noWrap color="text.secondary">
              {group.msg || `${participants.length} members`}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          spacing={isMobile ? 0.75 : 2}
          alignItems="flex-end"
          sx={{ flexShrink: 0 }}
        >
          {group.time ? (
            <Typography sx={{ fontWeight: 600 }} variant="caption">
              {group.time}
            </Typography>
          ) : null}

          {group.unread > 0 ? (
            <Badge color="primary" badgeContent={group.unread} />
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
};

const GroupListPanel = ({ sx = {}, padding = 3 }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { groups, room_id, chat_type } = useSelector((state) => state.app);

  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const groupList = Array.isArray(groups) ? groups : [];

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return groupList;

    return groupList.filter((group) => {
      const title = group.title?.toLowerCase() || "";
      const message = group.msg?.toLowerCase() || "";
      const participants = Array.isArray(group.participants)
        ? group.participants
            .map((participant) => getParticipantName(participant).toLowerCase())
            .join(" ")
        : "";

      return (
        title.includes(query) ||
        message.includes(query) ||
        participants.includes(query)
      );
    });
  }, [groupList, searchQuery]);

  useEffect(() => {
    dispatch(FetchGroupConversations());
  }, [dispatch]);

  return (
    <>
      <Box
        sx={{
          height: "100%",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.paper,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.2)",
          ...sx,
        }}
      >
        <Stack p={padding} spacing={2} sx={{ height: "100%" }}>
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
                inputProps={{ "aria-label": "Search groups" }}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </Search>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
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
                    isSelected={chat_type === "group" && room_id === group._id}
                    onSelect={() => {
                      dispatch(SelectGroupConversation({ room_id: group._id }));
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

      {openDialog && (
        <CreateGroup
          open={openDialog}
          handleClose={() => {
            setOpenDialog(false);
          }}
        />
      )}
    </>
  );
};

const Group = () => {
  const theme = useTheme();
  const isMobile = useResponsive("down", "md");

  const { room_id, chat_type, sidebar } = useSelector((state) => state.app);

  const hasConversation = room_id !== null && chat_type === "group";

  if (isMobile) {
    if (sidebar.open) {
      return (
        <Box
          sx={{
            width: "100vw",
            height: "100%",
            overflow: "hidden",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.default,
          }}
        >
          {sidebar.type === "GROUP_INFO" && <GroupInfo />}
          {sidebar.type === "SHARED" && <SharedMessages />}
          {sidebar.type === "STARRED" && <StarredMessages />}
          {sidebar.type === "MESSAGE_SEARCH" && <MessageSearch />}
        </Box>
      );
    }

    if (hasConversation) {
      return (
        <Box
          sx={{
            width: "100vw",
            height: "100%",
            overflow: "hidden",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.default,
          }}
        >
          <Conversation />
        </Box>
      );
    }

    return (
      <Box sx={{ width: "100vw", height: "100%", overflow: "hidden" }}>
        <GroupListPanel sx={{ width: "100%" }} padding={2} />
      </Box>
    );
  }

  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      <GroupListPanel sx={{ width: 320 }} />

      <Box
        sx={{
          height: "100%",
          width: sidebar.open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.default,
        }}
      >
        {hasConversation ? (
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

      {sidebar.open &&
        ((sidebar.type === "GROUP_INFO" && <GroupInfo />) ||
          (sidebar.type === "SHARED" && <SharedMessages />) ||
          (sidebar.type === "STARRED" && <StarredMessages />) ||
          (sidebar.type === "MESSAGE_SEARCH" && <MessageSearch />) ||
          null)}
    </Stack>
  );
};

export default Group;
