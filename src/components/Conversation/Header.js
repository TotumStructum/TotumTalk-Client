import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { CaretDown, MagnifyingGlass, Phone, VideoCamera } from "phosphor-react";
import React from "react";
import StyledBadge from "../StyledBadge";
import { ToggleSidebar, UpdateSidebarType } from "../../redux/slices/app";
import { useDispatch, useSelector } from "react-redux";

const Header = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { current_conversation } = useSelector(
    (state) => state.conversation.direct_chat,
  );
  const { sidebar } = useSelector((state) => state.app);

  if (!current_conversation) return null;

  const isContactSidebarOpen = sidebar.open && sidebar.type === "CONTACT";

  const handleContactSidebarToggle = () => {
    if (isContactSidebarOpen) {
      dispatch(ToggleSidebar());
      return;
    }

    dispatch(UpdateSidebarType("CONTACT"));

    if (!sidebar.open) {
      dispatch(ToggleSidebar());
    }
  };

  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#f8faff"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack
        alignItems={"center"}
        direction="row"
        justifyContent={"space-between"}
        sx={{ width: "100%", height: "100%" }}
      >
        <Stack
          onClick={handleContactSidebarToggle}
          direction={"row"}
          spacing={2}
          sx={{ cursor: "pointer" }}
          alignItems="center"
        >
          <Box>
            {current_conversation.online ? (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                variant="dot"
              >
                <Avatar
                  alt={current_conversation.name}
                  src={current_conversation.img}
                />
              </StyledBadge>
            ) : (
              <Avatar
                alt={current_conversation.name}
                src={current_conversation.img}
              />
            )}
          </Box>

          <Stack spacing={0.2}>
            <Typography variant="subtitle2">
              {current_conversation.name}
            </Typography>
            <Typography variant="caption">
              {current_conversation.online ? "Online" : "Offline"}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems={"center"} spacing={3}>
          <IconButton>
            <VideoCamera />
          </IconButton>
          <IconButton>
            <Phone />
          </IconButton>
          <IconButton>
            <MagnifyingGlass />
          </IconButton>
          <Divider orientation="vertical" flexItem />
          <IconButton onClick={handleContactSidebarToggle}>
            <CaretDown
              style={{
                transform: isContactSidebarOpen
                  ? "rotate(-90deg)"
                  : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Header;
