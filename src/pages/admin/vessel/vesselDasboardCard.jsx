import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const STATS = [
  { key: "i1", label: "I-1", color: "#2e7d32", bg: "#e8f5e9" },
  { key: "i2", label: "I-2", color: "#1565c0", bg: "#e3f2fd" },
  { key: "i3", label: "I-3", color: "#00695c", bg: "#e0f2f1" },
  { key: "active", label: "Active", color: "#37474f", bg: "#eceff1" },
  { key: "removedReplaced", label: "Rem/Rep", color: "#c62828", bg: "#ffebee" },
];

/**
 * Location diagram card on the vessel dashboard: picture, Location Category /
 * Location, and the point counts. Clicking opens the diagram's points.
 */
const DiagramCard = ({ diagram, avatarSrc, onOpen }) => {
  const counts = diagram.pinCounts ?? {};

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 10px 24px rgba(13, 71, 161, 0.18)",
        },
      }}
    >
      <CardActionArea
        onClick={onOpen}
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box sx={{ position: "relative" }}>
          {avatarSrc ? (
            <CardMedia
              component="img"
              height="150"
              image={avatarSrc}
              alt={diagram.locationName}
              sx={{ objectFit: "cover", bgcolor: "#eef2f6" }}
            />
          ) : (
            <Box
              sx={{
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#eef2f6",
                color: "text.disabled",
              }}
            >
              <PlaceOutlinedIcon sx={{ fontSize: 48 }} />
            </Box>
          )}
          <Chip
            size="small"
            label={`${counts.total ?? 0} point${counts.total === 1 ? "" : "s"}`}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              bgcolor: "rgba(13, 71, 161, 0.9)",
              color: "#fff",
              fontWeight: 600,
            }}
          />
        </Box>

        <Box sx={{ px: 2, pt: 1.5, pb: 1, flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Location Category
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3, wordBreak: "break-word" }}>
            {diagram.locationName || "-"}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
            Location
          </Typography>
          <Typography variant="body2" fontWeight={600} color="#2e7d32" sx={{ wordBreak: "break-word" }}>
            {diagram.subLocationName || "-"}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 0.5,
            px: 1.5,
            pb: 1.5,
          }}
        >
          {STATS.map((stat) => (
            <Box
              key={stat.key}
              sx={{ bgcolor: stat.bg, borderRadius: 1.5, py: 0.75, textAlign: "center" }}
            >
              <Typography variant="body2" fontWeight={700} color={stat.color}>
                {counts[stat.key] ?? 0}
              </Typography>
              <Typography sx={{ fontSize: 10.5, color: "text.secondary", whiteSpace: "nowrap" }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider />
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary" noWrap>
            Added by {diagram.userName || "-"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", color: "primary.main" }}>
            <Typography variant="caption" fontWeight={600}>
              Open
            </Typography>
            <ChevronRightIcon fontSize="small" />
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default DiagramCard;
