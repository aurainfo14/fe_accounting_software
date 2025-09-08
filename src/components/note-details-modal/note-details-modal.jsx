import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import Iconify from '../iconify';
import { fDate } from '../../utils/format-time';

// ----------------------------------------------------------------------

export default function NoteDetailsModal({ open, onClose, note }) {
  if (!note) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Note Details</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Title */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
              Title
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {note.title || '-'}
            </Typography>
          </Box>

          <Divider />

          {/* Description */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {note.description || '-'}
            </Typography>
          </Box>

          <Divider />

          {/* Date */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
              Date
            </Typography>
            <Typography variant="body1">
              {note.date ? fDate(note.date) : '-'}
            </Typography>
          </Box>

          <Divider />

          {/* Branch */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
              Branch
            </Typography>
            {note.branch ? (
              <Chip
                label={note.branch.branchName || note.branch.name || '-'}
                color="primary"
                variant="outlined"
                size="small"
              />
            ) : (
              <Typography variant="body1">-</Typography>
            )}
          </Box>

          <Divider />

          {/* Invoice Files */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
              Invoice Files
            </Typography>
            {note.invoice && note.invoice.length > 0 ? (
              <Stack spacing={1}>
                {note.invoice.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'background.neutral',
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1, mr: 1 }}>
                      {file.split('/').pop() || `File ${index + 1}`}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(file, '_blank')}
                      startIcon={<Iconify icon="eva:download-outline" />}
                    >
                      View
                    </Button>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body1">No invoice files</Typography>
            )}
          </Box>

          <Divider />

          {/* Created/Updated Info */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
              Additional Information
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Created:
                </Typography>
                <Typography variant="body2">
                  {note.createdAt ? fDate(note.createdAt) : '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated:
                </Typography>
                <Typography variant="body2">
                  {note.updatedAt ? fDate(note.updatedAt) : '-'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

NoteDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  note: PropTypes.object,
};
