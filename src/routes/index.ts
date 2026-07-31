import { lazy } from 'react';

import Customers from '../pages/customers';
import FinancePage from '../pages/FinancePage.jsx';
import Communication from '../pages/communication';
// import Resources from '../pages/resources';
import CustomerDetail from '../pages/customerDetails/CustomerDetail.jsx';
import NotificationCard from '../Notification/NotificationPage';
import Agentslist from '../agents/Agentslist';
import NewInvoice from "../pages/InvoicePage/NewInvoice"
import EditInvoice from "../pages/InvoicePage/Editinvoice.jsx";
import NewOffer from '../pages/Quotes/NewOffer.jsx';
import Editoffer from '../pages/Quotes/Editoffer.jsx';
import OfferDetail from '../pages/Quotes/OfferDetail.jsx';
import Method from '../pages/Methods/Method.jsx';
import HrmPage from '../pages/HRM/HrmPage.jsx';
import InvoiceDetailpage from '../pages/InvoicePage/InvoiceDetailpage.jsx';
import TaskPage from '../pages/Taskcomponent/TaskPage.jsx';
import JobDetailPage from '../pages/Jobpage/JobDetailPage.js';
import DataComponent from '../pages/DynamicData/DataComponent.js';

const Calendar = lazy(() => import('../pages/Calendar'));
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Services from '../pages/Admin/Services.js';
import ResourcesPage from '../pages/Resources/ResourcesPage.js';
import LeadsPage from '../pages/LeadsPage.js';
import LeadDetail from '../pages/UserLeads/LeadDetail.js';

const coreRoutes = [
  {
    path: '/calendar',
    title: 'Calender',
    component: Calendar,
  },
  {
    path: '/profile',
    title: 'Profile',
    component: Profile,
  },
  {
    path: '/tasks',
    title: 'Tasks',
    component: TaskPage,
  },
  {
    path: '/offer/:Id',
    title: 'editoffer',
    component: Editoffer,
  },
  {
    path: '/offer-detail/:Id',
    title: 'offer-detail',
    component: OfferDetail,
  },
  {
    path: '/new_offer',
    title: 'newoffer',
    component: NewOffer,
  },

  {
    path: '/jobs',
    title: 'jobs',
    component: JobDetailPage,
  },
  {
    path: '/data',
    title: 'data',
    component: DataComponent,
  },
  {
    path: '/customers',
    title: 'customers',
    component: Customers,
  },
  {
    path: '/leads',
    title: 'customers',
    component: LeadsPage,
  },
  {
    path: '/customers/:id',
    title: 'customerDetail',
    component: CustomerDetail,
  },
  {
    path: '/leads/:id',
    title: 'Detail',
    component: LeadDetail,
  },
  {
    path: '/finance',
    title: 'finance',
    component: FinancePage,
  },
  {
    path: '/newinvoice',
    title: 'newinvoice',
    component: NewInvoice,
  },
  {
    path: '/invoice/:Id',
    title: 'editinvoice',
    component: EditInvoice,
  },
  {
    path: '/invoice-detail/:Id',
    title: 'invoiceDetail',
    component: InvoiceDetailpage,
  },
  {
    path: '/resources',
    title: 'resources',
    component: ResourcesPage,
  },
  {
    path: '/HRM',
    title: 'HRM',
    component: HrmPage,
  },
  {
    path: '/dropdownNotification',
    title: 'dropdownNotification',
    component: NotificationCard,
  },
  {
    path: '/communication',
    title: 'communication',
    component: Communication,
  },
  {
    path: '/settings',
    title: 'Settings',
    component: Settings,
  },
  {
    path: '/settings/services',
    title: 'Settings',
    component: Services,
  },
  {
    path: '/settings/workflows',
    title: 'workflows',
    component: Method,
  },
  {
    path: '/agents',
    title: 'Agents',
    component: Agentslist,
  },

];

const routes = [...coreRoutes];
export default routes;
