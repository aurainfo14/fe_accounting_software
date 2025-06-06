import isEqual from 'lodash/isEqual';
import React, { useState, useCallback, useEffect } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { paths } from 'src/routes/paths.js';
import { useRouter } from 'src/routes/hooks/index.js';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
import { useSnackbar } from 'src/components/snackbar/index.js';
import { ConfirmDialog } from 'src/components/custom-dialog/index.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table/index.js';
import DayBookToolbar from '../day-book-toolbar.jsx';
import DayBookTableFiltersResult from '../day-book-table-filters-result.jsx';
import DayBookTableRow from '../day-book-table-row.jsx';
import axios from 'axios';
import { useAuthContext } from '../../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../../api/config.js';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
// import { getResponsibilityValue } from '../../../../permission/permission.js';
import { useGetCashTransactions } from '../../../../api/cash-transactions.js';
import { isBetween } from '../../../../utils/format-time.js';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import { useForm } from 'react-hook-form';
import FormProvider from 'src/components/hook-form/form-provider.jsx';
import RHFTextField from 'src/components/hook-form/rhf-text-field.jsx';
import RHFDatePicker from 'src/components/hook-form/rhf-date-picker.jsx';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete.jsx';
import { useGetTransfer } from '../../../../api/transfer.js';
import { useGetBranch } from '../../../../api/branch.js';
import { useGetBankTransactions } from '../../../../api/bank-transactions.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '', label: '' },
  { id: 'type', label: 'Type' },
  { id: 'detail', label: 'Detail' },
  { id: 'category', label: 'Category' },
  { id: 'date', label: 'Date' },
  { id: 'paymentMode', label: 'payment mode' },
  { id: 'cashAmount', label: 'Cash amt' },
  { id: 'bankAmount', label: 'Bank amt' },
  { id: 'bankName', label: 'Bank' },
  { id: 'Amount', label: 'Amount' },
];

const defaultFilters = {
  name: '',
  startDate: new Date(),
  endDate: null,
  category: '',
  transactions: '',
  status: '',
};

// ----------------------------------------------------------------------

export default function DayBookListView() {
  const { cashTransactions, mutate, cashTransactionsLoading } = useGetCashTransactions();
  const { bankTransactions, bankTransactionsLoading } = useGetBankTransactions();
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  const dataFiltered = applyFilter({
    inputData: [
      ...cashTransactions,
      ...(Array.isArray(bankTransactions?.transactions) ? bankTransactions.transactions : []),
    ],
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });
  useEffect(() => {
    {
      dataFiltered.length > 0 && fetchStates();
      fetchType();
    }
  }, [dataFiltered]);
  const amount =
    dataFiltered
      .filter((e) => e.category === 'Payment In')
      .reduce((prev, next) => prev + (Number(next?.amount) || 0), 0) -
    dataFiltered
      .filter((e) => e.category === 'Payment Out')
      .reduce((prev, next) => prev + (Number(next?.amount) || 0), 0);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  if (cashTransactionsLoading) {
    return <LoadingScreen />;
  }

  function fetchType() {
    dataFiltered?.map((data) => {
      setTypeOptions((item) => {
        if (!item.find((option) => option === data.status)) {
          return [...item, data.status];
        } else {
          return item;
        }
      });
    });
  }

  function fetchStates() {
    const accountMap = new Map();

    accountMap.set('cash', { transactionsType: 'Cash' });

    dataFiltered?.forEach((data) => {
      const account = data?.paymentDetail?.account;
      if (account && account._id && !accountMap.has(account._id)) {
        accountMap.set(account._id, account);
      }
    });

    const newOptions = Array.from(accountMap.values());

    setOptions((prevOptions) => {
      const isSame =
        prevOptions.length === newOptions.length &&
        prevOptions.every((item) => newOptions.some((opt) => opt._id === item._id));

      return isSame ? prevOptions : newOptions;
    });

    setOptions(newOptions);
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={
            <Typography variant="h4" gutterBottom>
              Day Book :{' '}
              <strong style={{ color: amount > 0 ? 'green' : 'red' }}>
                {Object.values(filters).some(Boolean)
                  ? Math.abs(amount).toFixed(2)
                  : amount.toFixed(2)}
              </strong>
            </Typography>
          }
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: `Day Book`, href: paths.dashboard.accounting['day-book'] },
            { name: 'List' },
          ]}
          sx={{
            mb: { xs: 3, md: 1 },
          }}
        />
        <Card>
          <DayBookToolbar
            filters={filters}
            onFilters={handleFilters}
            options={options}
            typeOptions={typeOptions}
            daybookData={dataFiltered}
          />
          {canReset && (
            <DayBookTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}
          <TableContainer
            sx={{
              maxHeight: 500,
              overflow: 'auto',
              position: 'relative',
            }}
          >
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row._id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1000,
                  backgroundColor: '#2f3944',
                }}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <DayBookTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                    />
                  ))}
                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />
                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </TableContainer>
          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------
function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, startDate, endDate, category, status, transactions } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el) => el[0]);

  if (name && name.trim()) {
    inputData = inputData.filter(
      (item) =>
        item.detail.toLowerCase().includes(name.toLowerCase()) ||
        item.ref.toLowerCase().includes(name.toLowerCase())
    );
  }
  if (category) {
    inputData = inputData.filter((item) => item.category === category);
  }
  if (transactions) {
    inputData = inputData.filter((item) => item?.paymentDetail?.account?._id === transactions?._id);
  }
  if (status) {
    inputData = inputData.filter((item) => item.status === status);
  }
  if (startDate) {
    inputData = inputData.filter(
      (item) =>
        new Date(item.date).toISOString().split('T')[0] ===
        new Date(startDate).toISOString().split('T')[0]
    );
  }

  return inputData;
}
