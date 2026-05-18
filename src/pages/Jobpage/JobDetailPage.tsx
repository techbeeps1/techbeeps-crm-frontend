import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  Button,
  Modal,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NewJob from './NewJob';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Jobslider from './Jobslider';
import Loader from '../../common/Loader';
// import { useNavigate } from 'react-router-dom';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Address {
  city: string;
  postcode: string;
  country: string;
}

interface JobData {
  _id: string;
  date: string;
  customer: Customer;
  load: Address;
  unload: Address;
  status: string;
  index: string;
}


const JobDetailPage: React.FC<any> = ({ customerId, offer, invoice }) => {
  const [data, setData] = useState<JobData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<JobData | null>(null);
  const params = new URLSearchParams(window.location.search);
  const value = [...params.keys()][0]

  const handleAllJob = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/jobList?customer=${customerId || ''}&offer=${offer || ''}&invoice=${invoice || ''}`);
      setData(response.data.jobList);
      setTimeout(() => {
        if (!$.fn.DataTable.isDataTable('#joblist')) {
          $('#joblist').DataTable({
            order: [[1, 'desc']]
          });
        }
      }, 0);
    } catch (err) {
      setError('Failed to fetch agents. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (selectedStaff) {
      try {
        const response = await axios.delete(`${apiPath}/api/job-schedule/${selectedStaff._id}`);
        if (response.status === 200) {
          handleAllJob();
          setSelectedStaff(null)
        }
      } catch (err) {
        console.error('Failed to delete agent:', err);
      } finally {
        closeDeleteModal();
      }
    }
  };
  const getJobDetail = async (id: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`${apiPath}/api/jobs/${id}`);
      if (response.status === 200) {
        setSelectedStaff(response.data)
      }
    } catch (err) {
      console.error('Failed to delete agent:', err);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (value) {
      getJobDetail(value)
    }
  }, [])

  useEffect(() => {
    handleAllJob();
  }, []);

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="relative flex flex-col md:flex-row font-medium text-slate-600 w-full" style={{ justifyContent: "flex-start", height: 'calc(100vh - 84px)' }}>
      {loading && <Loader />}
      <div className={`w-full ${customerId || offer || invoice ? 'w-full' : ''} bg-white overflow-y-auto pt-2 pl-1 h-full`}>
        <div className="rounded-sm dark:border-strokedark dark:bg-boxdark p-3">
          {!customerId && !offer && !invoice && <div className='mb-3'>
            <NewJob handler={handleAllJob} />
          </div>}
          <table style={{ paddingTop: "20px", border: 'none' }} id="joblist" className="w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>From / To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data && data.map((item, index) => (
                <tr key={index} onClick={() => getJobDetail(item._id)} className='items-center bg-white shadow cursor-pointer'>
                  <td style={{ padding: "15px 7px" }} className="font-bold capitalize">
                    {item?.customer?.firstName} {item?.customer?.lastName}
                  </td>
                  <td>
                    {new Date(item?.date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="">
                    {item?.load?.city} {item?.load?.country}<ArrowForwardIcon /> <br /> {item?.unload?.city} {item?.unload?.country}
                  </td>
                  <td >
                    <span className='text-sm uppercase p-2 bg-success rounded-xl text-white shadow-lg'>{item?.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
            <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
              <IconButton onClick={closeDeleteModal} className="absolute top-0 right-3">
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" component="h2" className="mb-5" style={{ margin: "5px 0" }}>
                Confirm Delete
              </Typography>
              <Typography className="mb-4" style={{ margin: "5px 0" }}>
                Are you sure you want to delete {selectedStaff?.customer?.firstName}?
              </Typography>
              <Box className="flex justify-end" style={{ margin: "5px 0", display: "flex", gap: "10px" }}>
                <Button variant="contained" color="secondary" onClick={confirmDelete} className="mr-2">
                  Yes
                </Button>
                <Button variant="outlined" onClick={closeDeleteModal}>
                  No
                </Button>
              </Box>
            </Box>
          </Modal>
        </div>
      </div>
      <div className={`${customerId || offer || invoice ? 'absolute z-10 transition-all delay-400 ease-in-out top-0 right-0 left-full bottom-0' : 'relative h-full shadow border-l border-gray'} ${selectedStaff && '!left-0'} bg-white h-full overflow-auto`}>
        <Jobslider handler={handleAllJob} Ondelete={openDeleteModal} job={selectedStaff} onClose={() => setSelectedStaff(null)} />
      </div>
    </div>
  );
};

export default JobDetailPage;
