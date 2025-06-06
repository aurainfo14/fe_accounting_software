import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useState } from 'react';
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
  TableSelectedAction,
  useTable,
} from 'src/components/table/index.js';
import axios from 'axios';
import ExpenceTypeToolbar from '../expence-type-toolbar.jsx';
import ExpenceTypeTableFiltersResult from '../expence-type-table-filters-result.jsx';
import ExpenceTypeTableRow from '../expence-type-table-row.jsx';
// import { useGetScheme } from '../../../../../api/scheme.js';
import { useAuthContext } from '../../../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../../../api/config.js';
// import { getResponsibilityValue } from '../../../../../permission/permission.js';
import { LoadingScreen } from '../../../../../components/loading-screen/index.js';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'type', label: 'Type' },
  { id: 'amount', label: 'Amount' },
];

const defaultFilters = {
  name: '',
  isActive: 'all',
};

// ----------------------------------------------------------------------

export default function ExpenceTypeListView({
  expenceTypeTotals,
  setExpenceDetails,
  expenceDetails,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(expenceTypeTotals);
  const [filters, setFilters] = useState(defaultFilters);
  const dataFiltered = applyFilter({
    inputData: expenceTypeTotals,
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


  if (expenceTypeTotals === []) {
    return <LoadingScreen />;
  }

  return (
    <>
      <ExpenceTypeToolbar filters={filters} onFilters={handleFilters} />
      {canReset && (
        <ExpenceTypeTableFiltersResult
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
              backgroundColor: '#2f3944',
            }}
          />
          <TableBody>
            {dataFiltered
              ?.slice(
                table.page * table.rowsPerPage,
                table.page * table.rowsPerPage + table.rowsPerPage
              )
              ?.map((row) => (
                <ExpenceTypeTableRow
                  key={row._id}
                  row={row}
                  selected={table.selected.includes(row._id)}
                  onSelectRow={() => table.onSelectRow(row._id)}
                  onDeleteRow={() => handleDeleteRow(row._id)}
                  onEditRow={() => handleEditRow(row._id)}
                  setExpenceDetails={setExpenceDetails}
                  expenceDetails={expenceDetails}
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
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
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
    inputData = inputData.filter((item) => item?.toLowerCase().includes(name.toLowerCase()));
  }

  return inputData;
}
