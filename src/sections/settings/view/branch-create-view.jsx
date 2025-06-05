import React, { useMemo, useState } from 'react';
import { Box, Card, CardHeader, Grid, Typography, IconButton, Divider, Stack } from '@mui/material';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingButton } from '@mui/lab';
import { RHFTextField, RHFAutocomplete, RHFSwitch } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Iconify from 'src/components/iconify';
import countrystatecity from '../../../_mock/map/csc.json';
import { useGetBranch } from '../../../api/branch';
import { useGetConfigs } from '../../../api/config.js';

const validationSchema = yup.object().shape({
  name: yup.string().required('Branch Name is required'),
  email: yup.string().email('Invalid email address').nullable(),
  contact: yup.string().nullable(),
  address: yup.object().shape({
    street: yup.string().required('Street is required'),
    country: yup.string().required('Country is required'),
    state: yup.string().required('State is required'),
    city: yup.string().required('City is required'),
    zipcode: yup.string().required('Zipcode is required'),
  }),
  isActive: yup.boolean(),
  branchCode: yup.string().nullable(),
  series: yup.string().required('Series is required'),
});

export default function BranchCreateView() {
  const { branch, mutate } = useGetBranch();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const { configs, mutate: configMutate } = useGetConfigs();

  const defaultValues = useMemo(
    () => ({
      name: '',
      email: '',
      contact: '',
      series: '',
      address: {
        street: '',
        landmark: '',
        country: '',
        state: '',
        city: '',
        zipcode: '',
      },
      isActive: false,
      branchCode: '',
    }),
    []
  );

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(validationSchema),
  });

  const { reset, handleSubmit, watch, setValue } = methods;

  const onSubmitBranchDetails = async (data) => {
    setLoading(true);

    const payload = {
      company: user?.company,
      name: data.name,
      email: data.email || null,
      series: data.series || null,
      contact: data.contact || null,
      branchCode: data.branchCode || null,
      address: {
        street: data.address.street,
        landmark: data.address.landmark,
        country: data.address.country,
        state: data.address.state,
        city: data.address.city,
        zipcode: data.address.zipcode,
      },
      isActive: data.isActive,
      ...(editingBranch && { branchCode: data.branchCode }),
    };

    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/branch`;

    try {
      if (editingBranch) {
        await axios.put(`${URL}/${editingBranch._id}`, payload);
        enqueueSnackbar('Branch updated successfully', { variant: 'success' });
        mutate();
      } else {
        await axios.post(URL, payload);
        mutate();
        enqueueSnackbar('Branch added successfully', { variant: 'success' });
      }
      await axios.put(`${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`, {
        ...configs,
        headersConfig: {
          ...configs.headersConfig,
          branch: {
            ...configs.headersConfig.branch,
            branchCode: '001',
          },
        },
      });
      configMutate();
      reset(defaultValues);
      setEditingBranch(null);
      setLoading(false);
    } catch (error) {
      console.error('Error updating branch:', error);
      enqueueSnackbar('An error occurred while updating branch', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    reset(branch);
  };

  const handleDeleteBranches = async (ids) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/branch`,
        {
          data: { ids: ids },
        }
      );
      enqueueSnackbar(response.data.message);
      mutate();
    } catch (error) {
      enqueueSnackbar(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkZipcode = async (zipcode) => {
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${zipcode}`);
      const data = response.data[0];

      if (data.Status === 'Success') {
        setValue('address.country', data?.PostOffice[0]?.Country, { shouldValidate: true });
        setValue('address.state', data?.PostOffice[0]?.Circle, { shouldValidate: true });
        setValue('address.city', data?.PostOffice[0]?.District, { shouldValidate: true });
      } else {
        setValue('address.country', '', { shouldValidate: true });
        setValue('address.state', '', { shouldValidate: true });
        setValue('address.city', '', { shouldValidate: true });
        enqueueSnackbar('Invalid Zipcode. Please enter a valid Indian Zipcode.', {
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching country and state:', error);
      setValue('address.country', '', { shouldValidate: true });
      setValue('address.state', '', { shouldValidate: true });
      setValue('address.city', '', { shouldValidate: true });
      enqueueSnackbar('Failed to fetch country and state details.', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Manage Branches
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {user?.role === 'Admin' && (
          <Grid item xs={12} md={6}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Branch Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="name" label="Branch Name" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField
                      name="series"
                      label="Series"
                      fullWidth
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        methods.setValue('series', value, { shouldValidate: true });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="branchCode" label="Branch Code" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="email" label="Email" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField
                      name="contact"
                      label="Phone Number"
                      fullWidth
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField
                      name="address.zipcode"
                      label="Zipcode"
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        maxLength: 6,
                      }}
                      rules={{
                        required: 'Zipcode is required',
                        minLength: {
                          value: 6,
                          message: 'Zipcode must be at least 6 digits',
                        },
                        maxLength: {
                          value: 6,
                          message: 'Zipcode cannot be more than 6 digits',
                        },
                      }}
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onBlur={(event) => {
                        const zip = event.target.value;
                        if (zip.length === 6) {
                          checkZipcode(zip);
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="address.country"
                      label="Country"
                      placeholder="Choose a country"
                      options={countrystatecity.map((country) => country.name)}
                      isOptionEqualToValue={(option, value) => option === value}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="address.state"
                      label="State"
                      placeholder="Choose a state"
                      options={
                        watch('address.country')
                          ? countrystatecity
                              .find((country) => country.name === watch('address.country'))
                              ?.states.map((state) => state.name) || []
                          : []
                      }
                      isOptionEqualToValue={(option, value) => option === value}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="address.city"
                      label="City"
                      placeholder="Choose a city"
                      options={
                        watch('address.state')
                          ? countrystatecity
                              .find((country) => country.name === watch('address.country'))
                              ?.states.find((state) => state.name === watch('address.state'))
                              ?.cities.map((city) => city.name) || []
                          : []
                      }
                      isOptionEqualToValue={(option, value) => option === value}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="address.street" label="Street" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="address.landmark" label="Landmark" />
                  </Grid>
                  {editingBranch && (
                    <Grid item xs={12}>
                      <RHFSwitch name="isActive" label="Is Active" />
                    </Grid>
                  )}
                  <Grid item xs={12} display="flex" justifyContent="end">
                    <LoadingButton
                      sx={{ mx: 1 }}
                      variant="contained"
                      onClick={() => {
                        reset(defaultValues);
                        setEditingBranch(null);
                      }}
                    >
                      Reset
                    </LoadingButton>
                    <LoadingButton
                      variant="contained"
                      type="submit"
                      onClick={handleSubmit(onSubmitBranchDetails)}
                      loading={loading}
                    >
                      {editingBranch ? 'Update Branch' : 'Add Branch'}
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        )}
        <Grid
          item
          xs={12}
          md={user?.role === 'Admin' ? 6 : 12}
          {...(user?.role !== 'Admin' && { display: 'flex' })}
        >
          {branch.map((branch) => (
            <Grid item xs={12} md={12} mb={2} key={branch.id} mx={1}>
              <Card>
                <CardHeader
                  title={branch.name}
                  sx={{ mb: 2.5 }}
                  action={
                    <>
                      {user?.role === 'Admin' && (
                        <>
                          <IconButton color="primary" onClick={() => handleEditBranch(branch)}>
                            <Iconify icon="eva:edit-fill" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteBranches([branch._id])}
                          >
                            <Iconify icon="eva:trash-2-outline" />
                          </IconButton>
                        </>
                      )}
                    </>
                  }
                />
                <Divider />
                <Box sx={{ p: 3 }}>
                  <Stack spacing={1.5} sx={{ typography: 'body2' }}>
                    <Stack direction="row" alignItems="center">
                      <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                      >
                        Series
                      </Box>
                      {branch.series || '-'}
                    </Stack>
                    <Stack direction="row" alignItems="center">
                      <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                      >
                        Email
                      </Box>
                      {branch.email}
                    </Stack>
                    <Stack direction="row" alignItems="center">
                      <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                      >
                        Contact
                      </Box>
                      {branch.contact}
                    </Stack>
                    <Stack direction="row" alignItems="center">
                      <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                      >
                        Address
                      </Box>
                      {branch.address.street}, {branch.address.city}, {branch.address.state},{' '}
                      {branch.address.country}, {branch.address.zipcode}
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </FormProvider>
  );
}
