import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import IncomeNewEditForm from '../income-new-edit-form.jsx';

// ----------------------------------------------------------------------

export default function IncomeCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Income"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Income List',
            href: paths.dashboard.accounting.income.list,
          },
          { name: 'New Income' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <IncomeNewEditForm />
    </Container>
  );
}
