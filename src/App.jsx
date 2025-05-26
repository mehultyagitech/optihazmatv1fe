import React, { Suspense, useEffect } from "react";
import "./App.css";
import { Outlet, useNavigate } from "react-router-dom";
import { AppProvider } from "@toolpad/core/react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EquipmentIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import StorageIcon from "@mui/icons-material/Storage";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import InventoryIcon from "@mui/icons-material/Inventory";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { commonVesselViewState } from "./utils/States/Vessel";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./api/axiosInstance";
import genericState, { DocumentTypeSelector } from "./utils/States/Generic";

const NAVIGATION = [
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

function App() {
  const navigate = useNavigate();
  const setGenericState = useSetRecoilState(genericState);
  const [session, setSession] = React.useState(null);

  const {
    data: user,
    refetch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/users/me");
        return response.data;
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    select: (data) => data.data
  });

  const generics = useQuery({
    queryKey: ["genericData"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/generics");
        return response.data;
      } catch (error) {
        console.error("Error fetching generic data:", error);
        throw error;
      }
    },
    enabled: false,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    select: (response) => response.data
  });

  // Check authentication status when component mounts and handle redirects
  useEffect(() => {
    if (!isLoading && !session && isError) {
      navigate("/login");
    }
  }, [isLoading, session, isError, navigate]);

  const vesselView = useRecoilValue(commonVesselViewState);

  if (!!vesselView && !!vesselView.id && !!vesselView.name) {
    NAVIGATION[2].children = [
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
  }

  useEffect(() => {
    if (user) {
      generics.refetch();
      setSession(() => {
        return {
          user : {
            image: <AccountCircleIcon />,
            ...user,
          }
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (generics.isSuccess) {
      setGenericState((prev) => {
        return {
          ...prev,
          Compartments: generics.data.Compartments,
          DocumentTypes: generics.data.DocumentTypes,
          Equipments: generics.data.Equipments,
          Locations: generics.data.Locations,
          SubLocations: generics.data.SubLocations,
          Objects: generics.data.Objects,
          Inventory: generics.data.Inventory,
        };
      });
    }
  }, [generics.isSuccess])

  // Create authentication as an object instead of a function
  const authentication = {
    signIn: () => {
      refetch();
    },
    signOut: async () => {
      await axiosInstance.post("/auth/logout");
      navigate("/login");
      setSession(null);
      refetch();
    },
  };

  // Create a loader component
  const Loader = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Box sx={{ mt: 2, color: "text.secondary" }}>
        Loading application...
      </Box>
    </Box>
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <AppProvider
        navigation={NAVIGATION}
        session={session || user}
        authentication={authentication}
      >
        <Outlet />
      </AppProvider>
    </Suspense>
  );
}

export default App;
