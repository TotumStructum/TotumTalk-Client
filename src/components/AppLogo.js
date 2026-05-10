import { Box } from "@mui/material";
import AppIcon from "../assets/Images/app-icon.svg";

const AppLogo = ({ size = 64, borderRadius = 2, sx = {} }) => {
  return (
    <Box
      component="img"
      src={AppIcon}
      alt="TotumTalk"
      sx={{
        width: size,
        height: size,
        display: "block",
        borderRadius,
        objectFit: "cover",
        boxShadow: "0 10px 28px rgba(10, 79, 122, 0.18)",
        ...sx,
      }}
    />
  );
};

export default AppLogo;
