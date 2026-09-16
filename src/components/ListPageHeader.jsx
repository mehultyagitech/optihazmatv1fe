import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const whiteFieldSx = {
  "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 2 },
  "& .MuiOutlinedInput-notchedOutline": { border: 0 },
};

const FieldLabel = ({ children }) => (
  <Typography
    variant="caption"
    component="div"
    sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}
  >
    {children}
  </Typography>
);

/**
 * Gradient page header shared by the list pages (Vessels, Location Diagram,
 * Inventory Points): icon, title, subtitle, action buttons, and a panel with
 * an optional search box and dropdown filters.
 *
 * filters: [{ name, label, allLabel, value, options: [{ label, value }] }]
 */
export default function ListPageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
  search,
  filters = [],
  onFilterChange = () => {},
  children,
}) {
  const hasFilters = filters.some((f) => f.value);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        borderRadius: 3,
        color: "#fff",
        background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #26a69a 100%)",
      }}
    >
      <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
          {Icon && (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 30 }} />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {actions && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>{actions}</Box>
        )}
      </Box>

      {(search || filters.length > 0) && (
        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: 2.5,
            bgcolor: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: 2,
          }}
        >
          {search && (
            <Box sx={{ flex: { xs: "1 1 100%", md: "2 1 240px" }, minWidth: 0 }}>
              <FieldLabel>Search</FieldLabel>
              <TextField
                fullWidth
                size="small"
                placeholder={search.placeholder}
                value={search.value}
                onChange={search.onChange}
                inputProps={{ "aria-label": search.placeholder }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={whiteFieldSx}
              />
            </Box>
          )}
          {filters.map((filter) => (
            <Box key={filter.name} sx={{ flex: { xs: "1 1 100%", sm: "1 1 180px" }, minWidth: 0 }}>
              <FieldLabel>{filter.label}</FieldLabel>
              <TextField
                select
                fullWidth
                size="small"
                value={filter.value}
                onChange={(e) => onFilterChange(filter.name, e.target.value)}
                SelectProps={{ displayEmpty: true }}
                inputProps={{ "aria-label": filter.label }}
                sx={whiteFieldSx}
              >
                <MenuItem value="">{filter.allLabel || `All`}</MenuItem>
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          ))}
          {filters.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              disabled={!hasFilters}
              onClick={() => filters.forEach((f) => f.value && onFilterChange(f.name, ""))}
              sx={{
                height: 40,
                color: "#fff",
                borderColor: "rgba(255,255,255,0.6)",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
                "&.Mui-disabled": { color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.25)" },
              }}
            >
              Reset
            </Button>
          )}
        </Box>
      )}
      {children}
    </Paper>
  );
}

// White button for the header's action slot.
export const headerButtonSx = {
  bgcolor: "#fff",
  color: "#0d47a1",
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "#e3f2fd" },
};

export const headerOutlinedButtonSx = {
  color: "#fff",
  borderColor: "rgba(255,255,255,0.6)",
  textTransform: "none",
  fontWeight: 600,
  "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
  "&.Mui-disabled": { color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.25)" },
};
