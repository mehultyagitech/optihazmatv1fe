import React, { Suspense, useEffect, useMemo } from "react";
import "./App.css";
import { Outlet, useNavigate } from "react-router-dom";
import { AppProvider } from "@toolpad/core/react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { AppLoader } from "./components/SharedLoaders";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { commonVesselViewState } from "./utils/States/Vessel";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./api/axiosInstance";
import genericState from "./utils/States/Generic";
import { getNavigationWithVessel } from "./utils/navigation.jsx";

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

  // Memoize navigation to prevent unnecessary re-renders
  const navigation = useMemo(() => {
    return getNavigationWithVessel(vesselView);
  }, [vesselView]);

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

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <Suspense fallback={<AppLoader />}>
      <AppProvider
        navigation={navigation}
        session={session || user}
        authentication={authentication}
      >
        <Outlet />
      </AppProvider>
    </Suspense>
  );
}

export default App;
