import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
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
import { Box, Dialog, FormControl, Typography, Autocomplete, useTheme, useMediaQuery, Grid } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import PartyNewEditForm from './parties/party-new-edit-form.jsx';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { PDFViewer } from '@react-pdf/renderer';
import { useBoolean } from '../../../hooks/use-boolean.js';
import PaymentInOutPdf from './view/payment-in-out-pdf.jsx';

export default function PaymentInOutTableToolbar({
  filters,
  onFilters,
  schemes,
  dateError,
  partyDetails,
  mutate,
  options,
  paymentData,
  party,
}) {
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const view = useBoolean();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    category: filters.category,
    party: filters?.party?.name,
    transactions:
      filters?.transactions?.bankName && filters?.transactions?.accountHolderName
        ? `${filters.transactions.bankName} (${filters.transactions.accountHolderName})`
        : filters?.transactions?.transactionsType || '-',
  };

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      const date = moment(newValue);
      if (!newValue || !date.isValid()) {
        onFilters('startDate', null);
      } else {
        onFilters('startDate', date.toDate());
      }
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      const date = moment(newValue);
      if (!newValue || !date.isValid()) {
        onFilters('endDate', null);
      } else {
        onFilters('endDate', date.toDate());
      }
    },
    [onFilters]
  );

  const handleFilterCategory = useCallback(
    (event, newValue) => {
      onFilters('category', newValue);
    },
    [onFilters]
  );

  const handleFilterTransactions = useCallback(
    (event, newValue) => {
      onFilters('transactions', newValue);
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
      <Box sx={{ p: isMobile ? 1.5 : 2.5 }}>
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: isMobile ? '1rem' : '1.25rem',
            fontWeight: 600
          }}
          variant="subtitle1"
        >
          {partyDetails?.name}
        </Typography>
      </Box>

      <Box sx={{ p: isMobile ? 1.5 : 2.5 }}>
        {isMobile ? (
          /* Mobile Layout */
          <Stack spacing={2}>
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

            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={options || []}
                  getOptionLabel={(option) =>
                    option.bankName && option.accountHolderName
                      ? `${option.bankName} (${option.accountHolderName})`
                      : option.transactionsType || 'Unnamed Account'
                  }
                  value={filters.transactions || null}
                  onChange={handleFilterTransactions}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cash & Bank Transactions"
                      sx={getInputStyles()}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={['Payment In', 'Payment Out']}
                  value={filters.category || null}
                  onChange={handleFilterCategory}
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                onClick={popover.onOpen}
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
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
            direction={{ xs: 'column', md: 'row' }}
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
                options={options || []}
                getOptionLabel={(option) =>
                  option.bankName && option.accountHolderName
                    ? `${option.bankName} (${option.accountHolderName})`
                    : option.transactionsType || 'Unnamed Account'
                }
                value={filters.transactions || null}
                onChange={handleFilterTransactions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cash & Bank Transactions"
                    sx={getInputStyles()}
                  />
                )}
              />

              <Autocomplete
                fullWidth
                options={['Payment In', 'Payment Out']}
                value={filters.category || null}
                onChange={handleFilterCategory}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
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
        <MenuItem
          onClick={() => {
            view.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="mdi:printer" />
          Print
        </MenuItem>
        <MenuItem onClick={popover.onClose}>
          <Iconify icon="ic:round-whatsapp" />
          whatsapp share
        </MenuItem>
      </CustomPopover>

      <Dialog fullScreen open={view.value} onClose={view.onFalse}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions sx={{ p: 1.5 }}>
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Close
            </Button>
          </DialogActions>
          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <PaymentInOutPdf
                paymentData={paymentData}
                configs={configs}
                filterData={filterData}
                party={party}
              />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

PaymentInOutTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  schemes: PropTypes.array,
  dateError: PropTypes.bool,
  partyDetails: PropTypes.object,
  mutate: PropTypes.func,
  options: PropTypes.array,
  paymentData: PropTypes.array,
  party: PropTypes.object,
};
