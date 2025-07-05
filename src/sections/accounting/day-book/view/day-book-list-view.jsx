import isEqual from 'lodash/isEqual';
import React, { useCallback, useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { paths } from 'src/routes/paths.js';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  useTable,
} from 'src/components/table/index.js';
import DayBookToolbar from '../day-book-toolbar.jsx';
import DayBookTableFiltersResult from '../day-book-table-filters-result.jsx';
import DayBookTableRow from '../day-book-table-row.jsx';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import { useGetCashTransactions } from '../../../../api/cash-transactions.js';
import Typography from '@mui/material/Typography';
import { useGetBankTransactions } from '../../../../api/bank-transactions.js';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import { PDFViewer } from '@react-pdf/renderer';
import DayBookPdf from './branch-pdf.jsx';
import { useGetCompanyReport } from '../../../../api/report.js';
import Stack from '@mui/material/Stack';
import { LocalizationProvider } from '../../../../locales/index.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

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
  const [monthYear, setMonthYear] = useState(new Date());
  const { cashTransactions, cashTransactionsLoading } = useGetCashTransactions();
  const { bankTransactions } = useGetBankTransactions();
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const branchPdfDialog = useBoolean();
  const { companyAllData } = useGetCompanyReport({
    month: format(monthYear, 'yyyy-MM'),
  });
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
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  views={['year', 'month']}
                  label="Select Month"
                  minDate={new Date('2020-01-01')}
                  maxDate={new Date()}
                  value={monthYear}
                  onChange={(newValue) => {
                    if (newValue) setMonthYear(newValue);
                  }}
                  slotProps={{
                    textField: { size: 'small', variant: 'outlined' },
                  }}
                />
              </LocalizationProvider>
              <Button
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={branchPdfDialog.onTrue}
              >
                Branch Print
              </Button>
            </Stack>
          }
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
      <Dialog fullScreen open={branchPdfDialog.value} onClose={branchPdfDialog.onFalse}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions sx={{ p: 1.5 }}>
            <Button color="inherit" variant="contained" onClick={branchPdfDialog.onFalse}>
              Close
            </Button>
          </DialogActions>
          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <DayBookPdf companyAllData={companyAllData} monthYear={monthYear} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
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
