import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './layout/layout.jsx';
import { PageContainer } from '@toolpad/core';
import CredentialsSignInPage from './pages/admin/login.jsx';
import Users from './pages/admin/users.jsx';
import NotFound from './pages/admin/notFound.jsx';
import EditLocations from './pages/admin/editLocations.jsx';
import EditSubLocations from './pages/admin/editSubLocations.jsx';
import EditEquipmentName from './pages/admin/editEquipmentName.jsx';
import EditCompartment from './pages/admin/editCompartment.jsx';
import OverviewCard from './pages/admin/dashboard.jsx';
import VesselClientManager from './pages/admin/clientManager/vesselClientManager.jsx';
import Vessel from './pages/admin/vessel/vessel.jsx';
import VesselDashboard from './pages/admin/vessel/vesselDashboard.jsx';
import LocationDiagram from './pages/admin/vessel/locationDiagram.jsx';
import InventoryPoint from './pages/admin/vessel/inventoryPoints.jsx'
import GenerateIHM from './pages/admin/vessel/generateIHM.jsx'
import GenerateLR from './pages/admin/vessel/generateLR.jsx'
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
            element: <Users />
          },
          {
            path: "/edit-location",
            element: <EditLocations />
          },
          {
            path: "/edit-sub-location",
            element: <EditSubLocations />
          },
          {
            path: "/edit-equipment",
            element: <EditEquipmentName />
          },
          {
            path: "/edit-compartment",
            element: <EditCompartment />
          },
          {
            path: "*",
            element: <NotFound />,
          },
          {
            path: "/dashboard",
            element: <OverviewCard />,
          },
          {
            path: "/client-manager",
            element: <VesselClientManager />,
          },
          {
            path: "/vessels/vessels",
            element: <Vessel />,
          },
          {
            path: "/vessels/vesselDashboard",
            element: <VesselDashboard />,
          },
          {
            path: "/vessels/location-diagram",
            element: <LocationDiagram />,
          },
          {
            path: "/vessels/inventory-points",
            element: <InventoryPoint />,
          },
          {
            path: "/vessels/generate-ihm",
            element: <GenerateIHM />,
          },
          {
            path: "/vessels/generate-lr",
            element: <GenerateLR />,
          },
        ]
      },

      {
        path: "/login",
        element: <CredentialsSignInPage />
      },
    ]
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
