import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import CashInNewEditForm from '../cash-in-new-edit-form.jsx';

// ----------------------------------------------------------------------

export default function CashInCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Scheme"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Scheme List',
            href: paths.dashboard.scheme.root,
          },
          { name: 'New Scheme' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <CashInNewEditForm />
    </Container>
  );
}
