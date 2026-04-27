import { useTheme } from "@emotion/react";
import {
  Box,
  Divider,
  IconButton,
  Link as MuiLink,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { DotsThreeVertical, DownloadSimple, File, Image } from "phosphor-react";
import React from "react";
import { Message_options } from "../../data/index";

const getBubbleStyles = (theme, incoming) => ({
  backgroundColor: incoming
    ? theme.palette.mode === "light"
      ? theme.palette.common.white
      : theme.palette.background.paper
    : theme.palette.primary.main,
  borderRadius: 1.5,
  width: "max-content",
  maxWidth: "85%",
});

const getTextColor = (theme, incoming) =>
  incoming ? theme.palette.text.primary : "#fff";

const getFileName = (file = "") => {
  if (!file) return "Document";
  const parts = file.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "Document");
};

const URL_PATTERN =
  /((?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#][^\s]*)?)/i;

const createGlobalUrlRegex = () =>
  /((?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#][^\s]*)?)/gi;

const containsUrl = (text = "") => {
  return URL_PATTERN.test(text);
};

const getNormalizedUrl = (value = "") => {
  if (!value) return null;

  return value.startsWith("http") ? value : `https://${value}`;
};

const renderTextWithLinks = (text, theme, incoming) => {
  const regex = createGlobalUrlRegex();
  const matches = [...text.matchAll(regex)];

  if (matches.length === 0) {
    return text;
  }

  const parts = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const matchedText = match[0];
    const start = match.index ?? 0;
    const end = start + matchedText.length;

    if (start > lastIndex) {
      parts.push(
        <React.Fragment key={`text-${index}`}>
          {text.slice(lastIndex, start)}
        </React.Fragment>,
      );
    }

    parts.push(
      <MuiLink
        key={`link-${index}`}
        href={getNormalizedUrl(matchedText)}
        target="_blank"
        rel="noreferrer"
        underline="hover"
        sx={{
          wordBreak: "break-all",
          color: incoming ? theme.palette.primary.main : "#fff",
        }}
      >
        {matchedText}
      </MuiLink>,
    );

    lastIndex = end;
  });

  if (lastIndex < text.length) {
    parts.push(
      <React.Fragment key="text-tail">{text.slice(lastIndex)}</React.Fragment>,
    );
  }

  return parts;
};

const DocMsg = ({ el, menu }) => {
  const theme = useTheme();
  const fileName = getFileName(el.file);
  const textColor = getTextColor(theme, el.incoming);
  const secondaryTextColor = el.incoming
    ? theme.palette.text.secondary
    : "rgba(255,255,255,0.75)";

  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box p={1.5} sx={getBubbleStyles(theme, el.incoming)}>
        <Stack spacing={1}>
          <Box
            component={el.file ? "a" : "div"}
            href={el.file || undefined}
            target={el.file ? "_blank" : undefined}
            rel={el.file ? "noreferrer" : undefined}
            aria-label={el.file ? `Open document ${fileName}` : "Document"}
            sx={{
              color: "inherit",
              textDecoration: "none",
              cursor: el.file ? "pointer" : "default",
            }}
          >
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{
                minWidth: 220,
                maxWidth: 280,
              }}
            >
              <File size={34} color={textColor} />

              <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  title={fileName}
                  sx={{ color: textColor }}
                >
                  {fileName}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ color: secondaryTextColor }}
                >
                  Open document
                </Typography>
              </Stack>

              <DownloadSimple size={22} color={secondaryTextColor} />
            </Stack>
          </Box>

          {el.text ? (
            <Typography
              variant="body2"
              sx={{
                color: textColor,
                wordBreak: "break-word",
              }}
            >
              {el.text}
            </Typography>
          ) : null}
        </Stack>
      </Box>

      {menu && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 0.5,
          }}
        >
          <MessageOptions />
        </Box>
      )}
    </Stack>
  );
};

