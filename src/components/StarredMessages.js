import { Box, IconButton, Stack, Typography } from "@mui/material";
import { CaretLeft } from "phosphor-react";
import { useDispatch } from "react-redux";
import { UpdateSidebarType } from "../redux/slices/app";
import { useTheme } from "@emotion/react";

const StarredMessages = () => {
  const theme = useTheme();

  const dispatch = useDispatch();
  return (
    <Box sx={{ width: 320, height: "100vh" }}>
      <Stack sx={{ height: "100%" }}>
        <Box
          sx={{
            boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
            width: "100%",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.paper,
          }}
        >
          <Stack
            sx={{ height: "100%", p: 2 }}
            direction="row"
            alignItems={"center"}
            spacing={3}
          >
            <IconButton
              onClick={() => {
                dispatch(UpdateSidebarType("CONTACT"));
              }}
            >
              <CaretLeft />
            </IconButton>
            <Typography variant="subtitle2">Starred Messages</Typography>
          </Stack>
        </Box>
        <Stack
          sx={{
            position: "relative",
            flexGrow: 1,
            minHeight: 0,
            overflowY: "auto",
          }}
          p={3}
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="body2" color="text.secondary">
            Starred messages are not implemented yet
          </Typography>
        </Stack>
        <Box
          sx={{
            height: 88,
            flexShrink: 0,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#f8faff"
                : theme.palette.background.paper,
          }}
        />
      </Stack>
    </Box>
  );
};

export default StarredMessages;
