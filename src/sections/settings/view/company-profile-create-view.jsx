import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { useGetCompanyDetails } from '../../../api/company_details.js';
import { useAuthContext } from '../../../auth/hooks/index.js';
import countrystatecity from '../../../_mock/map/csc.json';

export default function CompanyProfile() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { companyDetail, companyMutate } = useGetCompanyDetails();
  const { enqueueSnackbar } = useSnackbar();

  const CompanySchema = Yup.object().shape({
    company_name: Yup.string().required('Company name is required'),
    logo_url: Yup.mixed().nullable().required('Logo is required'),
    contact: Yup.string().required('Contact is required'),
    email: Yup.string().required('Email is required').email('Email must be valid'),
    address_1: Yup.string().required('Address is required'),
    country: Yup.string().required('Country is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    zipcode: Yup.string().required('Zipcode is required'),
  });

  const methods = useForm({
    resolver: yupResolver(CompanySchema),
    defaultValues: {
      company_name: '',
      logo_url: null,
      contact: '',
      email: '',
      address_1: '',
      country: '',
      state: '',
      city: '',
      zipcode: '',
    },
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (companyDetail) {
      reset({
        company_name: companyDetail.company_name || '',
        logo_url: companyDetail.logo_url || null,
        contact: companyDetail.contact || '',
        email: companyDetail.email || '',
        address_1: companyDetail.address_1 || '',
        country: companyDetail.country || '',
        state: companyDetail.state || '',
        city: companyDetail.city || '',
        zipcode: companyDetail.zipcode || '',
      });
    }
  }, [companyDetail, reset]);

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

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();

      formData.append('company_name', data.company_name);
      formData.append('contact', data.contact);
      formData.append('email', data.email);
      formData.append('address_1', data.address_1);
      formData.append('country', data.country);
      formData.append('state', data.state);
      formData.append('city', data.city);
      formData.append('zipcode', data.zipcode);

      if (data.logo_url && data.logo_url instanceof File) {
        formData.append('logo_url', data.logo_url);
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/${user?.company_id?._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Update failed');

      enqueueSnackbar('Update success!');
      companyMutate();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Update failed', { variant: 'error' });
    }
  });

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
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="company_name" label="Company Name" />
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField name="contact" label="Contact" />
              <RHFTextField name="address_1" label="Address" />
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
              <RHFTextField name="zipcode" label="Zip Code" />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

CompanyProfile.propTypes = {
  companyDetail: PropTypes.object,
};
