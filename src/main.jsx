import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './layout/layout.jsx';
import { PageContainer } from '@toolpad/core';
import { RecoilRoot } from "recoil";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { PageLoader } from './components/SharedLoaders';

// Lazy load all page components
const CredentialsSignInPage = lazy(() => import('./pages/admin/login.jsx'));
const Users = lazy(() => import('./pages/admin/users.jsx'));
const NotFound = lazy(() => import('./pages/admin/notFound.jsx'));
const EditLocations = lazy(() => import('./pages/admin/editLocations.jsx'));
const EditSubLocations = lazy(() => import('./pages/admin/editSubLocations.jsx'));
const EditEquipmentName = lazy(() => import('./pages/admin/editEquipmentName.jsx'));
const EditCompartment = lazy(() => import('./pages/admin/editCompartment.jsx'));
const OverviewCard = lazy(() => import('./pages/admin/dashboard.jsx'));
const VesselClientManager = lazy(() => import('./pages/admin/clientManager/vesselClientManager.jsx'));
const Vessel = lazy(() => import('./pages/admin/vessel/vessel.jsx'));
const VesselDashboard = lazy(() => import('./pages/admin/vessel/vesselDashboard.jsx'));
const LocationDiagram = lazy(() => import('./pages/admin/vessel/locationDiagram.jsx'));
const InventoryPoint = lazy(() => import('./pages/admin/vessel/inventoryPoints.jsx'));
const GenerateIHM = lazy(() => import('./pages/admin/vessel/generateIHM.jsx'));
const GenerateLR = lazy(() => import('./pages/admin/vessel/generateLR.jsx'));
const LocationPoint = lazy(() => import('./pages/admin/vessel/locationPoint.jsx'));
const CropLocationDiagram = lazy(() => import('./pages/admin/vessel/areaCrop.jsx'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            path: "/users",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Users />
              </Suspense>
            ),
          },
          {
            path: "/edit-location",
            element: (
              <Suspense fallback={<PageLoader />}>
                <EditLocations />
              </Suspense>
            ),
          },
          {
            path: "/edit-sub-location",
            element: (
              <Suspense fallback={<PageLoader />}>
                <EditSubLocations />
              </Suspense>
            ),
          },
          {
            path: "/edit-equipment",
            element: (
              <Suspense fallback={<PageLoader />}>
                <EditEquipmentName />
              </Suspense>
            ),
          },
          {
            path: "/edit-compartment",
            element: (
              <Suspense fallback={<PageLoader />}>
                <EditCompartment />
              </Suspense>
            ),
          },
          {
            path: "*",
            element: (
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            ),
          },
          {
            path: "/dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OverviewCard />
              </Suspense>
            ),
          },
          {
            path: "/client-manager",
            element: (
              <Suspense fallback={<PageLoader />}>
                <VesselClientManager />
              </Suspense>
            ),
          },
          {
            path: "/vessels/vessels",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Vessel />
              </Suspense>
            ),
          },
          {
            path: "/vessels/vesselDashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <VesselDashboard />
              </Suspense>
            ),
          },
          {
            path: "/vessels/location-diagram",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LocationDiagram />
              </Suspense>
            ),
          },
          {
            path: "/vessels/inventory-points",
            element: (
              <Suspense fallback={<PageLoader />}>
                <InventoryPoint />
              </Suspense>
            ),
          },
          {
            path: "/vessels/inventory-points/:locationDiagramId",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LocationPoint />
              </Suspense>
            ),
          },
          {
            path: "/vessels/generate-ihm",
            element: (
              <Suspense fallback={<PageLoader />}>
                <GenerateIHM />
              </Suspense>
            ),
          },
          {
            path: "/vessels/generate-lr",
            element: (
              <Suspense fallback={<PageLoader />}>
                <GenerateLR />
              </Suspense>
            ),
          },
          {
            path: "/vessels/new-area",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CropLocationDiagram />
              </Suspense>
            ),
          },
        ]
      },

      {
        path: "/login",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CredentialsSignInPage />
          </Suspense>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </RecoilRoot>
  </StrictMode>
);
