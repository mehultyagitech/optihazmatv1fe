import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SailingIcon from "@mui/icons-material/Sailing";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { login } from "../../api/services/authService";

const FEATURES = [
  { icon: MapOutlinedIcon, text: "Location diagrams with every inventory point pinned on the ship plan" },
  { icon: ScienceOutlinedIcon, text: "Hazmat inventory by IHM class: paints, equipment, structure" },
  { icon: ReceiptLongOutlinedIcon, text: "PO and supplier MD / SDoC tracking through maintenance" },
  { icon: VerifiedOutlinedIcon, text: "IHM reports and maintenance certificates in a click" },
];

const Brand = ({ light }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: 2.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        background: light ? "rgba(255,255,255,0.16)" : "linear-gradient(135deg, #0d47a1, #26a69a)",
        border: light ? "1px solid rgba(255,255,255,0.3)" : "none",
      }}
    >
      <SailingIcon />
    </Box>
    <Typography variant="h6" fontWeight={800} sx={{ color: light ? "#fff" : "#0d47a1", letterSpacing: 0.3 }}>
      OptiHazmat
    </Typography>
  </Box>
);

// Stylised cargo ship on the sea, drawn inline so the page needs no extra files.
const ShipIllustration = () => (
  <Box
    component="svg"
    viewBox="0 0 800 260"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
    sx={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: { md: 220, lg: 260 } }}
  >
    <g opacity="0.9">
      {/* hull */}
      <path d="M150 150 L620 150 L585 196 L190 196 Z" fill="#0a2447" />
      <rect x="150" y="146" width="470" height="8" fill="#e53935" opacity="0.85" />
      {/* containers */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          <rect x={200 + i * 42} y="120" width="38" height="24" rx="2" fill={["#26a69a", "#ffb300", "#42a5f5", "#ef5350"][i % 4]} />
          {i % 3 !== 2 && (
            <rect x={200 + i * 42} y="94" width="38" height="24" rx="2" fill={["#42a5f5", "#ef5350", "#26a69a", "#ffb300"][i % 4]} />
          )}
        </g>
      ))}
      {/* bridge + funnel */}
      <rect x="548" y="88" width="52" height="58" rx="3" fill="#eceff1" />
      <rect x="556" y="98" width="36" height="8" rx="2" fill="#0d47a1" />
      <rect x="570" y="62" width="16" height="26" fill="#37474f" />
      <rect x="570" y="66" width="16" height="6" fill="#e53935" />
    </g>
    {/* waves */}
    <path d="M0 190 C 100 175, 200 205, 300 190 S 500 175, 600 190 S 750 205, 800 192 L800 260 L0 260 Z" fill="#26a69a" opacity="0.35" />
    <path d="M0 210 C 120 195, 240 225, 360 210 S 600 195, 800 212 L800 260 L0 260 Z" fill="#0b3d6e" opacity="0.8" />
    <path d="M0 232 C 140 220, 280 246, 420 232 S 680 220, 800 234 L800 260 L0 260 Z" fill="#08264a" />
  </Box>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await login(email.trim(), password);
      if (response?.data?.user) {
        // Full reload so the app starts fresh with the new session cookie.
        window.location.href = "/dashboard";
        return;
      }
      setError(response?.message || "Login failed. Please try again.");
    } catch (err) {
      setError((typeof err === "string" ? err : err?.message) || "Login failed. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" },
        bgcolor: "#f4f6fa",
      }}
    >
      {/* Brand / product panel */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          p: { md: 6, lg: 8 },
          background: "linear-gradient(160deg, #0b2a5b 0%, #0d47a1 55%, #00796b 100%)",
        }}
      >
        {/* Ship plan drawing as a faint texture */}
        <Box
          component="img"
          src="/image.png"
          alt=""
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "invert(1)",
            mixBlendMode: "screen",
            opacity: 0.12,
            pointerEvents: "none",
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 560 }}>
          <Brand light />
          <Typography variant="h3" fontWeight={800} sx={{ mt: 6, lineHeight: 1.15, fontSize: { md: 36, lg: 44 } }}>
            Inventory of Hazardous Materials, managed in one place.
          </Typography>
          <Typography sx={{ mt: 2, opacity: 0.85, fontSize: 17, maxWidth: 500 }}>
            Map hazmats on your ships, keep IHM Part 1 current through every maintenance cycle, and issue reports your
            fleet can rely on.
          </Typography>
          <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 1.75 }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Typography sx={{ opacity: 0.92 }}>{text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <ShipIllustration />
      </Box>

      {/* Sign-in */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: { xs: 4, md: 6 },
          background: { xs: "linear-gradient(180deg, #e3f2fd 0%, #f4f6fa 40%)", md: "none" },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 3 }}>
            <Brand />
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              bgcolor: "#fff",
              borderRadius: 4,
              p: { xs: 3, sm: 4.5 },
              boxShadow: "0 20px 50px rgba(13, 71, 161, 0.12)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h5" fontWeight={800}>
              Welcome back
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
              Sign in to your OptiHazmat account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={submitting}
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: 16,
                textTransform: "none",
                background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #26a69a 100%)",
                boxShadow: "0 8px 20px rgba(25, 118, 210, 0.35)",
              }}
            >
              {submitting ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Sign in"}
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
              Need access? Ask your OptiHazmat administrator.
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 3 }}>
            © {new Date().getFullYear()} OptiHazmat · IHM management for ship owners and managers
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
