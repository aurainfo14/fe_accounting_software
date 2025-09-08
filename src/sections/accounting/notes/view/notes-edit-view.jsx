import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import { LoadingScreen } from 'src/components/loading-screen/index.js';
import { useGetNote } from 'src/api/notes.js';
import NotesNewEditForm from '../notes-new-edit-form.jsx';

// ----------------------------------------------------------------------

export default function NotesEditView() {
  const settings = useSettingsContext();
  const params = useParams();
  const { note, noteLoading } = useGetNote(params.id);

  if (noteLoading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Edit Note'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Notes',
            href: paths.dashboard.accounting.notes.list,
          },
          { name: note?.title || 'Edit Note' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <NotesNewEditForm currentNote={note} />
    </Container>
  );
}
