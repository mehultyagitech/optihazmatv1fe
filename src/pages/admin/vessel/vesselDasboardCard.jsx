import React from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  Grid,
  Paper,
} from "@mui/material";

const ClientCard = ({ avatarSrc, name, survey, maint, removed, active }) => {
  return (
    <Card
      elevation={3}
      sx={{
        width: 230,
        borderRadius: 3,
        overflow: "hidden",
        margin: 2,
        bgcolor: "#f9f9f9",
      }}
    >
      {/* Image */}
      <CardMedia
        component="img"
        height="130"
        image={avatarSrc}
        alt={name}
        sx={{ objectFit: "cover" }}
      />

      {/* Header */}
      <Box bgcolor="#e9fbe9" p={1}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          textAlign="center"
          color="green"
        >
          {name}
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={0.5} p={1} textAlign="center">
        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 1, bgcolor: "#e3f2fd" }}>
            <Typography variant="body2" fontWeight={600}>{survey}</Typography>
            <Typography variant="caption" color="text.secondary">I-1</Typography>
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 1, bgcolor: "#e8f5e9" }}>
            <Typography variant="body2" fontWeight={600}>{maint}</Typography>
            <Typography variant="caption" color="text.secondary">I-2</Typography>
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 1, bgcolor: "#fff3e0" }}>
            <Typography variant="body2" fontWeight={600} color="red">{removed}</Typography>
            <Typography variant="caption" color="text.secondary">I-3</Typography>
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 1, bgcolor: "#e1f5fe" }}>
            <Typography variant="body2" fontWeight={600}>{active}</Typography>
            <Typography variant="caption" color="text.secondary">Active</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ClientCard;
