import React, { useState } from 'react';
import { Box, Button, Card, Grid, TextField, Typography } from '@mui/material';
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import { Stack } from '@mui/system';

export default function IncomeTypeCreateView({ setTab }) {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const [inputVal, setInputVal] = useState('');
  const [incomeType, setIncomeTypes] = useState(configs?.incomeType || []);
  const { enqueueSnackbar } = useSnackbar();

  const handleClick = () => {
    if (!inputVal) {
      enqueueSnackbar('Income type cannot be empty', { variant: 'warning' });
      return;
    }

    const updatedIncomeTypes = [...incomeType, inputVal.toUpperCase()];
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company_id?._id}/config/${configs?._id}`;
    const payload = { ...configs, incomeType: updatedIncomeTypes };

    axios
      .put(URL, payload)
      .then((res) => {
        if (res.status === 200) {
          setInputVal('');
          setIncomeTypes(updatedIncomeTypes);
          enqueueSnackbar('Income type added successfully', { variant: 'success' });
          setTab('Permission');
          mutate();
        }
      })
      .catch((err) => console.log(err));
  };

  const handleDelete = (type) => {
    const updatedIncomeTypes = incomeType.filter((bt) => bt !== type);
    const apiEndpoint = `${import.meta.env.VITE_BASE_URL}/${user?.company_id?._id}/config/${
      configs?._id
    }`;
    const payload = { ...configs, incomeType: updatedIncomeTypes };

    axios
      .put(apiEndpoint, payload)
      .then(() => {
        setIncomeTypes(updatedIncomeTypes);
        enqueueSnackbar('Income type deleted successfully', { variant: 'success' });
        mutate();
      })
      .catch((err) => console.log(err));
  };

  return (
    <Box sx={{ width: '100%', marginBottom: '10px', padding: '10px' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Add Income Type
          </Typography>
        </Grid>
        <Grid item md={4} xs={12}>
          <Box sx={{ width: '100%', maxWidth: '600px', marginBottom: '10px', padding: '10px' }}>
            <TextField
              fullWidth
              name="incomeType"
              variant="outlined"
              label="Income Type"
              value={inputVal}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              onChange={(e) => setInputVal(e.target.value)}
              sx={{ fontSize: '16px' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '20px' }}>
              <Button variant="contained" onClick={handleClick}>
                Add
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <Stack spacing={3} sx={{ p: 3 }}>
              <Box
                columnGap={2}
                rowGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                {incomeType.length !== 0 &&
                  incomeType.map((type, index) => (
                    <Grid
                      container
                      key={index}
                      sx={{
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        boxShadow: 4,
                        borderRadius: 1,
                        p: 2,
                        m: 1,
                      }}
                    >
                      <Grid item>
                        <Typography sx={{ fontSize: '14px' }}>{type}</Typography>
                      </Grid>
                      <Grid item>
                        <Box
                          sx={{ color: 'error.main', cursor: 'pointer' }}
                          onClick={() => handleDelete(type)}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </Box>
                      </Grid>
                    </Grid>
                  ))}
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
