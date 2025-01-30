import React from 'react';
import './App.css'
import { Outlet, useNavigate } from "react-router-dom";
import { AppProvider } from '@toolpad/core/react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EquipmentIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import StorageIcon from '@mui/icons-material/Storage';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: 'dashboard',
    title: 'Main Dashboard',
    icon: <DashboardIcon />,
  },  
  {
    segment: 'vessels',
    title: 'Vessels',
    icon: <StorageIcon />,
  },
  {
    segment: 'client-manager',
    title: 'Client/Manager',
    icon: <PeopleIcon />,
  },
  {
    segment: 'request-log',
    title: 'Request Log',
    icon: <DashboardIcon />,
  },
  {
    segment: 'ihm-report',
    title: 'IHM Report',
    icon: <DashboardIcon />,
  },
  {
    segment: 'users',
    title: 'Users',
    icon: <PeopleIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Edit Items',
  },
  {
    segment: 'edit-location',
    title: 'Edit Location',
    icon: <LocationOnIcon />,
  },
  {
    segment: 'edit-sub-location',
    title: 'Edit Sub-Location',
    icon: <LocationOnIcon />,
  },
  {
    segment: 'edit-equipment',
    title: 'Edit Equipment',
    icon: <EquipmentIcon />,
  },
  {
    segment: 'edit-compartment',
    title: 'Edit Compartment',
    icon: <StorageIcon />,
  },
  {
    segment: 'edit-objects',
    title: 'Edit Objects',
    icon: <StorageIcon />,
  },
  {
    kind: 'divider',
  },
  {
    segment: 'logout',
    title: 'Logout',
    icon: <LogoutIcon />,
  },
];

function App() {

  const navigate = useNavigate();

  const [session, setSession] = React.useState({
    user: {
      name: 'Mehul Tyagi',
      email: 'mehultyagi@outlook.com',
      image: <AccountCircleIcon />,
    },
  });


  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession({
          user: {
            name: 'Mehul Tyagi',
            email: 'mehultyagi@outlook.com',
            image: <AccountCircleIcon />,
          },
        });
      },
      signOut: () => {
        navigate('/login');
        setSession(null);
      },
    };
  }, []);

  return (
    <AppProvider
      navigation={NAVIGATION}
      session={session}
      authentication={authentication}
      
    >
      <Outlet />
    </AppProvider>
  )
}

export default App
