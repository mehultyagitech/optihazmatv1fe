import { Avatar, Box, Card, Checkbox, Divider, Typography } from "@mui/material";

const isBlank = (value) => value === null || value === undefined || value === "";

/**
 * List card used by the Vessels, Location Diagram and Inventory Points pages.
 *
 * The picture and title get the full card width and the buttons sit in a
 * footer, so a narrow card never squeezes the title into a one-letter column.
 * `fields` is a list of { label, value, color } shown in two columns.
 */
export default function InfoCard({
  avatarSrc,
  avatarVariant = "circular",
  title,
  subtitle,
  fields = [],
  actions,
  selectable = false,
  selected = false,
  onToggle,
  onOpen,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        borderRadius: 3,
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        boxShadow: selected
          ? "0 0 0 1px #1976d2"
          : "0 1px 3px rgba(15, 23, 42, 0.08)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 20px rgba(25, 118, 210, 0.18)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, pb: 1.5 }}>
        {selectable && (
          <Checkbox
            checked={selected}
            onChange={onToggle}
            sx={{ p: 0.5, ml: -0.5 }}
            inputProps={{ "aria-label": `Select ${title ?? ""}` }}
          />
        )}
        <Box
          onClick={onOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
            flexGrow: 1,
            cursor: onOpen ? "pointer" : "default",
          }}
        >
          <Avatar
            src={avatarSrc}
            alt={title}
            variant={avatarVariant}
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              bgcolor: "#eef2f6",
              color: "#90a4ae",
              // Diagrams are line drawings: show all of it, not a crop.
              "& img": { objectFit: avatarVariant === "rounded" ? "contain" : "cover" },
              fontWeight: 700,
            }}
          >
            {/* No picture (e.g. companies): show the initial, not a person icon. */}
            {!avatarSrc && !isBlank(title) ? String(title).trim().charAt(0).toUpperCase() : undefined}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              title={title}
              sx={{
                lineHeight: 1.25,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                wordBreak: "break-word",
              }}
            >
              {isBlank(title) ? "-" : title}
            </Typography>
            {!isBlank(subtitle) && (
              <Typography variant="body2" color="text.secondary" noWrap title={subtitle}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          columnGap: 2,
          rowGap: 1.5,
          p: 2,
          flexGrow: 1,
          alignContent: "start",
        }}
      >
        {fields.map(({ label, value, color }) => (
          <Box key={label} sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {label}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              color={color || "text.primary"}
              sx={{ wordBreak: "break-word" }}
            >
              {isBlank(value) ? "-" : value}
            </Typography>
          </Box>
        ))}
      </Box>

      {actions && (
        <>
          <Divider />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: 1,
              px: 2,
              py: 1.25,
            }}
          >
            {actions}
          </Box>
        </>
      )}
    </Card>
  );
}
