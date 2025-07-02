import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
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
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  Grid,
  Menu,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { PDFViewer } from '@react-pdf/renderer';
import BankAccountPdf from './view/bank-account-pdf.jsx';
import { useBoolean } from '../../../hooks/use-boolean.js';
import Autocomplete from '@mui/material/Autocomplete';

export default function BankAccountTableToolbar({
  filters,
  onFilters,
  schemes,
  dateError,
  accountDetails,
  options,
  onTransferTypeSelect,
  bankData,
}) {
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const view = useBoolean();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    category: filters.category,
    status: filters.status,
    bank: filters.account.bankName,
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTransferTypeSelect = (value) => {
    onTransferTypeSelect(value);
    handleMenuClose();
  };

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      if (!newValue) {
        onFilters('startDate', null);
        return;
      }
      const date = moment(newValue);
      onFilters('startDate', date.isValid() ? date.toDate() : null);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      if (!newValue) {
        onFilters('endDate', null);
        return;
      }
      const date = moment(newValue);
      onFilters('endDate', date.isValid() ? date.toDate() : null);
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

  const bankAccountInfo = [
    { label: 'Bank Name', value: filters.account.bankName },
    { label: 'Account Number', value: filters.account.accountNumber },
    { label: 'Account Holder', value: filters.account.accountHolderName },
    { label: 'Branch', value: filters.account.branchName },
    { label: 'IFSC Code', value: filters.account.IFSC },
  ];

  return (
    <>
      <Box sx={{ p: isMobile ? 1.5 : 2.5, pb: 0 }}>
        {isMobile ? (
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: showBankDetails ? 1 : 0,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Bank Account Details
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowBankDetails(!showBankDetails)}
                  sx={{ ml: 1 }}
                >
                  <Iconify
                    icon={showBankDetails ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
                  />
                </IconButton>
              </Box>
              <Collapse in={showBankDetails}>
                <Grid container spacing={1}>
                  {bankAccountInfo.map((info) => (
                    <Grid item xs={12} sm={6} key={info.label}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}
                      >
                        {info.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {info.value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Collapse>
              {!showBankDetails && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {filters.account.bankName} - {filters.account.accountNumber}
                </Typography>
              )}
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexDirection: isTablet ? 'column' : 'row',
              gap: isTablet ? 2 : 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: isTablet ? 'row' : 'column',
                gap: isTablet ? 4 : 0,
              }}
            >
              <Box>
                {bankAccountInfo.slice(0, 3).map((info) => (
                  <Typography
                    key={info.label}
                    sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, mb: 0.5 }}
                    component="p"
                  >
                    {info.label}: {info.value}
                  </Typography>
                ))}
              </Box>
              {!isTablet && (
                <Box>
                  {bankAccountInfo.slice(3).map((info) => (
                    <Typography
                      key={info.label}
                      sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, mb: 0.5 }}
                      component="p"
                    >
                      {info.label}: {info.value}
                    </Typography>
                  ))}
                </Box>
              )}
              {isTablet && (
                <Box>
                  {bankAccountInfo.slice(3).map((info) => (
                    <Typography
                      key={info.label}
                      sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, mb: 0.5 }}
                      component="p"
                    >
                      {info.label}: {info.value}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
            <Box sx={{ mt: isTablet ? 0 : 0 }}>
              <Button
                variant="contained"
                onClick={handleMenuOpen}
                sx={{
                  height: 40,
                  minWidth: isTablet ? 200 : 'auto',
                  width: isTablet ? '100%' : 'auto',
                }}
                endIcon={<Iconify icon="eva:chevron-down-fill" />}
              >
                Transfer Type
              </Button>
            </Box>
          </Box>
        )}
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleMenuOpen}
              fullWidth
              sx={{ height: 48 }}
              endIcon={<Iconify icon="eva:chevron-down-fill" />}
            >
              Transfer Type
            </Button>
          </Box>
        )}
      </Box>
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
                  options={['Payment In', 'Payment Out']}
                  value={filters.category || null}
                  onChange={(event, newValue) => {
                    onFilters('category', newValue || '');
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Category" sx={getInputStyles()} />
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
                    <TextField {...params} label="Type" sx={getInputStyles()} />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={6}>
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
              <Grid item xs={6} sm={6}>
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
                options={['Payment In', 'Payment Out']}
                value={filters.category || null}
                onChange={(event, newValue) => {
                  onFilters('category', newValue || '');
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Category" sx={getInputStyles()} />
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: isMobile ? 280 : 250,
          },
        }}
      >
        <MenuItem onClick={() => handleTransferTypeSelect('Bank To Bank')}>
          <Iconify icon="mdi:bank-transfer" width={20} sx={{ mr: 1 }} />
          Bank To Bank Transfer
        </MenuItem>
        <MenuItem onClick={() => handleTransferTypeSelect('Bank To Cash')}>
          <Iconify icon="mdi:bank-transfer-out" width={20} sx={{ mr: 1 }} />
          Bank To Cash Transfer
        </MenuItem>
        <MenuItem onClick={() => handleTransferTypeSelect('Cash To Bank')}>
          <Iconify icon="mdi:bank-transfer-in" width={20} sx={{ mr: 1 }} />
          Cash To Bank Transfer
        </MenuItem>
        <MenuItem onClick={() => handleTransferTypeSelect('Adjust Bank Balance')}>
          <Iconify icon="mdi:bank-check" width={20} sx={{ mr: 1 }} />
          Adjust Bank Balance
        </MenuItem>
      </Menu>
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
              <BankAccountPdf bankData={bankData} configs={configs} filterData={filterData} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

BankAccountTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  schemes: PropTypes.array,
  dateError: PropTypes.bool,
  accountDetails: PropTypes.object,
  options: PropTypes.array,
  onTransferTypeSelect: PropTypes.func,
  bankData: PropTypes.array,
};
