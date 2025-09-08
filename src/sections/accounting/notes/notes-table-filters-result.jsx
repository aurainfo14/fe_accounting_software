import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function NotesTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}) {
  const handleRemoveKeyword = () => {
    onFilters('name', '');
  };

  const handleRemoveStartDate = () => {
    onFilters('startDate', null);
  };

  const handleRemoveEndDate = () => {
    onFilters('endDate', null);
  };

  const handleRemoveBranch = () => {
    onFilters('branch', {});
  };
console.log(filters.branch,"filters.branch");
  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      
          <Button
            color="error"
            size="small"
            onClick={onResetFilters}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold-duotone" />}
          >
            Clear
          </Button>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {!!filters.name && (
          <Block label="Title/Description:">
            <Chip
              size="small"
              label={filters.name}
              onDelete={handleRemoveKeyword}
              deleteIcon={
                <Iconify icon="solar:close-circle-bold" width={16} height={16} />
              }
            />
          </Block>
        )}

        {!!filters.startDate && (
          <Block label="Start Date:">
            <Chip
              size="small"
              label={fDate(filters.startDate)}
              onDelete={handleRemoveStartDate}
              deleteIcon={
                <Iconify icon="solar:close-circle-bold" width={16} height={16} />
              }
            />
          </Block>
        )}

        {!!filters.endDate && (
          <Block label="End Date:">
            <Chip
              size="small"
              label={fDate(filters.endDate)}
              onDelete={handleRemoveEndDate}
              deleteIcon={
                <Iconify icon="solar:close-circle-bold" width={16} height={16} />
              }
            />
          </Block>
        )}

        {!!filters.branch?.value && (
          <Block label="Branch:">
            <Chip
              size="small"
              label={filters.branch.label}
              onDelete={handleRemoveBranch}
              deleteIcon={
                <Iconify icon="solar:close-circle-bold" width={16} height={16} />
              }
            />
          </Block>
        )}
      </Stack>
    </Stack>
  );
}

NotesTableFiltersResult.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
  results: PropTypes.number,
};

// ----------------------------------------------------------------------

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ typography: 'subtitle2' }}>{label}</Box>
      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}

Block.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  sx: PropTypes.object,
};
