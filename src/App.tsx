import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Loader from './common/Loader';
import routes from './routes';
import ECommerce from './pages/Dashboard/ECommerce';
import AcceptQuotation from './pages/ActivityModule/AcceptQuotation';
import UserRoot from './pages/Authentication/UserRoot';
import ThankYouPage from './pages/ActivityModule/ThankYouPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'simple-datatables/src/css/style.css';
import ValuationPage from './pages/Valuation/ValuationPage';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let token = localStorage.getItem('token') || '';
    setToken(token);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <div className='h-screen'>
      <Loader />
    </div>
  ) : (
    <>
      <Toaster position='top-right' reverseOrder={false} containerClassName='overflow-auto' />
      <ToastContainer />
      <Routes>
        {token ? <>
          <Route element={<DefaultLayout />}>
            <Route path="/*" element={<Navigate to="/" />} key="root-dashboard" />
            <Route path='/' element={<ECommerce />} />
            {routes.map(({ path, component: Component  }) => (
              <Route
                path={path}
                key={path}
                element={
                  <Suspense fallback={<Loader />}>
                    <Component   />
                  </Suspense>
                }
              />
            ))}
          </Route>
            <Route path='/intake/:type/:Id/' element={< ValuationPage/>} />
            <Route path='/intake' element={< ValuationPage/>} />
            </>
            : <>
            <Route path="/login" element={<UserRoot />} key="root-login" />
            <Route path="/*" element={<Navigate to="/login" />} key="root-login" />
          </>}

        <Route path="/quotes/accept/:invoiceId" element={<AcceptQuotation />} />
        <Route path="/thankyou" element={<ThankYouPage />} />
      </Routes>
    </>
  );
}

export default App;
