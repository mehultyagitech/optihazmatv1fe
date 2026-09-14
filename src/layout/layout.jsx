import React from "react";
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { Outlet } from "react-router-dom";
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import BrandLogo from '../components/brand/BrandLogo';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

function ToolbarActionsSearch() {
  return (
    <Stack direction="row">
      <Tooltip title="Search" enterDelay={1000}>
        <div>
          <IconButton
            type="button"
            aria-label="search"
            sx={{
              display: { xs: 'inline', md: 'none' },
            }}
          >
            <SearchIcon />
          </IconButton>
        </div>
      </Tooltip>
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        slotProps={{
          input: {
            endAdornment: (
              <IconButton type="button" aria-label="search" size="small">
                <SearchIcon />
              </IconButton>
            ),
            sx: { pr: 0.5 },
          },
        }}
        sx={{ display: { xs: 'none', md: 'inline-block' }, mr: 1 }}
      />
      <ThemeSwitcher />
    </Stack>
  );
}

function CustomAppTitle() {
  // The toolbar follows the theme switcher, so the logo does too.
  const theme = useTheme();
  return <BrandLogo size="sm" variant={theme.palette.mode === "dark" ? "dark" : "light"} />;
}

export default function Layout(props) {
  return (
    <DashboardLayout
      slots={{
        appTitle: CustomAppTitle,
        toolbarActions: ToolbarActionsSearch,
      }}>
      <Outlet />
    </DashboardLayout>
  );
}
