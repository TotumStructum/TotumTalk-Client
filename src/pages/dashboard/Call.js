import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";

import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { useTheme } from "@mui/material/styles";

import { useState } from "react";
import { MagnifyingGlass, Plus } from "phosphor-react";
import { SimpleBarStyle } from "../../components/Scrollbar";
import StartCall from "../../sections/main/StartCall";

const Call = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Stack direction={"row"} sx={{ width: "100%" }}>
        {/* {left} */}
        <Box
          sx={{
            height: "100vh",
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.paper,
            width: 320,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Stack p={3} spacing={2} sx={{ height: "100%" }}>
            <Stack>
              <Typography variant="h5">Call Logs</Typography>
            </Stack>

            <Stack sx={{ width: "100%" }}>
              <Search>
                <SearchIconWrapper>
                  <MagnifyingGlass color="#709ce6" />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search..."
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
            </Stack>

            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant="subtitle2" component={Link}>
                Start a conversation
              </Typography>
              <IconButton
                onClick={() => {
                  setOpenDialog(true);
                }}
              >
                <Plus style={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Stack>
            <Divider />
            <SimpleBarStyle
              timeout={500}
              clickOnTrack={false}
              sx={{ flexGrow: 1, minHeight: 0 }}
            >
              <Stack spacing={2.4}>
                <Typography variant="body2" color="text.secondary">
                  Call logs are not connected yet.
                </Typography>
              </Stack>
            </SimpleBarStyle>
          </Stack>
        </Box>
        {/* {right} */}
      </Stack>

      {openDialog && (
        <StartCall open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default Call;
