import { Navigate, useRoutes } from 'react-router-dom';
import MainLayout from 'src/layouts/main';
import { authRoutes } from './auth';
import { authDemoRoutes } from './auth-demo';
import { mainRoutes } from './main';
import { dashboardRoutes } from './dashboard';
import { componentsRoutes } from './components';
import AuthClassicLayout from '../../layouts/auth/classic.jsx';
import LoginPage from '../../pages/auth/jwt/login.jsx';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    // SET INDEX PAGE WITH SKIP HOME PAGE
    // {
    //   path: '/',
    //   element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    // },

    // ----------------------------------------------------------------------

    // SET INDEX PAGE WITH HOME PAGE
    {
      path: '/',
      element: (
        <MainLayout>
          <AuthClassicLayout>
            <LoginPage />
          </AuthClassicLayout>
        </MainLayout>
      ),
    },

    // Auth routes
    ...authRoutes,
    ...authDemoRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Main routes
    ...mainRoutes,

    // Components routes
    ...componentsRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
