import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import NotesNewEditForm from '../notes-new-edit-form.jsx';

// ----------------------------------------------------------------------

export default function NotesCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Create a new Note'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Notes',
            href: paths.dashboard.accounting.notes.list,
          },
          { name: 'New Note' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <NotesNewEditForm />
    </Container>
  );
}
