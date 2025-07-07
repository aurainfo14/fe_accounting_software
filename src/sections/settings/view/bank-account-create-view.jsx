import React, { useCallback, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { useGetBankAccount } from '../../../api/bank-account';
import { useGetBranch } from '../../../api/branch';

export const ACCOUNT_TYPE_OPTIONS = [
  'Savings Account',
  'Checking Account',
  'Current Account',
  'Business Account',
  'Fixed Deposit Account',
  'Joint Account',
  'Student Account',
  'Salary Account',
  'NRI Account',
  'Trust Account',
  'Escrow Account',
  'Investment Account',
  'Demat Account',
  'Credit Card Account',
  'Foreign Currency Account',
  'Retirement Account',
  'Money Market Account',
  'Offshore Account',
  'Islamic Account',
  'Health Savings Account',
  'Brokerage Account',
  'Custodial Account',
  'Sweep Account',
  'Virtual Account',
  'Loan Account',
];

const validationSchema = yup.object().shape({
  accountNumber: yup.string().required('Account Number is required'),
  accountType: yup.string().required('Account Type is required'),
  accountHolderName: yup.string().required('Account Holder Name is required'),
  bankName: yup.string().required('Bank Name is required'),
  IFSC: yup.string().required('IFSC Code is required'),
  branchName: yup.string().required('Branch Name is required'),
  bankLogo: yup.mixed().nullable(),
});

export default function BankAccountCreateView() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { bankAccount, mutate } = useGetBankAccount();
  const { branch } = useGetBranch();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const [loading, setLoading] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const defaultValues = useMemo(
    () => ({
      branch: null,
      accountNumber: '',
      accountType: '',
      accountHolderName: '',
      bankName: '',
      IFSC: '',
      branchName: '',
      bankLogo: null,
    }),
    []
  );

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(validationSchema),
  });

  const { reset, handleSubmit, setValue, watch } = methods;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles?.[0];
      if (file) {
        const previewFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setValue('bankLogo', previewFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    reset({
      branch: account
        ? {
            label: account?.branch?.name,
            value: account?.branch?._id,
          }
        : null,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      accountHolderName: account.accountHolderName,
      bankName: account.bankName,
      IFSC: account.IFSC,
      branchName: account.branchName,
      bankLogo: account.bankLogo || null,
    });
  };

  const handleDeleteAccount = async (id) => {
    if (!user?.company?._id) return;
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/${user.company._id}/bank-account/${id}`);
      enqueueSnackbar('Bank account deleted successfully', { variant: 'success' });
      await mutate();
      if (editingAccount?._id === id) {
        setEditingAccount(null);
        reset(defaultValues);
      }
    } catch {
      enqueueSnackbar('Failed to delete bank account', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!user?.company?._id) return;
    setLoading(true);

    try {
      let finalBranchId = null;

      if (user?.role === 'ADMIN' && storedBranch === 'all' && data.branch?.value) {
        finalBranchId = data.branch.value;
      } else {
        try {
          const parsed = JSON.parse(storedBranch);
          finalBranchId = parsed?._id || parsed;
        } catch {
          finalBranchId = storedBranch;
        }
      }

      const formData = new FormData();
      formData.append('branch', finalBranchId);

      for (const key in data) {
        if (key === 'bankLogo' && data.bankLogo instanceof File) {
          formData.append('bankLogo', data.bankLogo);
        } else if (key !== 'branch') {
          formData.append(key, data[key]);
        }
      }

      const url = `${import.meta.env.VITE_BASE_URL}/${user.company._id}/bank-account`;

      if (editingAccount) {
        await axios.put(`${url}/${editingAccount._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        enqueueSnackbar('Bank account updated successfully', { variant: 'success' });
      } else {
        await axios.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        enqueueSnackbar('Bank account created successfully', { variant: 'success' });
      }

      await mutate();
      reset(defaultValues);
      setEditingAccount(null);
    } catch (error) {
      console.error('Failed to save account:', error);
      enqueueSnackbar('Failed to save bank account', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider methods={methods}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600}>
          Manage Bank Accounts
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              {editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFUploadAvatar name="bankLogo" maxSize={3145728} onDrop={handleDrop} />
              </Grid>
              {user?.role === 'ADMIN' && branch && storedBranch === 'all' && (
                <Grid item xs={12}>
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
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="accountNumber"
                  label="Account Number"
                  fullWidth
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFAutocomplete
                  name="accountType"
                  label="Account Type"
                  options={ACCOUNT_TYPE_OPTIONS}
                  isOptionEqualToValue={(option, value) => option === value}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="accountHolderName"
                  label="Account Holder Name"
                  onChange={(e) => {
                    setValue('accountHolderName', e.target.value.toUpperCase(), {
                      shouldValidate: true,
                    });
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="bankName"
                  label="Bank Name"
                  onChange={(e) => {
                    setValue('bankName', e.target.value.toUpperCase(), { shouldValidate: true });
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="IFSC"
                  label="IFSC Code"
                  onChange={(e) => {
                    setValue('IFSC', e.target.value.toUpperCase(), { shouldValidate: true });
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="branchName"
                  label="Branch Name"
                  onChange={(e) => {
                    setValue('branchName', e.target.value.toUpperCase(), { shouldValidate: true });
                  }}
                />
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <LoadingButton
                  sx={{ mx: 1 }}
                  variant="contained"
                  color="inherit"
                  disabled={loading}
                  onClick={() => {
                    reset(defaultValues);
                    setEditingAccount(null);
                  }}
                >
                  Reset
                </LoadingButton>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={loading}
                  onClick={handleSubmit(onSubmit)}
                >
                  {editingAccount ? 'Update Account' : 'Add Account'}
                </LoadingButton>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" mb={2}>
            Bank Accounts List
          </Typography>
          {!bankAccount || bankAccount.length === 0 ? (
            <Typography>No bank accounts found.</Typography>
          ) : (
            bankAccount
              .filter((account) => account?.user !== user?._id)
              .map((account) => (
                <Card key={account._id} sx={{ mb: 2 }}>
                  <CardHeader
                    sx={{ mb: 3 }}
                    title={`${account.bankName}(${account?.branch?.name})`}
                    action={
                      <>
                        <IconButton onClick={() => handleEditAccount(account)} color="primary">
                          <Iconify icon="eva:edit-fill" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteAccount(account._id)}
                          color="error"
                          disabled={loading}
                        >
                          <Iconify icon="eva:trash-2-outline" />
                        </IconButton>
                      </>
                    }
                  />
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Stack sx={{ display: 'flex' }} spacing={1}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <Box sx={{ flex: '1 1 auto', minWidth: 200 }}>
                          <Typography variant="body2">
                            <strong>Account Holder Type:</strong> {account.accountHolderName}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Account Number:</strong> {account.accountNumber}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Account Type:</strong> {account.accountType}
                          </Typography>
                          <Typography variant="body2">
                            <strong>IFSC Code:</strong> {account.IFSC}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Branch Name:</strong> {account.branchName}
                          </Typography>
                        </Box>
                        {account.bankLogo && (
                          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                            <Avatar
                              src={account.bankLogo}
                              alt="Bank Logo"
                              variant="rounded"
                              sx={{ width: 100, height: 70 }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                </Card>
              ))
          )}
        </Grid>
      </Grid>
    </FormProvider>
  );
}
