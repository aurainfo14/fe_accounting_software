import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { AUTH_API, PATH_AFTER_LOGIN } from 'src/config-global';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import axios from 'axios';
import background from '../../../../public/assets/background/register-background-light.jpg';
import backgroundDark from '../../../../public/assets/background/register-background-dark.jpg';

// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const password = useBoolean();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [popupOpen, setPopupOpen] = useState(false);
  const [userName, setUserName] = useState('');

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    middleName: Yup.string().required('Middle name required'),
    lastName: Yup.string().required('Last name required'),
    contact: Yup.string().required('Contact name required'),
    companyName: Yup.string().required('Company name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    contact: '',
    companyName: '',
    password: '',
    role: 'ADMIN',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const URL = `${AUTH_API}/register`;
      const response = await axios.post(URL, data);
      if (response.data.success) {
        const result = response.data.data;
        setUserName(result.userName);
        setPopupOpen(true);
        enqueueSnackbar(response.data.data.message, { variant: 'success' });
        reset();
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const handleClosePopup = () => {
    setPopupOpen(false);
    router.push(returnTo || PATH_AFTER_LOGIN);
  };

  const handleCopyUserName = async () => {
    if (!userName) {
      enqueueSnackbar('No username to copy!', { variant: 'warning' });
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard
        .writeText(userName)
        .then(() => {
          enqueueSnackbar('Username copied to clipboard!', { variant: 'success' });
        })
        .catch((error) => {
          console.error('Failed to copy username:', error);
          enqueueSnackbar('Failed to copy username. Please try again.', { variant: 'error' });
        });
    } else {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = userName;
        textarea.style.position = 'absolute';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        enqueueSnackbar('Username copied to clipboard!', { variant: 'success' });
      } catch (error) {
        console.error('Fallback copy failed:', error);
        enqueueSnackbar('Failed to copy username. Please try again.', { variant: 'error' });
      }
    }
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h4">Get started absolutely free</Typography>
      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> Already have an account? </Typography>
        <Link href={paths.auth.jwt.login} component={RouterLink} variant="subtitle2">
          Sign in
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        mt: 2.5,
        textAlign: 'center',
        typography: 'caption',
        color: 'text.secondary',
      }}
    >
      {'By signing up, I agree to '}
      <Link underline="always" color="text.primary">
        Terms of Service
      </Link>
      {' and '}
      <Link underline="always" color="text.primary">
        Privacy Policy
      </Link>
      .
    </Typography>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
      >
        <RHFTextField
          name="firstName"
          label="First name"
          value={watch('firstName')}
          onChange={(e) => setValue('firstName', e.target.value.toUpperCase())}
        />
        <RHFTextField
          name="middleName"
          label="Middle name"
          value={watch('middleName')}
          onChange={(e) => setValue('middleName', e.target.value.toUpperCase())}
        />
        <RHFTextField
          name="lastName"
          label="Last name"
          value={watch('lastName')}
          onChange={(e) => setValue('lastName', e.target.value.toUpperCase())}
        />
        <RHFTextField name="email" label="Email address" />
        <RHFTextField
          name="contact"
          label="Contact"
          value={watch('contact')}
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/\D/g, '');
            if (onlyNums.length <= 10) {
              setValue('contact', onlyNums);
            }
          }}
          inputProps={{ maxLength: 10 }}
        />
        <RHFTextField
          name="companyName"
          label="Company Name"
          value={watch('companyName')}
          onChange={(e) => setValue('companyName', e.target.value.toUpperCase())}
        />
        <RHFTextField
          name="password"
          label="Password"
          type={password.value ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Create account
      </LoadingButton>
    </Stack>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src={theme.palette.mode === 'light' ? background : backgroundDark}
        alt="background"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            width: 700,
            height: 550,
            p: 5,
            borderRadius: 3,
            backgroundColor: theme.palette.mode === 'light' ? '#ffff' : '#222830',
          }}
        >
          {renderHead}
          <FormProvider methods={methods} onSubmit={onSubmit}>
            {renderForm}
          </FormProvider>
          <Dialog open={popupOpen} onClose={handleClosePopup}>
            <DialogTitle sx={{ textAlign: 'start', fontWeight: 'bold', fontSize: '1.5rem', pb: 0 }}>
              Registration Successful!
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', pt: 2 }}>
              <Box sx={{ mt: 2, width: '400px' }}>
                <TextField
                  fullWidth
                  label="Copy Your Username"
                  value={userName}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleCopyUserName}>
                          <Iconify icon="solar:clipboard-bold" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 1,
                    backgroundColor: '#f4f6f8',
                    borderRadius: 1,
                    '& .MuiInputBase-root': { fontWeight: 'bold', color: 'primary.main' },
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'end', pt: 1.5, pb: 3 }}>
              <Button
                onClick={handleClosePopup}
                variant="contained"
                sx={{ px: 2, py: 1, fontWeight: 'bold', textTransform: 'uppercase' }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}
