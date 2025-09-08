import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import Iconify from '../iconify';

// ----------------------------------------------------------------------

export default function InvoiceDialog({ open, onClose, invoiceFiles = [], title = 'Invoice' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : invoiceFiles.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < invoiceFiles.length - 1 ? prev + 1 : 0));
  };

  const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    return 'unknown';
  };

  const renderFileContent = () => {
    if (invoiceFiles.length === 0) return null;

    const currentFile = invoiceFiles[currentIndex];
    const fileType = getFileType(currentFile);

    if (fileType === 'pdf') {
      return (
        <Box
          sx={{
            width: '100%',
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <iframe
            src={currentFile}
            width="100%"
            height="100%"
            style={{ border: 'none', borderRadius: '8px' }}
            title={`PDF ${currentIndex + 1}`}
          />
        </Box>
      );
    }

    if (fileType === 'image') {
      return (
        <Box
          sx={{
            width: '100%',
            height: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={currentFile}
            alt={`Invoice ${currentIndex + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </Box>
      );
    }

    return (
      <Box
        sx={{
          width: '100%',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Iconify icon="eva:file-outline" width={64} height={64} />
        <Typography variant="h6">Unsupported file type</Typography>
        <Button
          variant="outlined"
          onClick={() => window.open(currentFile, '_blank')}
          startIcon={<Iconify icon="eva:download-outline" />}
        >
          Download File
        </Button>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '80vh',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{title}</Typography>
          {invoiceFiles.length > 1 && (
            <Typography variant="body2" color="text.secondary">
              {currentIndex + 1} of {invoiceFiles.length}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {invoiceFiles.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'background.neutral',
                },
              }}
            >
              <Iconify icon="eva:arrow-left-fill" />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'background.neutral',
                },
              }}
            >
              <Iconify icon="eva:arrow-right-fill" />
            </IconButton>
          </>
        )}

        <Box sx={{ p: 3 }}>
          {renderFileContent()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => window.open(invoiceFiles[currentIndex], '_blank')}
            startIcon={<Iconify icon="eva:download-outline" />}
          >
            Download
          </Button>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

InvoiceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  invoiceFiles: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
};
