import { lazy } from 'react';

import Customers from '../pages/customers';

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
import MyLeavesPage from '../pages/HRM/MyLeavesPage.jsx';
import MyHoursPage from '../pages/HRM/MyHoursPage.jsx';
import MyDeclarationsPage from '../pages/HRM/MyDeclarationsPage.jsx';
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
import OffersPage from '../pages/OffersPage.jsx';
import InvoiceListPage from '../pages/InvoiceListPage.jsx';
import Jobslider from '../pages/Jobpage/Jobslider.js';
import WorkPage from '../pages/Work/WorkPage';
import DamageClaimsPage from '../pages/DamageClaims/DamageClaimsPage.jsx';

const coreRoutes = [
  {
    path: '/work',
    title: 'Work',
    access: 'Work',
    component: WorkPage,
  },
  {
    path: '/calendar',
    title: 'Calender',
    access: 'Planning',
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
    access: 'Tasks',
    component: TaskPage,
  },
  {
    path: '/offer/:Id',
    title: 'editoffer',
    access: 'Finance',
    component: Editoffer,
  },
  {
    path: '/offer-detail/:Id',
    title: 'offer-detail',
    access: 'Finance',
    component: OfferDetail,
  },
  {
    path: '/new_offer',
    title: 'newoffer',
    access: 'Finance',
    component: NewOffer,
  },
  {
    path: '/jobs',
    title: 'jobs',
    access: 'Jobs',
    component: JobDetailPage,
  },
  {
    path: '/jobs/:id',
    title: 'jobs details',
    access: 'Jobs',
    component: Jobslider,
  },
  {
    path: '/data',
    title: 'data',
    access: 'Features',
    component: DataComponent,
  },
  {
    path: '/customers',
    title: 'customers',
    access: 'Customer',
    component: Customers,
  },
  {
    path: '/leads',
    title: 'customers',
    access: 'Leads',
    component: LeadsPage,
  },
  {
    path: '/customers/:id',
    title: 'customerDetail',
    access: 'Customer',
    component: CustomerDetail,
  },
  {
    path: '/leads/:id',
    title: 'Detail',
    access: 'Leads',
    component: LeadDetail,
  },
  {
    path: '/quotes',
    title: 'Quotes',
    access: 'Finance',
    component: OffersPage,
  },
  {
    path: '/invoices',
    title: 'Invoices',
    access: 'Finance',
    component: InvoiceListPage,
  },
  {
    path: '/newinvoice',
    title: 'newinvoice',
    access: 'Finance',
    component: NewInvoice,
  },
  {
    path: '/invoice/:Id',
    title: 'editinvoice',
    access: 'Finance',
    component: EditInvoice,
  },
  {
    path: '/invoice-detail/:Id',
    title: 'invoiceDetail',
    access: 'Finance',
    component: InvoiceDetailpage,
  },
  {
    path: '/resources',
    title: 'resources',
    access: 'Resources',
    component: ResourcesPage,
  },
  {
    path: '/claims',
    title: 'Damage Claims',
    access: 'Claims',
    component: DamageClaimsPage,
  },
  {
    path: '/HRM',
    title: 'HRM',
    access: 'HRM',
    component: HrmPage,
  },
  {
    path: '/my-leaves',
    title: 'My Leaves',
    component: MyLeavesPage,
  },
  {
    path: '/my-hours',
    title: 'My Hours',
    component: MyHoursPage,
  },
  {
    path: '/my-declarations',
    title: 'My Declarations',
    component: MyDeclarationsPage,
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
    access: 'Settings',
    component: Settings,
  },
  {
    path: '/settings/services',
    title: 'Settings',
    access: 'Settings',
    component: Services,
  },
  {
    path: '/settings/workflows',
    title: 'workflows',
    access: 'Settings',
    component: Method,
  },
  {
    path: '/agents',
    title: 'Agents',
    access: 'HRM',
    component: Agentslist,
  },
];

const routes = [...coreRoutes];
export default routes;
