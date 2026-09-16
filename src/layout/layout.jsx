import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import PlaceIcon from "@mui/icons-material/Place";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import DescriptionIcon from "@mui/icons-material/Description";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import MapIcon from "@mui/icons-material/Map";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import BrandLogo from "../components/brand/BrandLogo";
import BrandMark from "../components/brand/BrandMark";
import { commonVesselViewState } from "../utils/States/Vessel";
import logout from "../utils/logout";

const WIDTH = 264;
const COLLAPSED_WIDTH = 76;
const TOPBAR_HEIGHT = 64;
const COLLAPSE_KEY = "optihazmat.sidebarCollapsed";

const SIDEBAR_BG = "linear-gradient(180deg, #0b2a5b 0%, #0d3b7a 100%)";
const ACCENT = "#FFA726";

const MAIN_ITEMS = [
  { title: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { title: "Vessels", path: "/vessels/vessels", icon: DirectionsBoatIcon },
  { title: "Client / Manager", path: "/client-manager", icon: GroupsIcon },
  { title: "All PO Items", path: "/all-po-items", icon: ShoppingCartIcon },
  { title: "Users", path: "/users", icon: PeopleIcon, adminOnly: true },
];

// Pages for the vessel picked with "View" on the Vessels page.
const VESSEL_ITEMS = [
  { title: "Vessel Dashboard", path: "/vessels/vesselDashboard", icon: SpaceDashboardIcon },
  { title: "Location Diagram", path: "/vessels/location-diagram", icon: MapIcon, also: ["/vessels/new-area"] },
  { title: "Inventory Points", path: "/vessels/inventory-points", icon: Inventory2Icon },
  { title: "Generate IHM", path: "/vessels/generate-ihm", icon: SummarizeIcon },
  { title: "Generate LR", path: "/vessels/generate-lr", icon: AssessmentIcon },
];

const EDIT_ITEMS = [
  { title: "Locations", path: "/edit-location", icon: PlaceIcon },
  { title: "Sub-Locations", path: "/edit-sub-location", icon: MyLocationIcon },
  { title: "Equipment", path: "/edit-equipment", icon: PrecisionManufacturingIcon },
  { title: "Document Types", path: "/edit-document-type", icon: DescriptionIcon },
  { title: "Compartments", path: "/edit-compartment", icon: ViewInArIcon },
  { title: "Objects", path: "/edit-objects", icon: CategoryIcon },
];

// Page titles for routes that are not sidebar items.
const EXTRA_TITLES = [
  { match: /^\/vessels\/new-area/, title: "Mark New Area", section: "Vessel" },
  { match: /^\/vessels\/inventory-points\/.+/, title: "Location Point", section: "Vessel" },
];

const isActive = (item, pathname) =>
  [item.path, ...(item.also ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));

const initials = (name, email) =>
  (name || email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

function SectionLabel({ children, collapsed }) {
  if (collapsed) return <Divider sx={{ my: 1.5, mx: 2, borderColor: "rgba(255,255,255,0.12)" }} />;
  return (
    <Typography
      sx={{
        px: 3,
        pt: 2.5,
        pb: 0.75,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.5)",
      }}
    >
      {children}
    </Typography>
  );
}

function NavItem({ item, pathname, collapsed, nested, onNavigate }) {
  const active = isActive(item, pathname);
  const Icon = item.icon;
  const ref = useRef(null);
  // Keep the current page visible when the menu is taller than the window.
  // Scrolls only the sidebar list: scrollIntoView also moved the page itself.
  useEffect(() => {
    if (!active) return undefined;
    // After the Edit Items group has finished opening.
    const timer = setTimeout(() => {
      const el = ref.current;
      const nav = el?.closest("nav");
      if (!nav) return;
      const item = el.getBoundingClientRect();
      const box = nav.getBoundingClientRect();
      if (item.top < box.top || item.bottom > box.bottom) {
        nav.scrollTop += item.top - box.top - box.height / 2 + item.height / 2;
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [active]);
  const button = (
    <ListItemButton
      ref={ref}
      component={RouterLink}
      to={item.path}
      onClick={onNavigate}
      selected={active}
      sx={{
        position: "relative",
        mx: 1.5,
        my: 0.25,
        minHeight: 42,
        borderRadius: 2,
        px: collapsed ? 0 : 1.5,
        justifyContent: collapsed ? "center" : "flex-start",
        color: active ? "#fff" : "rgba(255,255,255,0.78)",
        "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
        "&.Mui-selected, &.Mui-selected:hover": { bgcolor: "rgba(255,255,255,0.14)" },
        // Placard-orange marker on the current page.
        "&.Mui-selected::before": {
          content: '""',
          position: "absolute",
          left: -12,
          top: 9,
          bottom: 9,
          width: 4,
          borderRadius: "0 4px 4px 0",
          bgcolor: ACCENT,
        },
      }}
    >
      <ListItemIcon
        sx={{
          // Fixed icon column so every label starts at the same x.
          minWidth: 0,
          width: 24,
          justifyContent: "center",
          mr: collapsed ? 0 : 1.5,
          color: active ? ACCENT : "inherit",
          "& svg": { fontSize: nested ? 20 : 22 },
        }}
      >
        <Icon />
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500, noWrap: true }}
        />
      )}
    </ListItemButton>
  );
  return collapsed ? (
    <Tooltip title={item.title} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

function SidebarContent({ collapsed, pathname, user, vessel, onNavigate, onToggleCollapse, showCollapseToggle }) {
  const navigate = useNavigate();
  const editActive = EDIT_ITEMS.some((item) => isActive(item, pathname));
  const [editOpen, setEditOpen] = useState(editActive);
  useEffect(() => {
    if (editActive) setEditOpen(true);
  }, [editActive]);

  const isAdmin = !user?.roles || user.roles === "ADMIN";
  const mainItems = MAIN_ITEMS.filter((item) => !item.adminOnly || isAdmin);
  const hasVessel = !!(vessel?.id && vessel?.name);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", background: SIDEBAR_BG, color: "#fff" }}>
      {/* Brand */}
      <Box
        sx={{
          height: TOPBAR_HEIGHT,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 0 : 2.5,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box
          component={RouterLink}
          to="/dashboard"
          onClick={onNavigate}
          aria-label="OptiHazmat dashboard"
          sx={{ display: "flex", textDecoration: "none" }}
        >
          {collapsed ? <BrandMark size={34} variant="dark" /> : <BrandLogo size="sm" variant="dark" />}
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          pb: 2,
          // App.css paints every scrollbar track light grey; keep this one clear.
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.25) transparent",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.25)", borderRadius: 3 },
        }}
      >
        <SectionLabel collapsed={collapsed}>Main</SectionLabel>
        <List disablePadding>
          {mainItems.map((item) => (
            <NavItem key={item.path} item={item} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </List>

        <SectionLabel collapsed={collapsed}>Selected Vessel</SectionLabel>
        {hasVessel ? (
          <>
            {!collapsed && (
              <Box
                sx={{
                  mx: 1.5,
                  mb: 0.75,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <Box sx={{ width: 24, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                  <DirectionsBoatIcon sx={{ fontSize: 22, color: ACCENT }} />
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700, flexGrow: 1, minWidth: 0 }} noWrap title={vessel.name}>
                  {vessel.name}
                </Typography>
                <Tooltip title="Change vessel">
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigate("/vessels/vessels");
                      onNavigate?.();
                    }}
                    sx={{ color: "rgba(255,255,255,0.75)", "&:hover": { color: "#fff" } }}
                  >
                    <SwapHorizIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            <List disablePadding>
              {VESSEL_ITEMS.map((item) => (
                <NavItem key={item.path} item={item} pathname={pathname} collapsed={collapsed} nested onNavigate={onNavigate} />
              ))}
            </List>
          </>
        ) : (
          !collapsed && (
            <Typography sx={{ px: 3, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
              Open a vessel with <b>View</b> on the Vessels page to see its diagrams, inventory points and reports.
            </Typography>
          )
        )}

        <SectionLabel collapsed={collapsed}>Settings</SectionLabel>
        {collapsed ? (
          <List disablePadding>
            {EDIT_ITEMS.map((item) => (
              <NavItem key={item.path} item={item} pathname={pathname} collapsed onNavigate={onNavigate} />
            ))}
          </List>
        ) : (
          <>
            <ListItemButton
              onClick={() => setEditOpen((open) => !open)}
              sx={{
                mx: 1.5,
                minHeight: 42,
                borderRadius: 2,
                px: 1.5,
                color: editActive ? "#fff" : "rgba(255,255,255,0.78)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, width: 24, justifyContent: "center", mr: 1.5, color: editActive ? ACCENT : "inherit", "& svg": { fontSize: 22 } }}>
                <TuneIcon />
              </ListItemIcon>
              <ListItemText primary="Edit Items" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              <ExpandMoreIcon
                fontSize="small"
                sx={{ transition: "transform 0.2s", transform: editOpen ? "rotate(180deg)" : "none" }}
              />
            </ListItemButton>
            <Collapse in={editOpen} timeout="auto" unmountOnExit>
              <List disablePadding sx={{ pl: 1.5 }}>
                {EDIT_ITEMS.map((item) => (
                  <NavItem key={item.path} item={item} pathname={pathname} nested onNavigate={onNavigate} />
                ))}
              </List>
            </Collapse>
          </>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.1)", p: 1.5 }}>
        {showCollapseToggle && (
          <Tooltip title={collapsed ? "Expand sidebar" : ""} placement="right">
            <ListItemButton
              onClick={onToggleCollapse}
              sx={{
                minHeight: 40,
                borderRadius: 2,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 0 : 1.5,
                color: "rgba(255,255,255,0.7)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, width: 24, justifyContent: "center", mr: collapsed ? 0 : 1.5, color: "inherit" }}>
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Collapse" primaryTypographyProps={{ fontSize: 14 }} />}
            </ListItemButton>
          </Tooltip>
        )}
        <Tooltip title={collapsed ? "Log out" : ""} placement="right">
          <ListItemButton
            onClick={() => logout()}
            sx={{
              minHeight: 40,
              borderRadius: 2,
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 0 : 1.5,
              color: "rgba(255,255,255,0.7)",
              "&:hover": { bgcolor: "rgba(229,57,53,0.18)", color: "#fff" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, width: 24, justifyContent: "center", mr: collapsed ? 0 : 1.5, color: "inherit" }}>
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Log out" primaryTypographyProps={{ fontSize: 14 }} />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function pageInfo(pathname) {
  const groups = [
    ["Main", MAIN_ITEMS],
    ["Vessel", VESSEL_ITEMS],
    ["Edit Items", EDIT_ITEMS],
  ];
  for (const [section, items] of groups) {
    const item = items.find((i) => isActive(i, pathname) && !(i.also ?? []).some((p) => pathname.startsWith(p)));
    if (item) return { section, title: item.title };
  }
  const extra = EXTRA_TITLES.find((e) => e.match.test(pathname));
  return extra ? { section: extra.section, title: extra.title } : { section: "", title: "" };
}

export default function Layout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const vessel = useRecoilValue(commonVesselViewState);
  // App loads the signed-in user before rendering any page.
  const user = useQueryClient().getQueryData(["userData"])?.data;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [accountAnchor, setAccountAnchor] = useState(null);

  const toggleCollapse = () =>
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1");
      } catch {
        // Storage unavailable: the choice just isn't remembered.
      }
      return !value;
    });

  const { section, title } = useMemo(() => pageInfo(pathname), [pathname]);
  const isVesselPage = section === "Vessel";
  const sidebarWidth = isDesktop ? (collapsed ? COLLAPSED_WIDTH : WIDTH) : 0;

  const sidebarProps = { pathname, user, vessel };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6fa" }}>
      {/* Sidebar */}
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: "width 0.2s ease",
            "& .MuiDrawer-paper": {
              width: sidebarWidth,
              boxSizing: "border-box",
              border: 0,
              overflowX: "hidden",
              transition: "width 0.2s ease",
            },
          }}
        >
          <SidebarContent {...sidebarProps} collapsed={collapsed} showCollapseToggle onToggleCollapse={toggleCollapse} />
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: WIDTH, boxSizing: "border-box", border: 0 } }}
        >
          <SidebarContent {...sidebarProps} collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      {/* Page */}
      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            top: 0,
            bgcolor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(10px)",
            color: "text.primary",
            borderBottom: "1px solid",
            borderColor: "divider",
            zIndex: theme.zIndex.appBar,
          }}
        >
          <Toolbar sx={{ minHeight: `${TOPBAR_HEIGHT}px !important`, gap: 1.5, px: { xs: 1.5, sm: 3 } }}>
            {!isDesktop && (
              <>
                <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                  <MenuIcon />
                </IconButton>
                <BrandMark size={28} />
              </>
            )}

            <Box sx={{ minWidth: 0 }}>
              {section && (
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
                  {section}
                </Typography>
              )}
              <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 }, lineHeight: 1.25 }} noWrap>
                {title}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {vessel?.id && vessel?.name && (
              <Tooltip title={isVesselPage ? "Vessel you are working on" : "Open this vessel's dashboard"}>
                <Chip
                  icon={<DirectionsBoatIcon />}
                  label={vessel.name}
                  onClick={() => navigate("/vessels/vesselDashboard")}
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    maxWidth: 240,
                    fontWeight: 600,
                    bgcolor: isVesselPage ? "#e3f2fd" : "#f1f5f9",
                    color: "#0d47a1",
                    "& .MuiChip-icon": { color: "#0d47a1" },
                  }}
                />
              </Tooltip>
            )}

            <Box
              component="button"
              type="button"
              onClick={(e) => setAccountAnchor(e.currentTarget)}
              aria-label="Account menu"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: 0,
                bgcolor: "transparent",
                cursor: "pointer",
                p: 0.5,
                pr: { xs: 0.5, sm: 1 },
                borderRadius: 5,
                font: "inherit",
                color: "inherit",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700, bgcolor: "#0d47a1" }}>
                {initials(user?.name, user?.email)}
              </Avatar>
              <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "left", maxWidth: 180 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }} noWrap>
                  {user?.name || user?.email}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.2 }}>
                  {user?.roles === "ADMIN" ? "Admin" : "User"}
                </Typography>
              </Box>
              <KeyboardArrowDownIcon fontSize="small" sx={{ display: { xs: "none", md: "block" }, color: "text.secondary" }} />
            </Box>
            <Menu
              anchorEl={accountAnchor}
              open={!!accountAnchor}
              onClose={() => setAccountAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { sx: { mt: 1, minWidth: 240, borderRadius: 2 } } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography fontWeight={700} noWrap>
                  {user?.name || "Signed in"}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => logout()} sx={{ py: 1.25, color: "error.main" }}>
                <ListItemIcon sx={{ color: "inherit" }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Log out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
