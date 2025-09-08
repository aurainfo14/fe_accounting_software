import PropTypes from 'prop-types';
import { useCallback } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PDFViewer } from '@react-pdf/renderer';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useBoolean } from 'src/hooks/use-boolean';
import { fDate } from 'src/utils/format-time';
import NotesPdf from './view/notes-pdf';
import { useGetBranch } from 'src/api/branch';
// ----------------------------------------------------------------------

export default function NotesTableToolbar({
  filters,
  onFilters,
  canReset,
  onResetFilters,
  options,
  notesData,
}) {
  const popover = usePopover();
  const open = useBoolean();
  const view = useBoolean();
  const { branch } = useGetBranch();

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      onFilters('startDate', newValue);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      onFilters('endDate', newValue);
    },
    [onFilters]
  );

  const handleFilterBranch = useCallback(
    (event) => {
      const selectedValue = event.target.value;
      if (selectedValue === 'all') {
        onFilters('branch', { label: 'All Branches', value: 'all' });
      } else {
        const selectedBranch = branch.find(option => option._id === selectedValue);
        onFilters('branch', { label: selectedBranch?.name, value: selectedBranch?._id });
      }
    },
    [onFilters, branch]
  );
  return (
    <>
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Search title or description..."
          sx={{ minWidth: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            size="small"
            label="Start Date"
            value={filters.startDate}
            onChange={handleFilterStartDate}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 140 },
              },
            }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            size="small"
            label="End Date"
            value={filters.endDate}
            onChange={handleFilterEndDate}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 140 },
              },
            }}
          />
        </LocalizationProvider>

        <TextField
          size="small"
          select
          label="Branch"
          value={filters.branch?.value || 'all'}
          onChange={handleFilterBranch}
          sx={{ minWidth: 160 }}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            },
          }}
        >
          <MenuItem value="all">
            <Box component="span" sx={{ ml: 1, color: 'text.secondary' }}>
              All Branches
            </Box>
          </MenuItem>
          {branch.map((option) => (
            <MenuItem key={option.name} value={option._id}>
              {option?.name}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ flexGrow: 1 }} />

        

        {/* <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton> */}
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
              <NotesPdf notesData={notesData} filterData={filters} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

NotesTableToolbar.propTypes = {
  canReset: PropTypes.bool,
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
  options: PropTypes.array,
  notesData: PropTypes.array,
};
