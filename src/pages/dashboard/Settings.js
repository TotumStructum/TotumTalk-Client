import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Bell,
  CaretLeft,
  Image,
  Info,
  Key,
  Keyboard,
  Lock,
  Note,
  PencilCircle,
} from "phosphor-react";
import React, { useState } from "react";
import Shortcuts from "../../sections/settings/Shortcuts";
import { useNavigate } from "react-router-dom";
import { SimpleBarStyle } from "../../components/Scrollbar";

const Settings = () => {
  const theme = useTheme();

  const [openShortcuts, setOpenShortcuts] = useState(false);

  const handleOpenShortcuts = () => {
    setOpenShortcuts(true);
  };

  const handleCloseShortcuts = () => {
    setOpenShortcuts(false);
  };

  const navigate = useNavigate();

  const list = [
    {
      key: 0,
      icon: <Bell size={20} />,
      title: "Notifications",
      onClick: () => {},
    },
    {
      key: 1,
      icon: <Lock size={20} />,
      title: "Privacy",
      onClick: () => {},
    },
    {
      key: 2,
      icon: <Key size={20} />,
      title: "Security",
      onClick: () => {},
    },
    {
      key: 3,
      icon: <PencilCircle size={20} />,
      title: "Theme",
      onClick: () => {},
    },
    {
      key: 4,
      icon: <Image size={20} />,
      title: "Chat Wallpaper",
      onClick: () => {},
    },
    {
      key: 5,
      icon: <Note size={20} />,
      title: "Request Account Info",
      onClick: () => {},
    },
    {
      key: 6,
      icon: <Keyboard size={20} />,
      title: "Keyboard Shortcuts",
      onClick: handleOpenShortcuts,
    },
    {
      key: 7,
      icon: <Info size={20} />,
      title: "Help",
      onClick: () => {},
    },
  ];

  return (
    <>
      <Stack direction={"row"} sx={{ width: "100%" }}>
        <Box
          sx={{
            height: "100vh",
            width: 320,
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.paper,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Stack p={2} spacing={5} sx={{ height: "100%" }}>
            <Stack direction={"row"} alignItems={"center"} spacing={3}>
              <IconButton onClick={() => navigate(-1)}>
                <CaretLeft size={24} color={"#4B4B4B"} />
              </IconButton>
              <Typography variant="h6">Settings</Typography>
            </Stack>

            <SimpleBarStyle
              timeout={500}
              clickOnTrack={false}
              sx={{ flexGrow: 1, minHeight: 0 }}
            >
              <Stack spacing={5}>
                <Stack direction={"row"} spacing={3}>
                  <Avatar sx={{ width: 56, height: 56 }} alt="Profile" />
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">Your profile</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Profile details can be edited on the Profile page.
                    </Typography>
                  </Stack>
                </Stack>

                <Stack spacing={4}>
                  {list.map(({ key, icon, title, onClick }) => (
                    <Stack
                      key={key}
                      spacing={2}
                      sx={{ cursor: "pointer" }}
                      onClick={onClick}
                    >
                      <Stack
                        direction={"row"}
                        spacing={2}
                        alignItems={"center"}
                      >
                        {icon}
                        <Typography variant="body2">{title}</Typography>
                      </Stack>
                      {key !== 7 && <Divider />}
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </SimpleBarStyle>
          </Stack>
        </Box>
        {openShortcuts && (
          <Shortcuts open={openShortcuts} handleClose={handleCloseShortcuts} />
        )}
      </Stack>
    </>
  );
};

export default Settings;
