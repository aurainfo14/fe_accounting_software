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
      // OVERVIEW
      // ----------------------------------------------------------------------
      // {
      //   subheader: t('overview'),
      //   items: [
      //     {
      //       title: t('app'),
      //       path: paths.dashboard.root,
      //       icon: ICONS.dashboard,
      //     },
      //     {
      //       title: t('ecommerce'),
      //       path: paths.dashboard.general.ecommerce,
      //       icon: ICONS.ecommerce,
      //     },
      //     {
      //       title: t('analytics'),
      //       path: paths.dashboard.general.analytics,
      //       icon: ICONS.analytics,
      //     },
      //     {
      //       title: t('banking'),
      //       path: paths.dashboard.general.banking,
      //       icon: ICONS.banking,
      //     },
      //     {
      //       title: t('booking'),
      //       path: paths.dashboard.general.booking,
      //       icon: ICONS.booking,
      //     },
      //     {
      //       title: t('file'),
      //       path: paths.dashboard.general.file,
      //       icon: ICONS.file,
      //     },
      //   ],
      // },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // USER
          // {
          //   title: t('user'),
          //   path: paths.dashboard.user.root,
          //   icon: ICONS.user,
          //   children: [
          //     { title: t('profile'), path: paths.dashboard.user.root },
          //     { title: t('cards'), path: paths.dashboard.user.cards },
          //     { title: t('list'), path: paths.dashboard.user.list },
          //     { title: t('create'), path: paths.dashboard.user.new },
          //     { title: t('edit'), path: paths.dashboard.user.demo.edit },
          //     { title: t('account'), path: paths.dashboard.user.account },
          //   ],
          // },
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

          // PRODUCT
          // {
          //   title: t('product'),
          //   path: paths.dashboard.product.root,
          //   icon: ICONS.product,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.product.root },
          //     {
          //       title: t('details'),
          //       path: paths.dashboard.product.demo.details,
          //     },
          //     { title: t('create'), path: paths.dashboard.product.new },
          //     { title: t('edit'), path: paths.dashboard.product.demo.edit },
          //   ],
          // },

          // ORDER
          // {
          //   title: t('order'),
          //   path: paths.dashboard.order.root,
          //   icon: ICONS.order,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.order.root },
          //     { title: t('details'), path: paths.dashboard.order.demo.details },
          //   ],
          // },

          // INVOICE
          //   {
          //     title: t('invoice'),
          //     path: paths.dashboard.invoice.root,
          //     icon: ICONS.invoice,
          //     children: [
          //       { title: t('list'), path: paths.dashboard.invoice.root },
          //       {
          //         title: t('details'),
          //         path: paths.dashboard.invoice.demo.details,
          //       },
          //       { title: t('create'), path: paths.dashboard.invoice.new },
          //       { title: t('edit'), path: paths.dashboard.invoice.demo.edit },
          //     ],
          //   },
          //
          //   // BLOG
          //   {
          //     title: t('blog'),
          //     path: paths.dashboard.post.root,
          //     icon: ICONS.blog,
          //     children: [
          //       { title: t('list'), path: paths.dashboard.post.root },
          //       { title: t('details'), path: paths.dashboard.post.demo.details },
          //       { title: t('create'), path: paths.dashboard.post.new },
          //       { title: t('edit'), path: paths.dashboard.post.demo.edit },
          //     ],
          //   },
          //
          //   // JOB
          //   {
          //     title: t('job'),
          //     path: paths.dashboard.job.root,
          //     icon: ICONS.job,
          //     children: [
          //       { title: t('list'), path: paths.dashboard.job.root },
          //       { title: t('details'), path: paths.dashboard.job.demo.details },
          //       { title: t('create'), path: paths.dashboard.job.new },
          //       { title: t('edit'), path: paths.dashboard.job.demo.edit },
          //     ],
          //   },
          //
          //   // TOUR
          //   {
          //     title: t('tour'),
          //     path: paths.dashboard.tour.root,
          //     icon: ICONS.tour,
          //     children: [
          //       { title: t('list'), path: paths.dashboard.tour.root },
          //       { title: t('details'), path: paths.dashboard.tour.demo.details },
          //       { title: t('create'), path: paths.dashboard.tour.new },
          //       { title: t('edit'), path: paths.dashboard.tour.demo.edit },
          //     ],
          //   },
          //
          //   // FILE MANAGER
          //   {
          //     title: t('file_manager'),
          //     path: paths.dashboard.fileManager,
          //     icon: ICONS.folder,
          //   },
          //
          //   // MAIL
          //   {
          //     title: t('mail'),
          //     path: paths.dashboard.mail,
          //     icon: ICONS.mail,
          //     info: <Label color="error">+32</Label>,
          //   },
          //
          //   // CHAT
          //   {
          //     title: t('chat'),
          //     path: paths.dashboard.chat,
          //     icon: ICONS.chat,
          //   },
          //
          //   // CALENDAR
          //   {
          //     title: t('calendar'),
          //     path: paths.dashboard.calendar,
          //     icon: ICONS.calendar,
          //   },
          //
          //   // KANBAN
          //   {
          //     title: t('kanban'),
          //     path: paths.dashboard.kanban,
          //     icon: ICONS.kanban,
          //   },
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
