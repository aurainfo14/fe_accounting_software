import { useMemo } from 'react';
import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales';
import SvgColor from 'src/components/svg-color';
import Iconify from '../../components/iconify/index.js';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  setting: <Iconify icon="solar:settings-bold-duotone" width={24} />,
  accountimng: <Iconify icon="fluent:building-bank-toolbox-20-regular" width={24} />,
  cashInHand: <Iconify icon="game-icons:take-my-money" width={27} />,
  bankAccount: <Iconify icon="clarity:bank-solid" width={24} />,
  expense: <Iconify icon="game-icons:money-stack" width={24} />,
  payment: <Iconify icon="icon-park-outline:exchange-three" width={24} />,
  income: <Iconify icon="streamline-freehand:money-coin-cash" width={24} />,
  dayBook: <Iconify icon="simple-line-icons:calender" width={20} />,
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useTranslate();

  const data = useMemo(
    () => [
      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          {
            title: t('cash in'),
            path: paths.dashboard.accounting.cashIn,
            icon: ICONS.cashInHand,
          },
          {
            title: t('bank account'),
            path: paths.dashboard.accounting.bankAccount,
            icon: ICONS.bankAccount,
          },
          {
            title: t('Expence'),
            path: paths.dashboard.accounting.expense.list,
            icon: ICONS.expense,
          },
          {
            title: t('payment in out'),
            path: paths.dashboard.accounting['payment-in-out'].list,
            icon: ICONS.payment,
          },
          {
            title: t('income'),
            path: paths.dashboard.accounting.income.list,
            icon: ICONS.income,
          },
          {
            title: t('day book'),
            path: paths.dashboard.accounting['day-book'].list,
            icon: ICONS.dayBook,
          },
        ],
      },
      {
        subheader: t('config'),
        items: [
          {
            title: t('setting'),
            path: paths.dashboard.setting,
            icon: ICONS.setting,
          },
        ],
      },
    ],
    [t]
  );

  return data;
}
