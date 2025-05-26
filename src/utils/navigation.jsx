import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EquipmentIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import StorageIcon from "@mui/icons-material/Storage";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import InventoryIcon from "@mui/icons-material/Inventory";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AssessmentIcon from "@mui/icons-material/Assessment";

export const BASE_NAVIGATION = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    segment: "dashboard",
    title: "Main Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "vessels",
    title: "Vessels Info",
    icon: <StorageIcon />,
    children: [
      {
        segment: "vessels",
        title: "Vessels",
        icon: <HandshakeIcon />,
      },
    ],
  },
  {
    segment: "client-manager",
    title: "Client/Manager",
    icon: <PeopleIcon />,
  },
  {
    segment: "request-log",
    title: "Request Log",
    icon: <DashboardIcon />,
  },
  {
    segment: "ihm-report",
    title: "IHM Report",
    icon: <DashboardIcon />,
  },
  {
    segment: "users",
    title: "Users",
    icon: <PeopleIcon />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Edit Items",
  },
  {
    segment: "edit-location",
    title: "Edit Location",
    icon: <LocationOnIcon />,
  },
  {
    segment: "edit-sub-location",
    title: "Edit Sub-Location",
    icon: <LocationOnIcon />,
  },
  {
    segment: "edit-equipment",
    title: "Edit Equipment",
    icon: <EquipmentIcon />,
  },
  {
    segment: "edit-compartment",
    title: "Edit Compartment",
    icon: <StorageIcon />,
  },
  {
    segment: "edit-objects",
    title: "Edit Objects",
    icon: <StorageIcon />,
  },
  {
    kind: "divider",
  },
  {
    segment: "logout",
    title: "Logout",
    icon: <LogoutIcon />,
  },
];

export const VESSEL_NAVIGATION_ITEMS = [
  {
    segment: "vessels",
    title: "Vessels",
    icon: <HandshakeIcon />,
  },
  {
    segment: "vesselDashboard",
    title: "Vesssel Dashboard",
    icon: <DashboardCustomizeIcon />,
  },
  {
    segment: "location-diagram",
    title: "Location Diagram",
    icon: <AddLocationIcon />,
  },
  {
    segment: "inventory-points",
    title: "Inventory Points",
    icon: <InventoryIcon />,
  },
  {
    segment: "generate-ihm",
    title: "Generate IHM",
    icon: <SummarizeIcon />,
  },
  {
    segment: "generate-lr",
    title: "Generate LR",
    icon: <AssessmentIcon />,
  },
];

export const getNavigationWithVessel = (vesselView) => {
  const navigation = [...BASE_NAVIGATION];
  
  if (vesselView?.id && vesselView?.name) {
    // Find the vessels section and update its children
    const vesselSectionIndex = navigation.findIndex(item => item.segment === "vessels");
    if (vesselSectionIndex !== -1) {
      navigation[vesselSectionIndex] = {
        ...navigation[vesselSectionIndex],
        children: VESSEL_NAVIGATION_ITEMS
      };
    }
  }
  
  return navigation;
}; 