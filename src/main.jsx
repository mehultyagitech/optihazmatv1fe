import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './layout/layout.jsx';
import { PageContainer } from '@toolpad/core';
import CredentialsSignInPage from './pages/login.jsx';
import Users from './pages/users.jsx';
import NotFound from './pages/notFound.jsx';
import EditLocations from './pages/editLocations.jsx';
import EditSubLocations from './pages/editSubLocations.jsx';
import EditEquipmentName from './pages/editEquipmentName.jsx';
import EditCompartment from './pages/editCompartment.jsx';
import OverviewCard from './pages/dashboard.jsx';

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
