import React from "react";
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { Outlet } from "react-router-dom";
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
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
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <CloudCircleIcon fontSize="large" color="primary" />
      <Typography variant="h6">Optihazmat</Typography>
    </Stack>
  );
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
