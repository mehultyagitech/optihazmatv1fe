// Import React and the required Typography component from MUI
import React from 'react';
import { Typography } from '@mui/material';

// Define the OPTypography component
const OPTypography = ({ children, ...props }) => {
  return (
    <Typography {...props}>
      {children}
    </Typography>
  );
};

// Export the component
export default OPTypography;
