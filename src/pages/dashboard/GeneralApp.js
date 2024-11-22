import { Stack, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";

import Conversation from "../../components/Conversation";
import Chats from "./Chats";
import Contact from "../../components/Contact";
import { useSelector } from "react-redux";
import SharedMessages from "../../components/SharedMessages";
import StarredMessages from "../../components/StarredMessages";

const GeneralApp = () => {
  const theme = useTheme();
  const { sidebar } = useSelector((store) => store.app);

  return (
    <Stack direction={"row"} sx={{ width: "100%" }}>
      <Chats />
      <Box
        sx={{
          height: "100%",
          width: sidebar.open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8F4FA"
              : theme.palette.background.default,
        }}
      >
        <Conversation />
      </Box>
      {sidebar.open &&
        ((sidebar.type === "CONTACT" && <Contact />) ||
          (sidebar.type === "SHARED" && <SharedMessages />) ||
          (sidebar.type === "STARRED" && <StarredMessages />) ||
          null)}
    </Stack>
  );
};

export default GeneralApp;
