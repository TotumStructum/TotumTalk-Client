import { Box, IconButton } from "@mui/material";
import { ArrowLeft } from "phosphor-react";
import React from "react";
import { useDispatch } from "react-redux";
import { UpdateSidebarType } from "../redux/slices/app";

const SharedMessages = () => {
  const dispatch = useDispatch();
  return (
    <Box sx={{ width: 320, height: "100vh" }}>
      <IconButton
        onClick={() => {
          dispatch(UpdateSidebarType("CONTACT"));
        }}
      >
        <ArrowLeft />
      </IconButton>
    </Box>
  );
};

export default SharedMessages;
