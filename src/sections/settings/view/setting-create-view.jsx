import React, { useCallback, useState } from 'react';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import CompanyProfile from './company-profile-create-view';
import PermissionView from './permission-view';
import Rolescreatepage from './roles-crete-view';
import BranchCreateView from './branch-create-view';
import ExpenseTypeCreteView from './expense-type-crete-view.jsx';
import IncomeTypeCreteView from './income-type-crete-view.jsx';
import BankAccountCreateView from './bank-account-create-view.jsx';

const TABS = [
  {
    value: 'Company Profile',
    label: 'Company Profile',
    icon: <Iconify icon="mdi:company" width={24} />,
  },
  {
    value: 'Bank-Account',
    label: 'Bank-Account',
    icon: <Iconify icon="carbon:branch" width={24} />,
  },
  {
    value: 'Branch',
    label: 'Branch',
    icon: <Iconify icon="carbon:branch" width={24} />,
  },
  {
    value: 'Income type',
    label: 'Income type',
    icon: <Iconify icon="icon-park-outline:income" width={24} />,
  },
  {
    value: 'Expense type',
    label: 'Expense type',
    icon: <Iconify icon="arcticons:expense-manager-2" width={24} />,
  },
  {
    value: 'Roles',
    label: 'Roles',
    icon: <Iconify icon="oui:app-users-roles" width={24} />,
  },
  {
    value: 'Permission',
    label: 'Permission',
    icon: <Iconify icon="mdi:eye-lock" width={24} />,
  },
];

export default function SettingsPage() {
  const settings = useSettingsContext();
  const [currentTab, setCurrentTab] = useState('Company Profile');
  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Settings"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Settings' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
        </Tabs>
        {currentTab === 'Company Profile' && <CompanyProfile />}
        {currentTab === 'Roles' && <Rolescreatepage setTab={setCurrentTab} />}
        {currentTab === 'Permission' && <PermissionView />}
        {currentTab === 'Branch' && <BranchCreateView />}
        {currentTab === 'Expense type' && <ExpenseTypeCreteView />}
        {currentTab === 'Income type' && <IncomeTypeCreteView />}
        {currentTab === 'Bank-Account' && <BankAccountCreateView />}
      </Container>
    </>
  );
}
