import PropTypes from 'prop-types';
import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Iconify from 'src/components/iconify/index.js';
import { shortDateLabel } from '../../../components/custom-date-range-picker/index.js';

// ----------------------------------------------------------------------

export default function DayBookTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}) {
  const handleRemoveKeyword = useCallback(() => {
    onFilters('name', '');
  }, [onFilters]);

  const handleRemoveCategory = useCallback(() => {
    onFilters('category', '');
  }, [onFilters]);

  const handleRemoveStatus = useCallback(() => {
    onFilters('status', '');
  }, [onFilters]);

  const shortLabel = shortDateLabel(filters.startDate, filters.endDate);
  const handleRemoveDate = useCallback(() => {
    onFilters('startDate', null);
    onFilters('endDate', null);
  }, [onFilters]);

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>
      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.startDate && filters.endDate && (
          <Block label="Date:">
            <Chip size="small" label={shortLabel} onDelete={handleRemoveDate} />
          </Block>
        )}
        {!!filters.name && (
          <Block label="key word:">
            <Chip label={filters.name} size="small" onDelete={handleRemoveKeyword} />
          </Block>
        )}
        {!!filters.category && (
          <Block label="Category:">
            <Chip label={filters.category} size="small" onDelete={handleRemoveCategory} />
          </Block>
        )}{' '}
        {!!filters.status && (
          <Block label="Type:">
            <Chip label={filters.status} size="small" onDelete={handleRemoveStatus} />
          </Block>
        )}
        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

DayBookTableFiltersResult.propTypes = {
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
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>
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
