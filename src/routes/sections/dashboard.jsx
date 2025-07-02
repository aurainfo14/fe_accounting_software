import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';
import { SettingsPage } from '../../sections/settings/view/index.js';
import CashInListView from '../../sections/accounting/cash-in/view/cash-in-list-view.jsx';
import BankAccountListView from '../../sections/accounting/bank-account/view/bank-account-list-view.jsx';
import PaymentInOutListView from '../../sections/accounting/payment-in-out/view/payment-in-out-list-view.jsx';
import PaymentInOutCreateView from '../../sections/accounting/payment-in-out/view/payment-in-out-create-view.jsx';
import PaymentInOutEditView from '../../sections/accounting/payment-in-out/view/payment-in-out-edit-view.jsx';
import ExpenceListView from '../../sections/accounting/expence/view/expence-list-view.jsx';
import ExpenceEditView from '../../sections/accounting/expence/view/expence-edit-view.jsx';
import ExpenceCreateView from '../../sections/accounting/expence/view/expence-create-view.jsx';
import IncomeListView from '../../sections/accounting/income/view/income-list-view.jsx';
import IncomeCreateView from '../../sections/accounting/income/view/income-create-view.jsx';
import IncomeEditView from '../../sections/accounting/income/view/income-edit-view.jsx';
import DayBookListView from '../../sections/accounting/day-book/view/day-book-list-view.jsx';
import MyProfile from '../../sections/settings/view/my-profile-create-view.jsx';

// ----------------------------------------------------------------------

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <IndexPage />, index: true },
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      {
        path: 'user',
        children: [
          { element: <MyProfile />, index: true },
          { path: 'profile', element: <MyProfile /> },
        ],
      },
      {
        path: 'accounting',
        children: [
          { element: <CashInListView />, index: true },
          { path: 'cash-in', element: <CashInListView /> },
          { path: 'bank-account', element: <BankAccountListView /> },
          { path: 'payment-in-out/list', element: <PaymentInOutListView /> },
          { path: 'payment-in-out/new', element: <PaymentInOutCreateView /> },
          { path: 'payment-in-out/:id/edit', element: <PaymentInOutEditView /> },
          { path: 'expense/list', element: <ExpenceListView /> },
          { path: 'expense/new', element: <ExpenceCreateView /> },
          { path: 'expense/:id/edit', element: <ExpenceEditView /> },
          { path: 'income/list', element: <IncomeListView /> },
          { path: 'income/new', element: <IncomeCreateView /> },
          { path: 'income/:id/edit', element: <IncomeEditView /> },
          { path: 'day-book/list', element: <DayBookListView /> },
        ],
      },
      { path: 'setting', element: <SettingsPage /> },
    ],
  },
];