const LinkMsg = ({ el, menu }) => {
  const theme = useTheme();
  const hasUrl = containsUrl(el.text || "");

  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box p={1.5} sx={getBubbleStyles(theme, el.incoming)}>
        <Typography
          component="div"
          variant="body2"
          sx={{
            color: getTextColor(theme, el.incoming),
            wordBreak: "break-word",
          }}
        >
          {hasUrl
            ? renderTextWithLinks(el.text || "", theme, el.incoming)
            : el.text}
        </Typography>
      </Box>
      {menu && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 0.5,
          }}
        >
          <MessageOptions />
        </Box>
      )}
    </Stack>
  );
};

const ReplyMsg = ({ el }) => {
  const theme = useTheme();

  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box p={1.5} sx={getBubbleStyles(theme, el.incoming)}>
        <Stack spacing={2}>
          <Stack
            p={2}
            direction="column"
            spacing={3}
            alignItems="center"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1.5,
            }}
          >
            <Typography variant="body2" color={theme.palette.text.primary}>
              {el.message}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{ color: getTextColor(theme, el.incoming) }}
          >
            {el.reply}
          </Typography>
        </Stack>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 0.5,
        }}
      >
        <MessageOptions />
      </Box>
    </Stack>
  );
};

const MediaMsg = ({ el, menu, onLoad }) => {
  const theme = useTheme();
  const hasCaption = Boolean(el.text);

  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box
        p={hasCaption ? 1 : 0}
        sx={{
          ...getBubbleStyles(theme, el.incoming),
          overflow: "hidden",
        }}
      >
        <Stack spacing={hasCaption ? 1 : 0}>
          {el.file ? (
            <Box
              component="a"
              href={el.file}
              target="_blank"
              rel="noreferrer"
              sx={{
                display: "block",
                lineHeight: 0,
                cursor: "pointer",
              }}
            >
              <Box
                component="img"
                src={el.file}
                alt="Media message"
                onLoad={"onLoad"}
                sx={{
                  display: "block",
                  maxHeight: 260,
                  maxWidth: 260,
                  borderRadius: hasCaption ? "10px" : "12px",
                  objectFit: "cover",
                }}
              />
            </Box>
          ) : (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Image size={32} />
              <Typography variant="caption">Media file</Typography>
            </Stack>
          )}

          {el.text ? (
            <Typography
              variant="body2"
              sx={{
                color: getTextColor(theme, el.incoming),
                wordBreak: "break-word",
                px: 0.5,
                pb: 0.5,
              }}
            >
              {el.text}
            </Typography>
          ) : null}
        </Stack>
      </Box>

      {menu && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 0.5,
          }}
        >
          <MessageOptions />
        </Box>
      )}
    </Stack>
  );
};

const TextMsg = ({ el, menu }) => {
  const theme = useTheme();

  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box p={1.5} sx={getBubbleStyles(theme, el.incoming)}>
        <Typography
          variant="body2"
          sx={{
            color: getTextColor(theme, el.incoming),
            wordBreak: "break-word",
          }}
        >
          {el.message}
        </Typography>
      </Box>
      {menu && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 0.5,
          }}
        >
          <MessageOptions />
        </Box>
      )}
    </Stack>
  );
};

const Timeline = ({ el }) => {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Divider width="46%" />
      <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
        {el.text}
      </Typography>
      <Divider width="46%" />
    </Stack>
  );
};

const MessageOptions = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        size="small"
        sx={{
          color: "text.secondary",
        }}
      >
        <DotsThreeVertical size={20} />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <Stack spacing={1} px={1}>
          {Message_options.map((el, idx) => (
            <MenuItem key={`${el.title}-${idx}`} onClick={handleClose}>
              {el.title}
            </MenuItem>
          ))}
        </Stack>
      </Menu>
    </>
  );
};

export { Timeline, TextMsg, MediaMsg, ReplyMsg, LinkMsg, DocMsg };
