import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import IncomeNewEditForm from '../income-new-edit-form.jsx';
import { useParams } from '../../../../routes/hooks/index.js';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import { Box } from '@mui/material';
import { useGetIncome } from '../../../../api/income.js';

// ----------------------------------------------------------------------

export default function IncomeEditView() {
  const { income } = useGetIncome();
  const settings = useSettingsContext();
  const { id } = useParams();

  const currentIncome = income.find((otherIncome) => otherIncome._id === id);
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
            name: 'Other Income List',
            href: paths.dashboard.accounting.income.list,
          },
          { name: currentIncome?.otherIncomeType },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentIncome ? (
        <IncomeNewEditForm currentIncome={currentIncome} />
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

IncomeEditView.propTypes = {
  id: PropTypes.string,
};
