import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
import { ConfirmDialog } from 'src/components/custom-dialog/index.js';
import CustomPopover, { usePopover } from 'src/components/custom-popover/index.js';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { fDate } from '../../../utils/format-time.js';
import InvoiceDialog from '../../../components/invoice-dialog/index.js';
import NoteDetailsModal from '../../../components/note-details-modal/index.js';
import React from 'react';
import { useSnackbar } from 'src/components/snackbar/index.js';

// ----------------------------------------------------------------------

export default function NotesTableRow({ row, onEditRow, onDeleteRow, onViewRow }) {
  const confirm = useBoolean();
  const popover = usePopover();
  const invoiceDialog = useBoolean();
  const noteDetailsModal = useBoolean();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();


  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
          <Box
            sx={{
              cursor: 'pointer',
              color: '#000',
              fontWeight:'bold',
            }}
            onClick={() => noteDetailsModal.onTrue()}
          >
            {row?.title || '-'}
          </Box>
        </TableCell>
        <TableCell sx={{ maxWidth: 200 }}>
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {row.description || '-'}
          </Box>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row?.date ? fDate(row.date) : '-'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row?.branch?.branchName || row?.branch?.name || '-'}
        </TableCell>
        <TableCell>
  {row.invoice && row.invoice.length > 0 ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.7
            }
          }} 
          onClick={() => invoiceDialog.onTrue()}
        >
          <IconButton
            size="small"
            title={`View Invoice`}
            sx={{ p: 0.5 }}
          >
            <Iconify icon="tabler:eye" width={14} height={14} />
          </IconButton>
          View Invoice
        </Box>

    </Box>
  ) : (
    <Box sx={{ color: 'text.disabled' }}>-</Box>
  )}
</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold-duotone" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold-duotone" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
      <InvoiceDialog
        open={invoiceDialog.value}
        onClose={invoiceDialog.onFalse}
        invoiceFiles={row.invoice || []}
        title={`Invoice - ${row.title || 'Untitled'}`}
      />

      <NoteDetailsModal
        open={noteDetailsModal.value}
        onClose={noteDetailsModal.onFalse}
        note={row}
      />
    </>
  );
}

NotesTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
};
