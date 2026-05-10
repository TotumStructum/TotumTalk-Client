import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Stack,
  useTheme,
  Menu,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import React from "react";
import { Gear } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";

import AntSwitch from "../../components/AntSwitch";
import useSettings from "../../hooks/useSettings";
import Logo from "../../assets/Images/logo.ico";
import { Nav_Buttons, Profile_Menu } from "../../data";
import { useLocation, useNavigate } from "react-router-dom";
import { LogoutUser } from "../../redux/slices/auth";
import { useDispatch, useSelector } from "react-redux";
import { FetchCurrentUser } from "../../redux/slices/app";

const getPath = (index) => {
  switch (index) {
    case 0:
      return "/app";
    case 1:
      return "/group";
    case 2:
      return "/call";
    case 3:
      return "/settings";
    default:
      return null;
  }
};

const getMenuPath = (index) => {
  switch (index) {
    case 0:
      return "/profile";
    case 1:
      return "/settings";
    case 2:
      return "/auth/login";
    default:
      return null;
  }
};

const getSelectedIndex = (pathname) => {
  switch (pathname) {
    case "/app":
      return 0;
    case "/group":
      return 1;
    case "/call":
      return 2;
    case "/settings":
      return 3;
    default:
      return null;
  }
};

const MOBILE_NAV_ICON_SIZE = 24;
const MOBILE_NAV_ITEM_SIZE = 44;

const renderMobileIcon = (icon, selected, theme) => {
  return (
    <Box
      sx={{
        width: MOBILE_NAV_ITEM_SIZE,
        height: MOBILE_NAV_ITEM_SIZE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: selected
          ? theme.palette.primary.main
          : theme.palette.text.secondary,
      }}
    >
      {React.cloneElement(icon, {
        size: MOBILE_NAV_ICON_SIZE,
        weight: selected ? "fill" : "regular",
      })}
    </Box>
  );
};

