const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const svgPath = path.join(publicDir, "app-icon.svg");

const svg = fs.readFileSync(svgPath);

const icons = [
  {
    size: 16,
    output: "favicon-16x16.png",
  },
  {
    size: 32,
    output: "favicon-32x32.png",
  },
  {
    size: 180,
    output: "apple-touch-icon.png",
  },
  {
    size: 192,
    output: "logo192.png",
  },
  {
    size: 512,
    output: "logo512.png",
  },
  {
    size: 192,
    output: "maskable-icon-192.png",
  },
  {
    size: 512,
    output: "maskable-icon-512.png",
  },
];

const generateIcons = async () => {
  await Promise.all(
    icons.map(({ size, output }) =>
      sharp(svg).resize(size, size).png().toFile(path.join(publicDir, output)),
    ),
  );

  console.log("PWA icons generated successfully.");
};

generateIcons().catch((error) => {
  console.error(error);
  process.exit(1);
});
