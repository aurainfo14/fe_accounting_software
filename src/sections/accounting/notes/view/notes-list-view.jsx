import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { RouterLink } from 'src/routes/components/index.js';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
import { useSnackbar } from 'src/components/snackbar/index.js';
import { ConfirmDialog } from 'src/components/custom-dialog/index.js';
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
import NotesTableToolbar from '../notes-table-toolbar.jsx';
import NotesTableRow from '../notes-table-row.jsx';
import { Grid } from '@mui/material';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import Typography from '@mui/material/Typography';
import { isBetween } from '../../../../utils/format-time.js';
import NotesTableFiltersResult from '../notes-table-filters-result.jsx';
import { useAuthContext } from '../../../../auth/hooks/index.js';
import { useGetNotes, deleteNote } from '../../../../api/notes.js';
import { useHotkeys } from 'react-hotkeys-hook';
import { useGetBranch } from '../../../../api/branch.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'title', label: 'Title', width: 150 },
  { id: 'description', label: 'Description', width: 200 },
  { id: 'date', label: 'Date', width: 120 },
  { id: 'branch', label: 'Branch', width: 100 },
  { id: 'invoice', label: 'Invoice Files', width: 200 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  startDate: null,
  endDate: null,
  branch: {},
};

// ----------------------------------------------------------------------

export default function NotesListView() {
  const { notes, notesLoading, mutate } = useGetNotes();
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { user } = useAuthContext();
  const { branch, branchLoading } = useGetBranch();
  const [tableData, setTableData] = useState(notes);
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState([]);
  const buttonRef = useRef(null);

  const dataFiltered = applyFilter({
    inputData: notes,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  useHotkeys('ctrl+space', () => {
    if (buttonRef.current) {
      buttonRef.current.click();
    }
  }, [buttonRef]);

  useEffect(() => {
    setTableData(notes);
  }, [notes]);

  useEffect(() => {
    if (branch && Array.isArray(branch)) {
      const branchOptions = branch.map((branchItem) => ({
        label: branchItem.branchName,
        value: branchItem._id,
      }));
      setOptions(branchOptions);
    }
  }, [branch]);

  const dataInPage = dataFiltered?.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 76;

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

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await deleteNote(id, user);
        mutate();
        enqueueSnackbar('Note deleted successfully');
      } catch (error) {
        enqueueSnackbar('Error deleting note', { variant: 'error' });
      }
    },
    [mutate, enqueueSnackbar, user]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.accounting.notes.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.accounting.notes.edit(id));
    },
    [router]
  );

  if (notesLoading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Notes"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Notes',
            href: paths.dashboard.accounting.notes.list,
          },
          { name: 'List' },
        ]}
        action={
          <Button
            ref={buttonRef}
            component={RouterLink}
            href={paths.dashboard.accounting.notes.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Note
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>
        <NotesTableToolbar
          filters={filters}
          onFilters={handleFilters}
          canReset={canReset}
          onResetFilters={handleResetFilters}
          options={options}
          notesData={dataFiltered}
        />

        {canReset && (
          <NotesTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
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
                  <Iconify icon="solar:trash-bin-trash-bold-duotone" />
                </IconButton>
              </Tooltip>
            }
          />

          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1300 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={dataFiltered.length}
              onSort={table.onSort}
            />

            <TableBody>
              {dataInPage.map((row, index) => (
                <NotesTableRow
                  key={row._id}
                  row={row}
                  onDeleteRow={() => handleDeleteRow(row._id)}
                  onEditRow={() => handleEditRow(row._id)}
                  onViewRow={() => handleViewRow(row._id)}
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
              handleDeleteRow(table.selected);
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, startDate, endDate, branch } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (note) =>
        note.title.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        note.description.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (startDate && endDate) {
    inputData = inputData.filter((note) =>
      isBetween(new Date(note.date), new Date(startDate), new Date(endDate))
    );
  }

  if (branch && branch.value && branch.value !== 'all') {
    inputData = inputData.filter((note) => note.branch?._id === branch.value);
  }

  return inputData;
}
