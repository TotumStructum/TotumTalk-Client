import { alpha, useTheme, styled } from "@mui/material/styles";
import { Avatar, Badge, Box, Chip, Typography, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { SelectConversation } from "../redux/slices/app";
import useResponsive from "../hooks/useResponsive";

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

const ChatElement = ({
  id,
  name,
  img,
  msg,
  time,
  unread,
  online,
  isAI,
  isSystem,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const room_id = useSelector((state) => state.app.room_id);
  const isMobile = useResponsive("down", "md");

  const isSelected = room_id === id;
  const isAIConversation = Boolean(isAI || isSystem);
  const previewMessage =
    isAIConversation && !msg ? "Virtual AI assistant" : msg;

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
          ? alpha(
              theme.palette.primary.main,
              theme.palette.mode === "light" ? 0.12 : 0.2,
            )
          : theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.background.paper,
        border: isSelected
          ? `1px solid ${alpha(theme.palette.primary.main, 0.32)}`
          : `1px solid ${
              theme.palette.mode === "light"
                ? "transparent"
                : alpha(theme.palette.common.white, 0.08)
            }`,
      }}
      p={isMobile ? 1.5 : 2}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={isMobile ? 1.5 : 2}
          sx={{ minWidth: 0, flex: 1 }}
        >
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar
                src={img}
                alt={name}
                sx={isMobile ? { width: 40, height: 40 } : undefined}
              />
            </StyledBadge>
          ) : (
            <Avatar
              src={img}
              alt={name}
              sx={isMobile ? { width: 40, height: 40 } : undefined}
            />
          )}

          <Stack spacing={0.3} sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ minWidth: 0 }}
            >
              <Typography variant="subtitle2" noWrap>
                {name}
              </Typography>
              {isAIConversation ? (
                <Chip
                  label="AI"
                  color="primary"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                />
              ) : null}
            </Stack>
            <Typography variant="caption" noWrap color="text.secondary">
              {previewMessage}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          spacing={isMobile ? 0.75 : 2}
          alignItems="flex-end"
          sx={{ flexShrink: 0 }}
        >
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
