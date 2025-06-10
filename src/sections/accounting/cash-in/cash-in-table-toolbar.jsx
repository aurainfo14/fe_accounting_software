import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify/index.js';
import CustomPopover, { usePopover } from 'src/components/custom-popover/index.js';
// import RHFExportExcel from '../../../components/hook-form/rhf-export-excel.jsx';
// import { getResponsibilityValue } from '../../../permission/permission.js';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../api/config.js';
import moment from 'moment/moment.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, Dialog, DialogActions, FormControl, useMediaQuery, useTheme, Grid } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Button from '@mui/material/Button';
import { PDFViewer } from '@react-pdf/renderer';
import { useBoolean } from '../../../hooks/use-boolean.js';
import CashInPdf from './view/cash-in-pdf.jsx';
import Autocomplete from '@mui/material/Autocomplete';

// ----------------------------------------------------------------------

export default function CashInTableToolbar({
                                             filters,
                                             onFilters,
                                             schemes,
                                             dateError,
                                             options,
                                             cashData,
                                             totalAmount,
                                           }) {
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const view = useBoolean();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    category: filters.category,
    status: filters.status,
  };

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        onFilters('startDate', null);
        return;
      }
      const date = moment(newValue);
      if (date.isValid()) {
        onFilters('startDate', date.toDate());
      } else {
        console.warn('Invalid date selected');
        onFilters('startDate', null);
      }
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        onFilters('endDate', null);
        return;
      }
      const date = moment(newValue);
      if (date.isValid()) {
        onFilters('endDate', date.toDate());
      } else {
        console.warn('Invalid date selected');
        onFilters('endDate', null);
      }
    },
    [onFilters]
  );

  const handleFilterCategory = useCallback(
    (event) => {
      onFilters('category', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event) => {
      onFilters('status', event.target.value);
    },
    [onFilters]
  );

  // Responsive styles
  const getInputStyles = () => ({
    input: { height: isMobile ? 10 : 7 },
    label: {
      mt: -0.8,
      fontSize: isMobile ? '16px' : '14px',
    },
    '& .MuiInputLabel-shrink': {
      mt: 0,
    },
  });

  const getDatePickerStyles = () => ({
    maxWidth: isMobile ? '100%' : { md: 150 },
    label: {
      mt: -0.8,
      fontSize: isMobile ? '16px' : '14px',
    },
    '& .MuiInputLabel-shrink': {
      mt: 0,
    },
    input: { height: isMobile ? 10 : 7 },
  });

  return (
    <>
      <Box
        sx={{
          p: isMobile ? 1.5 : 2.5,
        }}
      >
        {/* Mobile Layout */}
        {isMobile ? (
          <Stack spacing={2}>
            {/* Search Bar - Full width on mobile */}
            <TextField
              sx={getInputStyles()}
              fullWidth
              value={filters.name}
              onChange={handleFilterName}
              placeholder="Search..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Filters Grid - 2 columns on mobile */}
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={['Payment In', 'Payment Out']}
                  value={filters.category || null}
                  onChange={(event, newValue) => {
                    onFilters('category', newValue || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      sx={getInputStyles()}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={options}
                  value={filters.status || null}
                  onChange={(event, newValue) => {
                    onFilters('status', newValue || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Type"
                      sx={getInputStyles()}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start date"
                  value={filters.startDate ? moment(filters.startDate).toDate() : null}
                  open={startDateOpen}
                  onClose={() => setStartDateOpen(false)}
                  onChange={handleFilterStartDate}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      onClick: () => setStartDateOpen(true),
                      fullWidth: true,
                    },
                  }}
                  sx={getDatePickerStyles()}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End date"
                  value={filters.endDate}
                  open={endDateOpen}
                  onClose={() => setEndDateOpen(false)}
                  onChange={handleFilterEndDate}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      onClick: () => setEndDateOpen(true),
                      fullWidth: true,
                      error: dateError,
                      helperText: dateError && 'End date must be later than start date',
                    },
                  }}
                  sx={getDatePickerStyles()}
                />
              </Grid>
            </Grid>

            {/* Action Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                onClick={popover.onOpen}
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </Box>
          </Stack>
        ) : (
          /* Desktop/Tablet Layout */
          <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{
              xs: 'column',
              md: 'row',
            }}
          >
            <Stack
              direction={isTablet ? 'column' : 'row'}
              alignItems="center"
              spacing={2}
              flexGrow={1}
              sx={{ width: 1 }}
            >
              <TextField
                sx={getInputStyles()}
                fullWidth
                value={filters.name}
                onChange={handleFilterName}
                placeholder="Search..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Autocomplete
                fullWidth
                options={['Payment In', 'Payment Out']}
                value={filters.category || null}
                onChange={(event, newValue) => {
                  onFilters('category', newValue || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    sx={getInputStyles()}
                  />
                )}
              />

              <Autocomplete
                fullWidth
                options={options}
                value={filters.status || null}
                onChange={(event, newValue) => {
                  onFilters('status', newValue || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Type"
                    sx={getInputStyles()}
                  />
                )}
              />

              <DatePicker
                label="Start date"
                value={filters.startDate ? moment(filters.startDate).toDate() : null}
                open={startDateOpen}
                onClose={() => setStartDateOpen(false)}
                onChange={handleFilterStartDate}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    onClick: () => setStartDateOpen(true),
                    fullWidth: true,
                  },
                }}
                sx={getDatePickerStyles()}
              />

              <DatePicker
                label="End date"
                value={filters.endDate}
                open={endDateOpen}
                onClose={() => setEndDateOpen(false)}
                onChange={handleFilterEndDate}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    onClick: () => setEndDateOpen(true),
                    fullWidth: true,
                    error: dateError,
                    helperText: dateError && 'End date must be later than start date',
                  },
                }}
                sx={getDatePickerStyles()}
              />
            </Stack>

            <IconButton onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
        )}
      </Box>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 'auto' }}
      >
        {/*{getResponsibilityValue('print_scheme_detail', configs, user) && (*/}
        <>
          <MenuItem
            onClick={() => {
              view.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:printer-minimalistic-bold" />
            Print
          </MenuItem>
          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="ant-design:file-pdf-filled" />
            PDF
          </MenuItem>
          {/*<MenuItem>*/}
          {/*  <RHFExportExcel data={schemes} fileName="SchemeData" sheetName="SchemeDetails" />*/}
          {/*</MenuItem>*/}
        </>
        {/*// )}*/}
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="ic:round-whatsapp" />
          WhatsApp Share
        </MenuItem>
      </CustomPopover>

      {/* Responsive PDF Dialog */}
      <Dialog fullScreen open={view.value} onClose={view.onFalse}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions sx={{ p: 1.5 }}>
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Close
            </Button>
          </DialogActions>
          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <CashInPdf cashData={cashData} configs={configs} filterData={filterData} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

CashInTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  schemes: PropTypes.array,
  dateError: PropTypes.bool,
  options: PropTypes.array,
  cashData: PropTypes.array,
  totalAmount: PropTypes.number,
};
