import * as Yup from 'yup';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button } from '@mui/material';
import axios from 'axios';
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
import RhfDatePicker from '../../components/hook-form/rhf-date-picker.jsx';
import countrystatecity from '../../_mock/map/csc.json';
import { useGetBranch } from '../../api/branch.js';

export default function EmployeeNewEditForm({ currentEmployee }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const { enqueueSnackbar } = useSnackbar();

  const EmployeeSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    middleName: Yup.string(),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    contact: Yup.string().matches(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
    joiningDate: Yup.date()
      .required('Joining date is required')
      .nullable()
      .typeError('Joining date is required'),
    salary: Yup.string(),
    street: Yup.string(),
    landmark: Yup.string(),
    country: Yup.string(),
    state: Yup.string(),
    city: Yup.string(),
    zipcode: Yup.string(),
    logo_url: Yup.mixed(),
  });

  const defaultValues = useMemo(
    () => ({
      branch: currentEmployee?.branch
        ? { label: currentEmployee.branch.name, value: currentEmployee.branch._id }
        : null,
      firstName: currentEmployee?.firstName || '',
      middleName: currentEmployee?.middleName || '',
      lastName: currentEmployee?.lastName || '',
      email: currentEmployee?.email || '',
      contact: currentEmployee?.contact || '',
      joiningDate: currentEmployee ? new Date(currentEmployee.joiningDate) : new Date(),
      salary: currentEmployee?.salary || '',
      street: currentEmployee?.address?.street || '',
      landmark: currentEmployee?.address?.landmark || '',
      country: currentEmployee?.address?.country || '',
      state: currentEmployee?.address?.state || '',
      city: currentEmployee?.address?.city || '',
      zipcode: currentEmployee?.address?.zipcode || '',
      logo_url: null,
    }),
    [currentEmployee]
  );

  const methods = useForm({
    resolver: yupResolver(EmployeeSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();

    formData.append('firstName', data.firstName);
    formData.append('middleName', data.middleName || '');
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('contact', data.contact || '');
    formData.append('joiningDate', data.joiningDate?.toISOString());
    formData.append('salary', data.salary || '');
    formData.append('street', data.street || '');
    formData.append('landmark', data.landmark || '');
    formData.append('country', data.country || '');
    formData.append('state', data.state || '');
    formData.append('city', data.city || '');
    formData.append('zipcode', data.zipcode || '');

    if (data.logo_url && data.logo_url instanceof File) {
      formData.append('employeeImage', data.logo_url);
    }

    let finalBranchId = null;

    try {
      if (user?.role === 'ADMIN' && storedBranch === 'all' && data.branch?.value) {
        finalBranchId = data.branch.value;
      } else {
        const parsed = JSON.parse(storedBranch);
        finalBranchId = parsed?._id || parsed;
      }
    } catch {
      finalBranchId = storedBranch;
    }

    if (finalBranchId) {
      formData.append('branch', finalBranchId);
    }

    try {
      const url = currentEmployee
        ? `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/employee/${currentEmployee._id}`
        : `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/employee`;

      const config = {
        method: currentEmployee ? 'put' : 'post',
        url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios(config);
      enqueueSnackbar(response?.data.message);
      router.push(paths.dashboard.employee.list);
      reset();
    } catch (error) {
      enqueueSnackbar(
        currentEmployee
          ? 'Failed to update employee'
          : error.response?.data?.message || 'Error occurred',
        { variant: 'error' }
      );
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setValue('logo_url', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 2, pb: 1, px: 1 }}>
            <Box sx={{ mb: 1 }}>
              <RHFUploadAvatar name="logo_url" maxSize={3145728} onDrop={handleDrop} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
              Employee Information
            </Typography>
            <Box
              rowGap={1.5}
              columnGap={1.5}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              {user?.role === 'ADMIN' && branch && storedBranch === 'all' && (
                <RHFAutocomplete
                  name="branch"
                  label="Branch"
                  placeholder="Choose a Branch"
                  options={
                    branch?.map((b) => ({
                      label: b.name,
                      value: b._id,
                    })) || []
                  }
                  isOptionEqualToValue={(option, value) => option?.value === value?.value}
                />
              )}
              <RHFTextField
                name="firstName"
                label="First Name"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RHFTextField
                name="middleName"
                label="Middle Name"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RHFTextField
                name="lastName"
                label="Last Name"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RHFTextField name="email" label="Email" />
              <RHFTextField
                name="contact"
                label="Mobile"
                inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                }}
              />
              <RhfDatePicker name="joiningDate" control={control} label="Joining Date" />
              <RHFTextField
                name="salary"
                label="Salary"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                }}
              />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
              Address Information
            </Typography>
            <Box
              rowGap={1.5}
              columnGap={1.5}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <RHFTextField
                name="street"
                label="Street"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RHFTextField
                name="landmark"
                label="Landmark"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RHFAutocomplete
                name="country"
                label="Country"
                fullWidth
                options={countrystatecity.map((country) => country.name)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
              <RHFAutocomplete
                name="state"
                label="State"
                fullWidth
                options={
                  watch('country')
                    ? countrystatecity
                        .find((country) => country.name === watch('country'))
                        ?.states.map((state) => state.name) || []
                    : []
                }
                getOptionLabel={(option) => option}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
              <RHFAutocomplete
                name="city"
                label="City"
                fullWidth
                options={
                  watch('state')
                    ? countrystatecity
                        .find((country) => country.name === watch('country'))
                        ?.states.find((state) => state.name === watch('state'))
                        ?.cities.map((city) => city.name) || []
                    : []
                }
                getOptionLabel={(option) => option}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
              <RHFTextField
                name="zipcode"
                label="Zipcode"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) event.preventDefault();
                }}
              />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'end', mt: 3 }}>
            <Button
              color="inherit"
              sx={{ margin: '0px 10px', height: '36px' }}
              variant="outlined"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentEmployee ? 'Create Employee' : 'Update Employee'}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

EmployeeNewEditForm.propTypes = {
  currentEmployee: PropTypes.object,
};