const SideBar = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { onToggleMode, themeMode } = useSettings();
  const isMobile = useResponsive("down", "md");

  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.app.currentUser);

  const currentUserAvatar = currentUser?.avatar || "";
  const currentUserName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    "User menu";

  React.useEffect(() => {
    if (token && !currentUser) {
      dispatch(FetchCurrentUser());
    }
  }, [dispatch, token, currentUser]);

  const selected = getSelectedIndex(pathname);

  const mainProfileMenuItems = Profile_Menu.slice(0, 2);
  const logoutProfileMenuItem = Profile_Menu[2];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (index) => {
    const path = getPath(index);

    if (!path) return;

    navigate(path);
  };

  const handleProfileMenuAction = (idx) => {
    handleCloseMenu();

    if (idx === 2) {
      dispatch(LogoutUser());
      return;
    }

    const path = getMenuPath(idx);

    if (path) {
      navigate(path);
    }
  };

  const handleThemeMenuToggle = (event) => {
    event.stopPropagation();
    onToggleMode();
  };

  if (isMobile) {
    const allNavItems = [...Nav_Buttons, { index: 3, icon: <Gear /> }];

    return (
      <Paper
        elevation={3}
        sx={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.appBar,
          borderRadius: 0,
        }}
      >
        <BottomNavigation
          showLabels={false}
          value={selected}
          onChange={(_, newValue) => handleNavigate(newValue)}
          sx={{
            backgroundColor: theme.palette.background.paper,
            height: 64,
            alignItems: "center",
          }}
        >
          {allNavItems.map((el) => (
            <BottomNavigationAction
              key={el.index}
              icon={renderMobileIcon(el.icon, selected === el.index, theme)}
              sx={{
                minWidth: 0,
                p: 0,
                "& .MuiBottomNavigationAction-label": {
                  display: "none",
                },
              }}
            />
          ))}

          <BottomNavigationAction
            key="profile"
            icon={
              <Box
                sx={{
                  width: MOBILE_NAV_ITEM_SIZE,
                  height: MOBILE_NAV_ITEM_SIZE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Avatar
                  src={currentUserAvatar}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenMenu(event);
                  }}
                  alt={currentUserName}
                  sx={{
                    width: 28,
                    height: 28,
                    cursor: "pointer",
                  }}
                />
              </Box>
            }
            showLabel={false}
            sx={{
              minWidth: 0,
              p: 0,
            }}
          />
        </BottomNavigation>

        <Menu
          id="profile-menu-mobile"
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Stack spacing={0.5} px={1} py={0.5}>
            {mainProfileMenuItems.map((el, idx) => (
              <MenuItem
                key={`${el.title}-${idx}`}
                onClick={() => handleProfileMenuAction(idx)}
                sx={{ borderRadius: 1 }}
              >
                <Stack
                  sx={{ width: 160 }}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <span>{el.title}</span>
                  {el.icon}
                </Stack>
              </MenuItem>
            ))}

            <MenuItem onClick={onToggleMode} sx={{ borderRadius: 1 }}>
              <Stack
                sx={{ width: 160 }}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <span>Dark mode</span>
                <AntSwitch
                  checked={themeMode === "dark"}
                  onChange={handleThemeMenuToggle}
                  onClick={(event) => event.stopPropagation()}
                  size="small"
                />
              </Stack>
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={() => handleProfileMenuAction(2)}
              sx={{ borderRadius: 1 }}
            >
              <Stack
                sx={{ width: 160 }}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <span>{logoutProfileMenuItem.title}</span>
                {logoutProfileMenuItem.icon}
              </Stack>
            </MenuItem>
          </Stack>
        </Menu>
      </Paper>
    );
  }

  return (
    <Box
      p={2}
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        height: "100vh",
        width: 100,
      }}
    >
      <Stack
        direction={"column"}
        alignItems={"center"}
        justifyContent="space-between"
        sx={{ height: "100%" }}
        spacing={3}
      >
        <Stack alignItems="center" spacing={4}>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              height: 64,
              width: 64,
              borderRadius: 1.5,
            }}
          >
            <img src={Logo} alt="Logo" />
          </Box>

          <Stack
            sx={{ width: "max-content" }}
            direction="column"
            alignItems="center"
            spacing={3}
          >
            {Nav_Buttons.map((el) =>
              el.index === selected ? (
                <Box
                  key={el.index}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1.5,
                  }}
                >
                  <IconButton sx={{ width: "max-content", color: "#fff" }}>
                    {el.icon}
                  </IconButton>
                </Box>
              ) : (
                <IconButton
                  key={el.index}
                  onClick={() => {
                    handleNavigate(el.index);
                  }}
                  sx={{
                    width: "max-content",
                    color:
                      theme.palette.mode === "light"
                        ? "#000"
                        : theme.palette.text.primary,
                  }}
                >
                  {el.icon}
                </IconButton>
              ),
            )}

            <Divider sx={{ width: "48px" }} />

            {selected === 3 ? (
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1.5,
                }}
              >
                <IconButton sx={{ width: "max-content", color: "#fff" }}>
                  <Gear />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                onClick={() => {
                  handleNavigate(3);
                }}
                sx={{
                  width: "max-content",
                  color:
                    theme.palette.mode === "light"
                      ? "#000"
                      : theme.palette.text.primary,
                }}
              >
                <Gear />
              </IconButton>
            )}
          </Stack>
        </Stack>

        <Stack alignItems={"center"} spacing={4}>
          <Avatar
            id="basic-button"
            src={currentUserAvatar}
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleOpenMenu}
            alt={currentUserName}
          />

          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <Stack spacing={0.5} px={1} py={0.5}>
              {mainProfileMenuItems.map((el, idx) => (
                <MenuItem
                  key={`${el.title}-${idx}`}
                  onClick={() => {
                    handleProfileMenuAction(idx);
                  }}
                  sx={{ borderRadius: 1 }}
                >
                  <Stack
                    sx={{ width: 160 }}
                    direction="row"
                    alignItems={"center"}
                    justifyContent="space-between"
                  >
                    <span>{el.title}</span>
                    {el.icon}
                  </Stack>
                </MenuItem>
              ))}

              <MenuItem onClick={onToggleMode} sx={{ borderRadius: 1 }}>
                <Stack
                  sx={{ width: 160 }}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <span>Dark mode</span>
                  <AntSwitch
                    checked={themeMode === "dark"}
                    onChange={handleThemeMenuToggle}
                    onClick={(event) => event.stopPropagation()}
                    size="small"
                  />
                </Stack>
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={() => {
                  handleProfileMenuAction(2);
                }}
                sx={{ borderRadius: 1 }}
              >
                <Stack
                  sx={{ width: 160 }}
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                >
                  <span>{logoutProfileMenuItem.title}</span>
                  {logoutProfileMenuItem.icon}
                </Stack>
              </MenuItem>
            </Stack>
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SideBar;
