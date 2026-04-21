import { useTheme, styled } from "@mui/material/styles";
import { Avatar, Badge, Box, Typography, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { SelectConversation } from "../redux/slices/app";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      border: "1px solid currentColor",
      content: '""',
    },
  },
}));

const ChatElement = ({ id, name, img, msg, time, unread, online }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const room_id = useSelector((state) => state.app.room_id);

  const isSelected = room_id === id;

  return (
    <Box
      onClick={() => {
        dispatch(SelectConversation({ room_id: id }));
      }}
      sx={{
        width: "100%",
        borderRadius: 1,
        cursor: "pointer",
        backgroundColor: isSelected
          ? theme.palette.primary.lighter || "rgba(112, 156, 230, 0.16)"
          : theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.background.default,
        border: isSelected
          ? `1px solid ${theme.palette.primary.main}`
          : "1px solid transparent",
      }}
      p={2}
    >
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} sx={{ minWidth: 0 }}>
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar src={img} alt={name} />
            </StyledBadge>
          ) : (
            <Avatar src={img} alt={name} />
          )}

          <Stack spacing={0.3} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
            <Typography variant="caption" noWrap color="text.secondary">
              {msg}
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={2} alignItems="center">
          <Typography sx={{ fontWeight: 600 }} variant="caption">
            {time}
          </Typography>
          {unread > 0 ? <Badge color="primary" badgeContent={unread} /> : null}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatElement;
