import React, { useCallback, useMemo, useState } from 'react';
import { Box, Card, Container, Grid, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from '../../../routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { axiosAuthInstance, axiosInstance } from 'src/utils/axios-instance';
import { setSession } from '../../../auth/context/jwt/utils.js';
import { useAuthContext } from '../../../auth/hooks/index.js';

export default function MyProfile() {
  const { user,initialize } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [avatarFile, setAvatarFile] = useState(null);
  const router = useRouter();

  if (!user) {
    router.replace('/');
    return null;
  }

  const logout = useCallback(async () => {
    setSession(null);
    router.replace('/');
  }, [router]);

  const defaultValues = useMemo(
    () => ({
      avatar_url: user?.userImage || '',
      firstName: user?.firstName || '',
      middleName: user?.middleName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      contact: user?.contact || '',
    }),
    [user]
  );

  const PersonalDetailsSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    middleName: Yup.string(),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email().required('Email is required'),
    contact: Yup.string().required().min(10).max(10),
  });

  const PasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current Password is required'),
    newPassword: Yup.string().min(6).required('New Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const methods = useForm({
    resolver: yupResolver(PersonalDetailsSchema),
    defaultValues,
  });

  const passwordMethods = useForm({
    resolver: yupResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const {
    handleSubmit: handlePasswordSubmit,
    formState: { isSubmitting: isPasswordSubmitting },
  } = passwordMethods;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const preview = URL.createObjectURL(file);
      setAvatarFile(file);
      setValue('avatar_url', preview);
    },
    [setValue]
  );

  const onSubmitPersonalDetails = async (data) => {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('middleName', data.middleName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('contact', data.contact);

    if (avatarFile) {
      formData.append('userImage', avatarFile);
    }

    const URL = `/${user?.company?._id}/user/${user?._id}`;

    try {
      const response = await axiosInstance.put(URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
        setAvatarFile(null);
        initialize()
      } else {
        enqueueSnackbar('Something went wrong. Please try again.', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Update failed. Please try again.', {
        variant: 'error',
      });
    }
  };

  const onSubmitPassword = async (data) => {
    const payload = {
      userName: user?.userName,
      oldPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    const URL = `/reset-password`;

    try {
      const response = await axiosAuthInstance.put(URL, payload);

      if (response.status === 200) {
        enqueueSnackbar('Password updated successfully. Please log in again.', {
          variant: 'success',
        });
        await logout();
        passwordMethods.reset();
      } else {
        enqueueSnackbar('Failed to update password. Try again.', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Password update failed.', {
        variant: 'error',
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={5}>
        <Grid item xs={12} md={8}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitPersonalDetails)}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Personal Details
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Personal info, profile pic, Name...
            </Typography>
            <Card sx={{ pt: 5, px: 3 }}>
              <Box
                sx={{ mb: 5, px: 3, display: 'flex', textAlign: 'center', justifyContent: 'start' }}
              >
                <RHFUploadAvatar name="avatar_url" onDrop={handleDrop} />
              </Box>
              <Stack spacing={3} sx={{ p: 3 }}>
                <Box
                  columnGap={2}
                  rowGap={3}
                  display="grid"
                  gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' }}
                >
                  <RHFTextField
                    label="First Name"
                    name="firstName"
                    onChange={(e) => setValue('firstName', e.target.value.toUpperCase())}
                  />
                  <RHFTextField
                    label="Middle Name"
                    name="middleName"
                    onChange={(e) => setValue('middleName', e.target.value.toUpperCase())}
                  />
                  <RHFTextField
                    label="Last Name"
                    name="lastName"
                    onChange={(e) => setValue('lastName', e.target.value.toUpperCase())}
                  />
                  <RHFTextField label="Email" name="email" />
                  <RHFTextField
                    label="Contact"
                    name="contact"
                    inputProps={{ maxLength: 10 }}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setValue('contact', onlyNums);
                    }}
                  />
                </Box>
                <Stack direction="row" justifyContent="flex-end">
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    Submit
                  </LoadingButton>
                </Stack>
              </Stack>
            </Card>
          </FormProvider>
        </Grid>

        {user?.role === 'ADMIN' && (
          <Grid item xs={12} md={4}>
            <FormProvider
              methods={passwordMethods}
              onSubmit={handlePasswordSubmit(onSubmitPassword)}
            >
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Update Password
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Password info...
              </Typography>
              <Card>
                <Stack spacing={3} sx={{ p: 3 }}>
                  <Box
                    columnGap={2}
                    rowGap={3}
                    display="grid"
                    gridTemplateColumns={{ xs: 'repeat(1, 1fr)' }}
                  >
                    <RHFTextField label="Current Password" name="currentPassword" />
                    <RHFTextField label="New Password" name="newPassword" />
                    <RHFTextField label="Confirm Password" name="confirmPassword" />
                  </Box>
                  <Stack direction="row" justifyContent="flex-end">
                    <LoadingButton type="submit" variant="contained" loading={isPasswordSubmitting}>
                      Update Password
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Card>
            </FormProvider>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
