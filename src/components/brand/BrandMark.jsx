import { Box } from "@mui/material";
import { BRAND_COLORS } from "./brandColors";

const VARIANTS = {
  light: { hull: BRAND_COLORS.navy, point: BRAND_COLORS.orange },
  dark: { hull: "#FFFFFF", point: BRAND_COLORS.orangeOnDark },
  mono: { hull: "currentColor", point: "currentColor" },
};

// Two drawings of the same mark. "bold" has heavier strokes so it stays
// legible at toolbar/favicon sizes; it matches /favicon.svg.
const GEOMETRY = {
  regular: {
    hull: "M20 33H9Q6 33 6 36V52Q6 55 9 55H36C47 55 55 51 60 44C55 37 47 33 36 33H32",
    hullWidth: 4,
    diamond: "M26 6L36 16L26 26L16 16Z",
    diamondStroke: 2,
    stem: "M26 26V41",
    stemWidth: 3,
    dot: { cx: 26, cy: 44, r: 4 },
  },
  bold: {
    hull: "M18 34H7.5Q4 34 4 37.5V52.5Q4 56 7.5 56H37C48 56 56 52 61 45C56 38 48 34 37 34H34",
    hullWidth: 5.5,
    diamond: "M26 3L38 15L26 27L14 15Z",
    diamondStroke: 2.5,
    stem: "M26 27V40",
    stemWidth: 4,
    dot: { cx: 26, cy: 45, r: 5 },
  },
};

/**
 * The OptiHazmat mark: a ship drawn in plan view, like the deck plans users
 * upload as location diagrams, with an inventory point (a hazmat placard
 * diamond on a pin) marking a spot on it.
 *
 * variant: "light" (light backgrounds), "dark" (dark backgrounds), "mono"
 * (one colour, taken from the CSS `color`).
 */
export default function BrandMark({ size = 40, variant = "light", title, sx }) {
  const colors = VARIANTS[variant] ?? VARIANTS.light;
  const shape = size <= 32 ? GEOMETRY.bold : GEOMETRY.regular;

  return (
    <Box
      component="svg"
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      sx={{ width: size, height: size, display: "block", flexShrink: 0, ...sx }}
    >
      <path
        d={shape.hull}
        fill="none"
        stroke={colors.hull}
        strokeWidth={shape.hullWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={shape.diamond}
        fill={colors.point}
        stroke={colors.point}
        strokeWidth={shape.diamondStroke}
        strokeLinejoin="round"
      />
      <path d={shape.stem} fill="none" stroke={colors.point} strokeWidth={shape.stemWidth} strokeLinecap="round" />
      <circle cx={shape.dot.cx} cy={shape.dot.cy} r={shape.dot.r} fill={colors.point} />
    </Box>
  );
}
