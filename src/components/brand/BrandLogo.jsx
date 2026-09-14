import { Box } from "@mui/material";
import BrandMark from "./BrandMark";
import { BRAND_COLORS } from "./brandColors";

const SIZES = {
  sm: { mark: 30, font: 19, gap: 1 },
  md: { mark: 40, font: 23, gap: 1.25 },
  lg: { mark: 56, font: 32, gap: 1.5 },
};

const TEXT_COLORS = {
  light: BRAND_COLORS.navy,
  dark: "#FFFFFF",
  mono: "currentColor",
};

/**
 * Mark + "OptiHazmat" wordmark. The wordmark is live text (the site font), so
 * it stays crisp at any size; "Opti" is set lighter than "Hazmat".
 */
export default function BrandLogo({ size = "md", variant = "light", sx }) {
  const dims = SIZES[size] ?? SIZES.md;

  return (
    <Box
      role="img"
      aria-label="OptiHazmat"
      sx={{ display: "inline-flex", alignItems: "center", gap: dims.gap, ...sx }}
    >
      <BrandMark size={dims.mark} variant={variant} />
      <Box
        component="span"
        aria-hidden
        sx={{
          fontFamily: 'Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: dims.font,
          lineHeight: 1,
          letterSpacing: "-0.01em",
          color: TEXT_COLORS[variant] ?? TEXT_COLORS.light,
          whiteSpace: "nowrap",
        }}
      >
        <Box component="span" sx={{ fontWeight: 500 }}>
          Opti
        </Box>
        <Box component="span" sx={{ fontWeight: 800 }}>
          Hazmat
        </Box>
      </Box>
    </Box>
  );
}
