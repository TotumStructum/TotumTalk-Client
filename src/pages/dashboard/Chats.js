import React, { useMemo, useState } from "react";
import {
  ArchiveBox,
  CircleDashed,
  MagnifyingGlass,
  Users,
} from "phosphor-react";
import { SimpleBarStyle } from "../../components/Scrollbar";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import Friends from "../../sections/main/Friends";
import { useSelector } from "react-redux";
import useResponsive from "../../hooks/useResponsive";

const Chats = () => {
  const [OpenDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const theme = useTheme();

  const conversations = useSelector(
    (state) => state.conversation?.direct_chat?.conversations ?? [],
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const name = conversation.name?.toLowerCase() || "";
      const message = conversation.msg?.toLowerCase() || "";

      return name.includes(query) || message.includes(query);
    });
  }, [conversations, searchQuery]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const isMobile = useResponsive("down", "md");

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: isMobile ? "100vw" : 320,
          height: isMobile ? "100%" : "100vh",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#f8faff"
              : theme.palette.background.paper,
          boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
        }}
      >
        <Stack p={isMobile ? 2 : 3} spacing={2} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Typography variant="h5">Chats</Typography>

            <Stack direction={"row"} alignItems={"center"} spacing={1}>
              <IconButton
                onClick={() => {
                  handleOpenDialog();
                }}
              >
                <Users />
              </IconButton>
              <IconButton>
                <CircleDashed />
              </IconButton>
            </Stack>
          </Stack>

          <Stack sx={{ width: "100%" }}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709ce6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                inputProps={{ "aria-label": "Search chats" }}
              />
            </Search>
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <ArchiveBox size={24} />
              <Button>Archive</Button>
            </Stack>
            <Divider />
          </Stack>
          <SimpleBarStyle
            timeout={500}
            clickOnTrack={false}
            sx={{ flexGrow: 1, minHeight: 0 }}
          >
            <Stack spacing={2.4}>
              <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                All Chats
              </Typography>
              {filteredConversations.filter((el) => !el.pinned).length > 0 ? (
                filteredConversations
                  .filter((el) => !el.pinned)
                  .map((el) => <ChatElement key={el.id} {...el} />)
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {searchQuery.trim()
                    ? "No chats found."
                    : "No conversations yet."}
                </Typography>
              )}
            </Stack>
          </SimpleBarStyle>
        </Stack>
      </Box>

      {OpenDialog && (
        <Friends open={OpenDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default Chats;
