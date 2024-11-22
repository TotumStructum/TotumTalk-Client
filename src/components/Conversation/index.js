import { Box, Stack } from "@mui/material";
import React from "react";

import Header from "./Header";
import Body from "./Body";
import Footer from "./Footer";

const Conversation = () => {
  return (
    <Stack height={"100%"} maxHeight={"100vh"}>
      {/* chat header */}
      <Header />
      {/* chat body */}
      <Box
        width={"100%"}
        sx={{ flexGrow: 1, height: "100vh", overflowY: "scroll" }}
      >
        <Body menu={true} />
      </Box>

      {/* chat footer */}
      <Footer />
    </Stack>
  );
};

export default Conversation;
