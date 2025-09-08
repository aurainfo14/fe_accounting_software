import * as Yup from 'yup';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useRouter } from 'src/routes/hooks/index.js';
import { useSnackbar } from 'src/components/snackbar/index.js';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form/index.js';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { Button, Dialog, IconButton, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import RhfDatePicker from '../../../components/hook-form/rhf-date-picker.jsx';
import Iconify from '../../../components/iconify/index.js';
import { UploadBox } from '../../../components/upload/index.js';
import { paths } from 'src/routes/paths.js';
import { createNote, updateNote, removeInvoice } from '../../../api/notes.js';
import { useGetBranch } from '../../../api/branch.js';

// ----------------------------------------------------------------------

export default function NotesNewEditForm({ currentNote }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(currentNote?.invoice || []);
  const storedBranch = sessionStorage.getItem('selectedBranch');

  const NewSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    date: Yup.date().typeError('Please enter a valid date').required('Date is required'),
    branch: Yup.object().when(['isBranchUser'], {
      is: (isBranchUser) => !isBranchUser && storedBranch === 'all',
      then: (schema) => schema.required('Branch is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentNote?.title || '',
      description: currentNote?.description || '',
      date: currentNote?.date ? new Date(currentNote.date) : new Date(),
      branch: currentNote?.branch
        ? { label: currentNote.branch?.branchName || currentNote.branch?.name, value: currentNote?.branch?._id }
        : null,
      isBranchUser: user?.role === 'ADMIN',
    }),
    [currentNote, user?.role]
  );

  useEffect(() => {
    if (currentNote) {
      setExistingFiles(currentNote?.invoice);
    }
  }, [currentNote]);

  const methods = useForm({
    resolver: yupResolver(NewSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentNote) {
      reset(defaultValues);
    }
  }, [currentNote, defaultValues, reset]);

  useEffect(() => {
    setValue('isBranchUser', user?.role === 'ADMIN');
    if (user?.role !== 'ADMIN') {
      setValue('branch', null);
    }
  }, [user?.role, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Form data:', data);
      console.log('Stored branch:', storedBranch);
      console.log('Files:', files);

      // Handle branch selection
      let branchId = null;
      if (data.branch && data.branch.value) {
        branchId = data.branch.value;
      } else if (storedBranch && storedBranch !== 'all') {
        try {
          const parsedBranch = JSON.parse(storedBranch);
          branchId = parsedBranch;
        } catch {
          branchId = storedBranch;
        }
      }

      const noteData = {
        title: data.title,
        description: data.description,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        branchId: branchId,
        invoice: files,
      };

      console.log('Note data to send:', noteData);

      if (currentNote) {
        await updateNote(currentNote._id, noteData, user);
        enqueueSnackbar('Note updated successfully');
      } else {
        await createNote(noteData, user);
        enqueueSnackbar('Note created successfully');
      }

      router.push(paths.dashboard.accounting.notes.list);
    } catch (error) {
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      enqueueSnackbar(`Error saving note: ${error.response?.data?.message || error.message}`, { variant: 'error' });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    },
    []
  );

  const handleRemoveFile = (fileToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };

  const handleRemoveExistingFile = async (invoiceUrl) => {
    try {
      if (currentNote && currentNote._id) {
        // Extract filename from the URL

        await removeInvoice(currentNote._id, invoiceUrl, user);
        enqueueSnackbar('Invoice file removed successfully');
      }

      setExistingFiles((prevFiles) => prevFiles.filter((file) => file !== invoiceUrl));
    } catch (error) {
      console.error('Error removing invoice file:', error);
      enqueueSnackbar(`Error removing invoice file: ${error.response?.data?.message || error.message}`, { variant: 'error' });
    }
  };


  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Note Details
            </Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              {user?.role === 'ADMIN' && branch && storedBranch === 'all' && (
                <RHFAutocomplete
                  name="branch"
                  req={'red'}
                  label="Branch"
                  placeholder="Choose a Branch"
                  options={
                    branch?.map((branchItem) => ({
                      label: branchItem?.name,
                      value: branchItem?._id,
                    })) || []
                  }
                  isOptionEqualToValue={(option, value) => option?.value === value?.value}
                />
              )}

              <RHFTextField name="title" label="Title" req={'red'}/>

              <RhfDatePicker name="date" label="Date" req={'red'}/>

              <RHFTextField
                name="description"
                label="Description"
                req={'red'}
                multiline
                rows={4}
                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Invoice Files
            </Typography>

            <Stack spacing={2}>
              <UploadBox
                onDrop={handleDrop}
                accept={{
                  'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
                  'application/pdf': ['.pdf'],
                  'application/msword': ['.doc'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                }}
                maxFiles={5}
                maxSize={5242880} // 5MB
              />

              {files.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    New Files:
                  </Typography>
                  <Stack spacing={1}>
                    {files.map((file, index) => (
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
                        <Typography variant="body2" sx={{ flex: 1, mr: 1, fontSize: '12px' }}>
                          {file.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(file)}
                          color="error"
                          sx={{ p: 0.5 }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold-duotone" width={16} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {existingFiles.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Existing Files:
                  </Typography>
                  <Stack spacing={1}>
                    {existingFiles.map((file, index) => (
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
                        <Typography
                          variant="body2"
                          sx={{
                            flex: 1,
                            mr: 1,
                            fontSize: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {file}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveExistingFile(file)}
                          color="error"
                          sx={{ p: 0.5 }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold-duotone" width={16} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
        <Button
        color="inherit"
              sx={{ margin: '0px 10px', height: '36px' }}
              variant="outlined"
              onClick={() => reset()}
        >
          Reset
        </Button>

        <LoadingButton
        type="submit" variant="contained"
          loading={isSubmitting}
        >
          Submit
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

NotesNewEditForm.propTypes = {
  currentNote: PropTypes.object,
};
