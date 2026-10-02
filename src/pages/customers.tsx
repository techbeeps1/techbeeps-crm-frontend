import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiPath } from '../../apiPath';
import CustomerList from './customerDetails/CustomerList';
import Loader from '../common/Loader';
import { OfflineNoticeCard } from '../components/OfflineNoticeCard';

const Customers = () => {
  const [customersList, setCustomersList] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${apiPath}/customer/customerList?type=Customer`,
        { headers }
      );
      setCustomersList(response.data.customers || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to connect and fetch customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();

    const handleReconnected = () => {
      fetchCustomers();
    };
    window.addEventListener('app:network-reconnected', handleReconnected);
    return () => {
      window.removeEventListener('app:network-reconnected', handleReconnected);
    };
  }, []);

  if (loading && (!customersList || customersList.length === 0)) {
    return <Loader />;
  }

  if (error && (!customersList || customersList.length === 0)) {
    return (
      <div className="w-full min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2 p-4 flex items-center justify-center">
        <OfflineNoticeCard
          title="Unable to Load Customers"
          message={error}
          onRetry={fetchCustomers}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2">
      <CustomerList data={customersList} fetchCustomer={fetchCustomers} type="Customer" />
    </div>
  );
};

export default Customers;

