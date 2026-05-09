import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import useResponsive from "../../hooks/useResponsive";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const list = [
  {
    key: 0,
    title: "Mark as unread",
    combination: ["Cmd", "Shift", "U"],
  },
  {
    key: 1,
    title: "Mute",
    combination: ["Cmd", "Shift", "M"],
  },
  {
    key: 2,
    title: "Archive Chat",
    combination: ["Cmd", "Shift", "E"],
  },
  {
    key: 3,
    title: "Delete Chat",
    combination: ["Cmd", "Shift", "D"],
  },
  {
    key: 4,
    title: "Pin Chat",
    combination: ["Cmd", "Shift", "P"],
  },
  {
    key: 5,
    title: "Search",
    combination: ["Cmd", "F"],
  },
  {
    key: 6,
    title: "Search Chat",
    combination: ["Cmd", "Shift", "P"],
  },
  {
    key: 7,
    title: "New Chat",
    combination: ["Cmd", "N"],
  },
  {
    key: 8,
    title: "Next Chat",
    combination: ["Ctrl", "Tab"],
  },
  {
    key: 9,
    title: "Previous Chat",
    combination: ["Ctrl", "Shift", "Tab"],
  },
  {
    key: 10,
    title: "New Group",
    combination: ["Cmd", "Shift", "N"],
  },
  {
    key: 11,
    title: "Profile & About",
    combination: ["Cmd", "P"],
  },
  {
    key: 12,
    title: "Increase speed of voice message",
    combination: ["Shift", "."],
  },
  {
    key: 13,
    title: "Decrease speed of voice message",
    combination: ["Shift", ","],
  },
  {
    key: 14,
    title: "Settings",
    combination: ["Shift", "S"],
  },
  {
    key: 15,
    title: "Emoji Panel",
    combination: ["Cmd", "E"],
  },
  {
    key: 16,
    title: "Sticker Panel",
    combination: ["Cmd", "S"],
  },
];

const Shortcuts = ({ open, handleClose }) => {
  const isMobile = useResponsive("down", "md");

  return (
    <>
      <Dialog
        fullWidth
        maxWidth={isMobile ? "xs" : "md"}
        open={open}
        onClose={handleClose}
        keepMounted
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            width: isMobile ? "calc(100vw - 32px)" : undefined,
            m: isMobile ? 2 : 4,
            borderRadius: isMobile ? 3 : 2,
            maxHeight: isMobile ? "76vh" : "calc(100% - 64px)",
          },
        }}
      >
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogContent sx={{ mt: isMobile ? 1 : 4, px: isMobile ? 2 : 3 }}>
          <Grid container spacing={3}>
            {list.map(({ key, title, combination }) => (
              <Grid key={key} container item xs={12} md={6}>
                <Stack
                  sx={{ width: "100%" }}
                  justifyContent={"space-between"}
                  spacing={3}
                  direction={"row"}
                  alignItems={"center"}
                >
                  <Typography variant="caption" sx={{ fontSize: 14 }}>
                    {title}
                  </Typography>
                  <Stack
                    spacing={isMobile ? 1 : 2}
                    direction="row"
                    flexWrap="wrap"
                  >
                    {combination.map((el, idx) => {
                      return (
                        <Button
                          key={`${key}-${el}-${idx}`}
                          disabled
                          variant="contained"
                          sx={{ color: "#212121" }}
                          size={isMobile ? "small" : "medium"}
                        >
                          {el}
                        </Button>
                      );
                    })}
                  </Stack>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Shortcuts;
