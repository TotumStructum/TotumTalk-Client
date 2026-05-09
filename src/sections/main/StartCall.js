import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { MagnifyingGlass, X } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StartCall = ({ open, handleClose }) => {
  const isMobile = useResponsive("down", "md");

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: isMobile ? "calc(100vw - 32px)" : undefined,
          m: isMobile ? 2 : 4,
          borderRadius: isMobile ? 3 : 2,
          overflow: "hidden",
        },
      }}
    >
      {/*  */}
      <DialogTitle sx={{ px: isMobile ? 2 : 3, py: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          Start Call
          {isMobile && (
            <IconButton
              onClick={handleClose}
              aria-label="Close start call dialog"
            >
              <X size={22} />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
      {/*  */}
      <DialogContent sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
        <Stack spacing={2}>
          <Stack sx={{ width: "100%" }}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709ce6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search..."
                inputProps={{ "aria-label": "Search contacts for call" }}
              />
            </Search>
          </Stack>
          {/* Call List */}
          <Typography variant="body2" color="text.secondary">
            Contact list for starting calls is not connected yet.
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default StartCall;
