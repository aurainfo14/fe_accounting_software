import PropTypes from 'prop-types';
import { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify/index.js';
import CustomPopover, { usePopover } from 'src/components/custom-popover/index.js';
import { useAuthContext } from '../../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../../api/config.js';

// ----------------------------------------------------------------------

export default function AccountsToolbar({ filters, onFilters }) {
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            sx={{ input: { height: 7 } }}
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
        </Stack>
        {/*<IconButton onClick={popover.onOpen}>*/}
        {/*  <Iconify icon="eva:more-vertical-fill" />*/}
        {/*</IconButton>*/}
      </Stack>
      {/*<CustomPopover*/}
      {/*  open={popover.open}*/}
      {/*  onClose={popover.onClose}*/}
      {/*  arrow="right-top"*/}
      {/*  sx={{ width: 'auto' }}*/}
      {/*>*/}
      {/*  {getResponsibilityValue('print_scheme_detail', configs, user) && (*/}
      {/*    <>*/}
      {/*      <MenuItem*/}
      {/*        onClick={() => {*/}
      {/*          popover.onClose();*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        <Iconify icon="solar:printer-minimalistic-bold" />*/}
      {/*        Print*/}
      {/*      </MenuItem>*/}
      {/*      <MenuItem*/}
      {/*        onClick={() => {*/}
      {/*          popover.onClose();*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        <Iconify icon="ant-design:file-pdf-filled" />*/}
      {/*        PDF*/}
      {/*      </MenuItem>*/}
      {/*      <MenuItem>*/}
      {/*        <RHFExportExcel data={schemes} fileName="SchemeData" sheetName="SchemeDetails" />*/}
      {/*      </MenuItem>*/}
      {/*    </>*/}
      {/*  )}*/}
      {/*  <MenuItem*/}
      {/*    onClick={() => {*/}
      {/*      popover.onClose();*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Iconify icon="ic:round-whatsapp" />*/}
      {/*    whatsapp share*/}
      {/*  </MenuItem>*/}
      {/*</CustomPopover>*/}
    </>
  );
}

AccountsToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
};
