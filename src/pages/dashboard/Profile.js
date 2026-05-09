import { Box, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { CaretLeft } from "phosphor-react";
import React from "react";
import ProfileForm from "../../sections/settings/ProfileForm";
import { useNavigate } from "react-router-dom";
import useResponsive from "../../hooks/useResponsive";
import { SimpleBarStyle } from "../../components/Scrollbar";

const Profile = () => {
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useResponsive("down", "md");

  return (
    <Stack direction="row" sx={{ width: "100%", height: "100%" }}>
      <Box
        sx={{
          height: isMobile ? "100%" : "100vh",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.paper,
          width: isMobile ? "100vw" : 320,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Stack
          p={isMobile ? 2 : 4}
          spacing={isMobile ? 3 : 5}
          sx={{ height: "100%" }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={isMobile ? 1.5 : 3}
          >
            <IconButton onClick={() => navigate(-1)}>
              <CaretLeft size={24} color={theme.palette.text.primary} />
            </IconButton>
            <Typography variant={isMobile ? "h6" : "h5"}>Profile</Typography>
          </Stack>

          <SimpleBarStyle
            timeout={500}
            clickOnTrack={false}
            sx={{ flexGrow: 1, minHeight: 0 }}
          >
            <ProfileForm />
          </SimpleBarStyle>
        </Stack>
      </Box>
    </Stack>
  );
};

export default Profile;
