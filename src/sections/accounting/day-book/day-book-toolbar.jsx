import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify/index.js';
import CustomPopover, { usePopover } from 'src/components/custom-popover/index.js';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../api/config.js';
import moment from 'moment/moment.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Autocomplete, Box, Dialog, Grid, useMediaQuery, useTheme } from '@mui/material';
import { useBoolean } from '../../../hooks/use-boolean.js';
import { PDFViewer } from '@react-pdf/renderer';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DayBookPdf from './view/day-book-pdf.jsx';

// ----------------------------------------------------------------------

export default function DayBookToolbar({
  filters,
  onFilters,
  schemes,
  daybookData,
  options,
  typeOptions,
}) {
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const view = useBoolean();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const filterData = {
    startDate: filters.startDate,
    category: filters.status,
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

  const handleFilterCategory = useCallback(
    (event, value) => {
      onFilters('category', value || '');
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event, value) => {
      onFilters('status', value || '');
    },
    [onFilters]
  );

  const handleFilterTransactions = useCallback(
    (event, value) => {
      onFilters('transactions', value || null);
    },
    [onFilters]
  );

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
        {isMobile ? (
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
                    <TextField {...params} label="Cash & Bank Transactions" sx={getInputStyles()} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={['Payment In', 'Payment Out']}
                  value={filters.category || ''}
                  onChange={handleFilterCategory}
                  renderInput={(params) => (
                    <TextField {...params} label="Category" sx={getInputStyles()} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={typeOptions || []}
                  value={filters.status || ''}
                  onChange={handleFilterStatus}
                  renderInput={(params) => (
                    <TextField {...params} label="Type" sx={getInputStyles()} />
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
                  <TextField {...params} label="Cash & Bank Transactions" sx={getInputStyles()} />
                )}
              />
              <Autocomplete
                fullWidth
                options={['Payment In', 'Payment Out']}
                value={filters.category || ''}
                onChange={handleFilterCategory}
                renderInput={(params) => (
                  <TextField {...params} label="Category" sx={getInputStyles()} />
                )}
              />
              <Autocomplete
                fullWidth
                options={typeOptions || []}
                value={filters.status || ''}
                onChange={handleFilterStatus}
                renderInput={(params) => (
                  <TextField {...params} label="Type" sx={getInputStyles()} />
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
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
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
              <DayBookPdf dayBookData={daybookData} configs={configs} filterData={filterData} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

DayBookToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  schemes: PropTypes.array,
  daybookData: PropTypes.array,
  options: PropTypes.array,
  typeOptions: PropTypes.array,
};
