import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import EmployeeTableRow from '../employee-table-row';
import EmployeeTableToolbar from '../employee-table-toolbar';
import EmployeeTableFiltersResult from '../employee-table-filters-result';
import { useGetEmployee } from 'src/api/employee';
import axios from 'axios';
import { useAuthContext } from '../../../auth/hooks';
import { LoadingScreen } from '../../../components/loading-screen';
import { fDate } from '../../../utils/format-time';
import { useGetConfigs } from '../../../api/config';
import { getResponsibilityValue } from '../../../permission/permission';
import Tabs from '@mui/material/Tabs';
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Label from '../../../components/label/index.js';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'In Active', label: 'In Active' },
  { value: 'Blocked', label: 'Blocked' },
];
const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'branchname', label: 'Branch' },
  { id: 'contact', label: 'Contact' },
  { id: 'joiningDate', label: 'Joining date' },
  { id: 'role', label: 'Role' },
  { id: 'status', label: 'Status' },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: '',
  status: 'all',
};

// ----------------------------------------------------------------------

export default function EmployeeListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const { user } = useAuthContext();
  const { employee, mutate, employeeLoading } = useGetEmployee();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(employee);
  const [filters, setFilters] = useState(defaultFilters);
  const { configs } = useGetConfigs();
  const [options, setOptions] = useState([]);

  const dataFiltered = applyFilter({
    inputData: employee,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });
  useEffect(() => {
    fetchStates();
  }, [employee]);

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

  const handleDelete = async (id) => {
    if (!getResponsibilityValue('delete_employee', configs, user)) {
      enqueueSnackbar('You do not have permission to delete.', { variant: 'error' });
      return;
    }
    try {
      const res = await axios.delete(`${import.meta.env.VITE_BASE_URL}/${user?.company}/employee`, {
        data: { ids: id },
      });
      confirm.onFalse();
      mutate();
      enqueueSnackbar(res.data.message);
    } catch (err) {
      enqueueSnackbar('Failed to delete Employee');
    }
  };

  const handleDeleteRow = useCallback(
    (id) => {
      if (id) {
        handleDelete([id]);
        table.onUpdatePageDeleteRow(dataInPage.length);
      }
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = employee.filter((row) => table.selected.includes(row._id));
    const deleteIds = deleteRows.map((row) => row.user._id);
    handleDelete(deleteIds);
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.employee.edit(id));
    },
    [router]
  );
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );
  const employees = employee?.map((item) => ({
    Name: `${item?.user?.firstName} ${item?.user?.middleName} ${item?.user?.lastName}`,
    Email: item?.user?.email,
    Contact: item?.user?.contact,
    DOB: fDate(item?.dob),
    'Aadhar card': item?.aadharCard,
    'Pan card': item?.panCard,
    'Driving license': item?.drivingLicense,
    'Voter id': item?.voterCard,
    role: item?.user?.role,
    'Joining Date:': fDate(item?.joiningDate),
    'Reporting to': `${item?.reportingTo?.firstName} ${item?.reportingTo?.middleName} ${item?.reportingTo?.lastName}`,
    Branch: item?.user?.branch?.name,
    'Permanent address': `${item?.permanentAddress?.street} ${item?.permanentAddress?.landmark} ${item?.permanentAddress?.city} , ${item?.permanentAddress?.state} ${item?.permanentAddress?.country} ${item?.permanentAddress?.zipcode}`,
    Remark: item?.remark,
    Status: item?.status,
  }));

  if (employeeLoading) {
    return <LoadingScreen />;
  }

  function fetchStates() {
    dataFiltered?.map((data) => {
      setOptions((item) => {
        if (!item.find((option) => option?.role === data?.user.role)) {
          return [...item, data.user.role];
        } else {
          return item;
        }
      });
    });
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Employees"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Employee', href: paths.dashboard.employee.root },
            { name: 'List' },
          ]}
          action={
            getResponsibilityValue('create_employee', configs, user) && (
              <Button
                component={RouterLink}
                href={paths.dashboard.employee.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Add Employee
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'Active' && 'success') ||
                      (tab.value === 'In Active' && 'warning') ||
                      (tab.value === 'Blocked' && 'error') ||
                      'default'
                    }
                  >
                    {['Active', 'In Active', 'Blocked'].includes(tab.value)
                      ? employee.filter((user) => user.status === tab.value).length
                      : employee.length}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <EmployeeTableToolbar
            filters={filters}
            onFilters={handleFilters}
            employees={employees}
            employeeData={dataFiltered}
            options={options}
          />
          {canReset && (
            <EmployeeTableFiltersResult
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
                  dataFiltered.map((row) => row.id)
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
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row._id)
                  )
                }
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
                    <EmployeeTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onDeleteRow={() => handleDeleteRow(row.user._id)}
                      onEditRow={() => handleEditRow(row.user._id)}
                      loginuser={user}
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
  const { name, role, status } = filters;

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
        (
          item.user.firstName &&
          item.user.firstName + ' ' + item.user.middleName + ' ' + item.user.lastName
        )
          .toLowerCase()
          .includes(name.toLowerCase()) ||
        item.user.firstName.toLowerCase().includes(name.toLowerCase()) ||
        item.user.middleName.toLowerCase().includes(name.toLowerCase()) ||
        item.user.lastName.toLowerCase().includes(name.toLowerCase()) ||
        item.user.contact.includes(name)
    );
  }
  if (role) {
    inputData = inputData.filter((item) => item?.user?.role === role);
  }
  if (status !== 'all') {
    inputData = inputData.filter((item) => item.status === status);
  }
  return inputData;
}
