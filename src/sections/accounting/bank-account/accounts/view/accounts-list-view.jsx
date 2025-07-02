import isEqual from 'lodash/isEqual';
import { useCallback, useState } from 'react';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { paths } from 'src/routes/paths.js';
import { useRouter } from 'src/routes/hooks/index.js';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
import { useSnackbar } from 'src/components/snackbar/index.js';
import { ConfirmDialog } from 'src/components/custom-dialog/index.js';
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

import axios from 'axios';

import AccountsToolbar from '../accounts-toolbar.jsx';
import AccountsTableFiltersResult from '../accounts-table-filters-result.jsx';
import AccountsTableRow from '../accounts-table-row.jsx';
import { useAuthContext } from '../../../../../auth/hooks/index.js';
import { LoadingScreen } from '../../../../../components/loading-screen/index.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'accountName', label: 'Bank Acc.' },
  { id: 'amount', label: 'Balance' },
];

const defaultFilters = {
  name: '',
  isActive: 'all',
};

// ----------------------------------------------------------------------

export default function AccountsListView({ accounts, setAccountDetails, accountDetails }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(accounts);
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: accounts,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered?.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered?.length && canReset) || !dataFiltered?.length;

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

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/scheme`,
        {
          data: { ids: id },
        }
      );
      enqueueSnackbar(res.data.message);
      confirm.onFalse();
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to delete Scheme');
    }
  };

  const handleDeleteRow = useCallback(
    (id) => {
      handleDelete([id]);

      table.onUpdatePageDeleteRow(dataInPage?.length);
    },
    [dataInPage?.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = scheme.filter((row) => table.selected.includes(row._id));
    const deleteIds = deleteRows.map((row) => row._id);
    handleDelete(deleteIds);
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage?.length,
      totalRowsFiltered: dataFiltered?.length,
    });
  }, [dataFiltered?.length, dataInPage?.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.scheme.edit(id));
    },
    [router]
  );

  if (accounts === []) {
    return <LoadingScreen />;
  }

  return (
    <>
      <AccountsToolbar filters={filters} onFilters={handleFilters} />
      {canReset && (
        <AccountsTableFiltersResult
          filters={filters}
          onFilters={handleFilters}
          onResetFilters={handleResetFilters}
          results={dataFiltered?.length}
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
          numSelected={table.selected?.length}
          rowCount={dataFiltered?.length}
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
        <Table size={table.dense ? 'small' : 'medium'}>
          <TableHeadCustom
            order={table.order}
            orderBy={table.orderBy}
            headLabel={TABLE_HEAD}
            rowCount={dataFiltered?.length}
            numSelected={table.selected?.length}
            onSort={table.onSort}
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1000,
            }}
          />
          <TableBody>
            {dataFiltered
              ?.slice(
                table.page * table.rowsPerPage,
                table.page * table.rowsPerPage + table.rowsPerPage
              )
              .map((row) => (
                <AccountsTableRow
                  key={row._id}
                  row={row}
                  selected={table.selected.includes(row._id)}
                  onSelectRow={() => table.onSelectRow(row._id)}
                  onDeleteRow={() => handleDeleteRow(row._id)}
                  onEditRow={() => handleEditRow(row._id)}
                  setAccountDetails={setAccountDetails}
                  accountDetails={accountDetails}
                />
              ))}
            <TableEmptyRows
              height={denseHeight}
              emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered?.length)}
            />
            <TableNoData notFound={notFound} />
          </TableBody>
        </Table>
      </TableContainer>
      <TablePaginationCustom
        sx={{
          '.css-n3104v-MuiToolbar-root-MuiTablePagination-toolbar': { p: 0, overflow: 'hidden' },
        }}
        count={dataFiltered.length}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected?.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------
function applyFilter({ inputData, comparator, filters }) {
  const { isActive, name } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);
  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis?.map((el) => el[0]);

  if (name && name.trim()) {
    inputData = inputData.filter((item) =>
      item?.bankName?.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (isActive !== 'all') {
    inputData = inputData.filter((scheme) => scheme.isActive === (isActive == 'true'));
  }

  return inputData;
}
