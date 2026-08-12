import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiPath } from '../../apiPath';

import Loader from '../common/Loader';
import UserLeadList from './UserLeads/UserLeadList';

const LeadsPage = () => {
  const [customersList, setCustomersList] = useState([] as any);
  const [loading, setLoading] = useState(false);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiPath}/leads/leadList`,
      );
      setCustomersList(response.data.leads);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, []);

  if (loading) {
    return <Loader />
  }

  return (
    <div className="w-full min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2 overflow-y-auto">
      {loading ? (
        <Loader />
      ) : (
        <UserLeadList data={customersList} fetchCustomer={fetchCustomers} />
      )}
    </div>
  );
};

export default LeadsPage;

