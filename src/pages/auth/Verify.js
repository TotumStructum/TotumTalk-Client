import { Stack, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import VerifyForm from "../../sections/auth/VerifyForm";

const Verify = () => {
  const { email } = useSelector((state) => state.auth);

  return (
    <>
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Typography variant="h4">Please verify OTP</Typography>
        <Stack direction={"row"} spacing={0.5}>
          <Typography variant="body2">
            OTP was sent to {email || "your email address"}
          </Typography>
        </Stack>
      </Stack>
      <VerifyForm />
    </>
  );
};

export default Verify;
