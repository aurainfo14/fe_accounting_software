import * as Yup from 'yup';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths.js';
import { useRouter } from 'src/routes/hooks/index.js';
import { useSnackbar } from 'src/components/snackbar/index.js';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form/index.js';
import axios from 'axios';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../api/config.js';
import { Button } from '@mui/material';
import { useGetBranch } from '../../../api/branch.js';
import RhfDatePicker from '../../../components/hook-form/rhf-date-picker.jsx';

// ----------------------------------------------------------------------

export default function IncomeNewEditForm({ currentIncome }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [paymentMode, setPaymentMode] = useState('');
  const { branch } = useGetBranch();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  // const [file, setFile] = useState(currentIncome ? currentIncome?.invoice : null);

  const paymentSchema =
    paymentMode === 'Bank'
      ? {
          account: Yup.object().required('Account is required').typeError('Account is required'),
          bankAmount: Yup.string()
            .required('Bank Amount is required')
            .test(
              'is-positive',
              'Bank Amount must be a positive number',
              (value) => parseFloat(value) >= 0
            ),
        }
      : paymentMode === 'Cash'
        ? {
            cashAmount: Yup.number()
              .typeError('Cash Amount must be a valid number')
              .required('Cash Amount is required')
              .min(0, 'Cash Amount must be a positive number'),
          }
        : {
            cashAmount: Yup.number()
              .typeError('Cash Amount must be a valid number')
              .required('Cash Amount is required')
              .min(0, 'Cash Amount must be a positive number'),

            bankAmount: Yup.string()
              .required('Bank Amount is required')
              .test(
                'is-positive',
                'Bank Amount must be a positive number',
                (value) => parseFloat(value) >= 0
              ),
            account: Yup.object().required('Account is required'),
          };

  const NewSchema = Yup.object().shape({
    otherIncomeType: Yup.string().required('Expense Type is required'),
    category: Yup.string().required('category  is required'),
    paymentMode: Yup.string().required('paymentMode  is required'),
    date: Yup.date().typeError('Please enter a valid date').required('Date is required'),
    description: Yup.string().required('description Date is required'),
    ...paymentSchema,
  });

  const defaultValues = useMemo(
    () => ({
      otherIncomeType: currentIncome?.otherIncomeType || '',
      category: currentIncome?.category || '',
      date: currentIncome?.date ? new Date(currentIncome?.date) : new Date(),
      description: currentIncome?.description || '',
      paymentMode: currentIncome?.paymentDetail?.paymentMode || '',
      account: currentIncome?.paymentDetail?.account?.bankName || null,
      cashAmount: currentIncome?.paymentDetail?.cashAmount || '',
      bankAmount: currentIncome?.paymentDetail?.bankAmount || '',
      branch: currentIncome
        ? {
            label: currentIncome?.branch?.name,
            value: currentIncome?.branch?._id,
          }
        : null,
    }),
    [currentIncome]
  );

  const methods = useForm({
    resolver: yupResolver(NewSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = methods;

  // useEffect(() => {
  //   if (currentIncome && currentIncome.invoice) {
  //     const blob = new Blob([currentIncome.invoice], { type: 'application/pdf' }); // Change MIME type as needed
  //     const blobUrl = URL.createObjectURL(blob);
  //     setFile(blobUrl);
  //
  //     // Clean up the URL when component unmounts or invoice changes
  //     return () => URL.revokeObjectURL(blobUrl);
  //   }
  // }, [currentIncome]);

  useEffect(() => {
    if (watch('paymentMode')) {
      setPaymentMode(watch('paymentMode'));
    }
  }, [watch('paymentMode')]);

  useEffect(() => {
    const valuation = watch('valuation');
    if (valuation) {
      const rpg = (configs.goldRate * valuation) / 100;
      setValue('ratePerGram', rpg);
    } else {
      setValue('ratePerGram', 0);
    }
  }, [watch('valuation'), configs.goldRate, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    let paymentDetail = {
      paymentMode: data.paymentMode,
      expectPaymentMode: data.expectPaymentMode,
    };

    if (data.paymentMode === 'Cash') {
      paymentDetail = {
        ...paymentDetail,
        cashAmount: data.cashAmount,
      };
    } else if (data.paymentMode === 'Bank') {
      paymentDetail = {
        ...paymentDetail,
        ...data.account,
        bankAmount: data.bankAmount,
      };
    } else if (data.paymentMode === 'Both') {
      paymentDetail = {
        ...paymentDetail,
        cashAmount: data.cashAmount,
        ...data.account,
        bankAmount: data.bankAmount,
      };
    }
    const payload = {
      company: user.company,
      branch: data.branch.value,
      incomeType: data?.otherIncomeType || '',
      category: data?.category || '',
      date: data?.date,
      description: data?.description,
      paymentDetail: paymentDetail,
    };

    // const formData = new FormData();
    //
    // formData.append('otherIncomeType', data?.otherIncomeType);
    // formData.append('description', data?.description);
    // formData.append('category', data?.category);
    // formData.append('date', data?.date);

    // Append paymentDetail fields

    // for (const [key, value] of Object.entries(paymentDetail)) {
    //   formData.append(`paymentDetail[${key}]`, value);
    // }
    // if (file) {
    //   formData.append('invoice', file);
    // }

    try {
      if (currentIncome) {
        const res = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/income/${currentIncome._id}`,
          payload
        );
        router.push(paths.dashboard.accounting.income.list);
        enqueueSnackbar(res?.data.message);
        reset();
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/income`,
          payload
        );
        router.push(paths.dashboard.accounting.income.list);
        enqueueSnackbar(res?.data.message);
        reset();
      }
    } catch (error) {
      enqueueSnackbar(
        currentIncome ? 'Failed To update other income' : error.response.data.message,
        {
          variant: 'error',
        }
      );
      console.error(error);
    }
  });

  // const handleDrop = useCallback((acceptedFiles) => {
  //   const uploadedFile = acceptedFiles[0];
  //
  //   if (uploadedFile) {
  //     uploadedFile.preview = URL.createObjectURL(uploadedFile);
  //     setFile(uploadedFile);
  //   }
  // }, []);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: '600' }}>
            Income Info
          </Typography>
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
              <RHFAutocomplete
                name="otherIncomeType"
                label="Other Income Type"
                req="red"
                fullWidth
                options={configs?.otherIncomeType || []}
                getOptionLabel={(option) => option || ''}
                renderOption={(props, option, { index }) => (
                  <li {...props} key={index}>
                    {option}
                  </li>
                )}
              />
              <RHFTextField
                name="category"
                label="Category"
                req={'red'}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RhfDatePicker name="date" control={control} label="Date" req={'red'} />
              <RHFTextField name="description" label="Description" req={'red'} multiline />
            </Box>
            {/*<UploadBox*/}
            {/*  onDrop={handleDrop}*/}
            {/*  placeholder={*/}
            {/*    !file ? (*/}
            {/*      <Stack spacing={0.5} alignItems="center" sx={{ color: 'text.disabled' }}>*/}
            {/*        <Iconify icon="eva:cloud-upload-fill" width={40} />*/}
            {/*        <Typography variant="body2">Upload file</Typography>*/}
            {/*      </Stack>*/}
            {/*    ) : (*/}
            {/*      <Box*/}
            {/*        sx={{*/}
            {/*          width: 200,*/}
            {/*          height: 200,*/}
            {/*          border: '1px solid #ccc',*/}
            {/*          borderRadius: 1,*/}
            {/*          overflow: 'hidden',*/}
            {/*        }}*/}
            {/*      >*/}
            {/*        {file.type === 'application/pdf' ? (*/}
            {/*          <iframe*/}
            {/*            src={currentIncome ? file : file.preview}*/}
            {/*            width="100%"*/}
            {/*            height="100%"*/}
            {/*            title="pdf-preview"*/}
            {/*          />*/}
            {/*        ) : file.type?.startsWith('image/') ? (*/}
            {/*          <img*/}
            {/*            src={currentIncome ? file : file.preview}*/}
            {/*            alt={file.path}*/}
            {/*            style={{ width: '100%', height: '100%', objectFit: 'contain' }}*/}
            {/*          />*/}
            {/*        ) : (*/}
            {/*          <Typography variant="body2">{file.path}</Typography>*/}
            {/*        )}*/}
            {/*      </Box>*/}
            {/*    )*/}
            {/*  }*/}
            {/*  sx={{*/}
            {/*    mb: 3,*/}
            {/*    py: 2.5,*/}
            {/*    width: 'auto',*/}
            {/*    height: '250px',*/}
            {/*    borderRadius: 1.5,*/}
            {/*    mt: 3,*/}
            {/*  }}*/}
            {/*/>*/}
            <Typography variant="subtitle1" sx={{ my: 2, fontWeight: 600 }}>
              Payment Details
            </Typography>
            <Box>
              <Box>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(3, 1fr)',
                  }}
                  sx={{ mt: 1 }}
                >
                  <RHFAutocomplete
                    name="paymentMode"
                    label="Payment Mode"
                    options={['Cash', 'Bank', 'Both']}
                    onChange={(event, value) => {
                      setValue('paymentMode', value);
                      const totalAmountPaid = parseFloat(watch('amountPaid')) || 0;

                      if (value === 'Cash') {
                        setValue('cashAmount', totalAmountPaid);
                        setValue('bankAmount', 0);
                      } else if (value === 'Bank') {
                        setValue('bankAmount', totalAmountPaid);
                        setValue('cashAmount', 0);
                      } else if (value === 'Both') {
                        const splitCash = totalAmountPaid * 0.5;
                        setValue('cashAmount', splitCash.toFixed(2));
                        setValue('bankAmount', (totalAmountPaid - splitCash).toFixed(2));
                      }
                    }}
                  />
                  {watch('paymentMode') === 'Cash' || watch('paymentMode') === 'Both' ? (
                    <Controller
                      name="cashAmount"
                      control={control}
                      render={({ field }) => (
                        <RHFTextField
                          {...field}
                          label="Cash Amount"
                          req={'red'}
                          inputProps={{ min: 0 }}
                          // onChange={(e) => {
                          //   field.onChange(e);
                          //   handleCashAmountChange(`e);
                          // }}
                        />
                      )}
                    />
                  ) : null}
                  {(watch('paymentMode') === 'Bank' || watch('paymentMode') === 'Both') && (
                    <>
                      <RHFAutocomplete
                        name="account"
                        label="Account"
                        req={'red'}
                        fullWidth
                        options={branch.flatMap((item) => item.company.bankAccounts)}
                        getOptionLabel={(option) => option.bankName || ''}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id || option.bankName}>
                            {option.bankName}
                          </li>
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                      />
                      <Controller
                        name="bankAmount"
                        control={control}
                        render={({ field }) => (
                          <RHFTextField
                            {...field}
                            label="Bank Amount"
                            req={'red'}
                            inputProps={{ min: 0 }}
                          />
                        )}
                      />
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>
          <Box xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end', mt: 3 }}>
            <Button
              color="inherit"
              sx={{ margin: '0px 10px', height: '36px' }}
              variant="outlined"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {currentIncome ? 'Save' : 'Submit'}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
IncomeNewEditForm.propTypes = {
  currentIncome: PropTypes.object,
};
