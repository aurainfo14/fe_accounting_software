import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
import { ConfirmDialog } from 'src/components/custom-dialog/index.js';
import CustomPopover, { usePopover } from 'src/components/custom-popover/index.js';
import { fDate } from '../../../utils/format-time.js';
import Lightbox, { useLightBox } from '../../../components/lightbox/index.js';
import React from 'react';

// ----------------------------------------------------------------------

export default function IncomeTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const confirm = useBoolean();
  const popover = usePopover();

  const lightbox = useLightBox(row.invoice);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.srNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.incomeType}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.desc || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.date)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentDetail?.cashAmount || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentDetail?.bankAmount || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row?.paymentDetail?.account?.bankName && row?.paymentDetail?.account?.accountHolderName
            ? `${row.paymentDetail.account.bankName} (${row.paymentDetail.account.accountHolderName})`
            : '-'}
        </TableCell>
        {row.invoice ? (
          <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => lightbox.onOpen(row.invoice)} sx={{ mr: 2 }}>
              <Iconify icon="tabler:file-invoice" width="24" height="24" />
            </IconButton>
            <Lightbox image={row.invoice} open={lightbox.open} close={lightbox.onClose} />
          </TableCell>
        ) : (
          <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>-</TableCell>
        )}
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
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

IncomeTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
