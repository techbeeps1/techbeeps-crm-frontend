import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiPath } from '../../apiPath';
import CustomerList from './customerDetails/CustomerList';
import Loader from '../common/Loader';

const Customers = () => {
  const [customersList, setCustomersList] = useState([] as any);
  const [loading, setLoading] = useState(false);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiPath}/customer/customerList?type=Customer`,
      );
      setCustomersList(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2">
      {loading ? (
        <Loader />
      ) : (
        <CustomerList data={customersList} fetchCustomer={fetchCustomers} type="Customer" />
      )}
    </div>
  );
};

export default Customers;

