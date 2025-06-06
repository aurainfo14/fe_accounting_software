import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import CashInNewEditForm from '../cash-in-new-edit-form.jsx';
import { useGetScheme } from '../../../../api/scheme.js';
import { useParams } from '../../../../routes/hooks/index.js';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

export default function CashInEditView() {
  const settings = useSettingsContext();
  const { scheme } = useGetScheme();
  const { id } = useParams();

  const currentScheme = scheme.find((scheme) => scheme._id === id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Scheme List',
            href: paths.dashboard.scheme.root,
          },
          { name: currentScheme?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentScheme ? (
        <CashInNewEditForm currentScheme={currentScheme} />
      ) : (
        <Box
          sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <LoadingScreen />
        </Box>
      )}
    </Container>
  );
}

CashInEditView.propTypes = {
  id: PropTypes.string,
};
