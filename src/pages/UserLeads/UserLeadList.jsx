import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { useNavigate } from 'react-router-dom';
import NewUserLead from './NewUserLead';
import toast from 'react-hot-toast';

const UserLeadList = ({ data, fetchCustomer, type="leads" }) => {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [open, setOpen] = useState(false);

  let navigate = useNavigate();

  const closeRemoveModal = () => {
    setIsRemoveModalOpen(false);
    setSelectedCustomer(null);
  };
  const handleClickOutside = (event) => {
    if (event.target.id === 'modalBackdrop') {
      closeRemoveModal();
    }
  };

  useEffect(() => {
    setTimeout(() => {

         if ($.fn.DataTable.isDataTable(`#${type}`)) {
        $(`#${type}`).DataTable().destroy();
    }

    $(`#${type}`).DataTable({
        order: [[0, 'desc']] // Date column sort
    });
   

    }, 0);
  }, []);

  const deleteCustomer = async (customerId) => {
    try {
      const response = await axios.delete(
        `${apiPath}/leads/lead/${customerId}`,
      );
      if (response.data.success) {
        closeRemoveModal();
        fetchCustomer();
        toast.success('Lead deleted successfully!');
      } else {
        toast.error('Error deleting lead:');
        console.error('Error deleting lead:', response.data.msg);
      }
    } catch (error) {
      toast.error('Error deleting lead');
      console.error('Error deleting lead:', error);
    }
  };

  return (
    <>
      <div
        style={{ fontSize: '17px' }}
        className="font-medium text-slate-600 border border-stroke h-full bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
      >
        <NewUserLead
          setOpen={setOpen}
          open={open}
          handler={fetchCustomer}
          type={type}
        />
        <div className="w-full">
          <table id={type} className="w-full overflow-x-auto block  md:inline-table">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 text-left">Number</th>
                <th className="border-b px-4 py-2 text-left">Name</th>
                <th className="border-b px-4 py-2 text-left">Email</th>
                <th className="border-b px-4 py-2 text-left">Contact</th>
                <th className="border-b px-4 py-2 text-left">Status</th>
                <th className="border-b px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => {
                    type === 'leads'
                      ? navigate(`/leads/${item._id}`)
                      : navigate(`/customers/${item._id}`);
                  }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  <td className="border-b px-4 py-2">{item?.leadIndex}</td>
                  <td className="border-b px-4 py-2 capitalize">
                    {item?.firstName} {item?.lastName}
                  </td>
                  <td className="border-b px-4 py-2">{item?.email}</td>
                  <td className="border-b px-4 py-2">{item?.contact}</td>
                  <td className="border-b px-4 py-2">
                    {item?.status}
                  </td>
                  <td className="border-b px-4 py-2 gap-4 items-center">
                    <RemoveRedEyeIcon
                      onClick={() => {
                        type === 'leads'
                          ? navigate(`/leads/${item._id}`)
                          : navigate(`/customers/${item._id}`);
                      }}
                      className='mr-4'
                    />
                    <DeleteIcon
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCustomer(item);
                        setIsRemoveModalOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isRemoveModalOpen && (
        <div
          id="modalBackdrop"
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80"
          onClick={handleClickOutside}
        >
          <div
            className="bg-white p-5 rounded-lg shadow-lg z-50 text-lg max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="font-extrabold text-danger pt-5 pb-3">
              Delete Customer {selectedCustomer.firstName}{' '}
              {selectedCustomer.lastName}
            </h1>
            <p>
              Please note that if your {type} deletes{' '}
              {selectedCustomer.firstName} {selectedCustomer.lastName}, all
              associated information will be retained but will be anonymous.
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="text-red bg-gray-200 font-bold uppercase px-5 py-2 text-sm mr-2"
                onClick={closeRemoveModal}
              >
                Cancel
              </button>
              <button
                className="text-red bg-red-600 text-white font-bold uppercase text-sm px-5 py-2 rounded"
                onClick={() => deleteCustomer(selectedCustomer._id)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserLeadList;
