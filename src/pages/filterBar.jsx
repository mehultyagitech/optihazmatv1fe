import React from "react";
import PropTypes from "prop-types";
import { Button, MenuItem, Select, FormControl, InputLabel, Box, Grid } from "@mui/material";
import "../App.css";
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterListIcon from '@mui/icons-material/FilterList';

const FilterBar = ({ filters, onFilterChange, onSearch }) => {
    return (
        <Box className="filter-bar" display="flex" justifyContent="space-between" alignItems="center" gap={2} flexDirection={{ xs: 'column', sm: 'row' }} sx={{  }}>
            {/* Left-aligned Vessel List button */}
            <Button
                variant="outlined"
                color="primary"
                className="vessel-list-btn"
                startIcon={<DownloadIcon />}
                sx={{
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: { xs: '96%', sm: 'auto' },
                    whiteSpace: 'nowrap'
                }}
            >
                Vessel List
            </Button>


            {/* Right-aligned filters and search button */}
            <Grid container spacing={2} alignItems="center" justifyContent="flex-end" sx={{ width: '100%' }}>
                {filters.map((filter, index) => (
                    <Grid item xs={12} sm="auto" key={index}>
                        <FormControl variant="outlined" size="small" className="filter-select" fullWidth>
                            <InputLabel>{filter.placeholder}</InputLabel>
                            <Select
                                value={filter.value}
                                onChange={(e) => onFilterChange(filter.name, e.target.value)}
                                label={filter.placeholder}
                                startIcon={<FilterListIcon />}
                                sx={{ minWidth: 150 }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {filter.options.map((option, idx) => (
                                    <MenuItem key={idx} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                ))}
                <Grid item xs={12} sm="auto">
                    <Button variant="contained" color="primary" className="search-btn" onClick={onSearch} startIcon={<FilterAltIcon />} sx={{ width: { xs: '100%', sm: 'auto' },borderRadius: 1,boxShadow: '0px 4px 10px rgba(37, 123, 251, 0.5)' }}>
                        Search
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

FilterBar.propTypes = {
    filters: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            value: PropTypes.string,
            placeholder: PropTypes.string.isRequired,
            options: PropTypes.arrayOf(
                PropTypes.shape({
                    label: PropTypes.string.isRequired,
                    value: PropTypes.string.isRequired,
                })
            ).isRequired,
        })
    ).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
};

export default FilterBar;
