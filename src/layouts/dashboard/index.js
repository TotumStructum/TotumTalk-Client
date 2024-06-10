import { Outlet } from "react-router-dom";
import { Stack } from "@mui/material";
import { React } from "react";

import SideBar from "./SideBar";

const DashboardLayout = () => {
  return (
    <>
      <Stack direction="row">
        <SideBar />
        <Outlet />
      </Stack>
    </>
  );
};

export default DashboardLayout;
