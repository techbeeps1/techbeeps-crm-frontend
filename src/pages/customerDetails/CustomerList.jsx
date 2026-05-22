import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { useNavigate } from 'react-router-dom';
import NewCustomer from './NewCustomer';

const CustomerList = ({ data, fetchCustomer, type }) => {
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
        `${apiPath}/customer/deleteCustomer/${customerId}`,
      );
      if (response.data.status) {
        closeRemoveModal();
        fetchCustomer();
      } else {
        console.error('Error deleting customer:', response.data.msg);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <>
      <div
        style={{ fontSize: '17px' }}
        className="font-medium text-slate-600 border border-stroke h-full bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
      >
        <NewCustomer
          setOpen={setOpen}
          open={open}
          handler={fetchCustomer}
          type={type}
        />
        <div className="w-full">
          <table id={type} className="w-full md:table hidden">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 text-left">Number</th>
                <th className="border-b px-4 py-2 text-left">Name</th>
                <th className="border-b px-4 py-2 text-left">Email</th>
                <th className="border-b px-4 py-2 text-left">Contact</th>
                <th className="border-b px-4 py-2 text-left">Country</th>
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
                  <td className="border-b px-4 py-2">{item?.customerIndex}</td>
                  <td className="border-b px-4 py-2 capitalize">
                    {item?.firstName} {item?.lastName}
                  </td>
                  <td className="border-b px-4 py-2">{item?.email}</td>
                  <td className="border-b px-4 py-2">{item?.contact}</td>
                  <td className="border-b px-4 py-2">
                    {item.address[0]?.country}
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
          {/* Mobile View: Stack th Above td */}
          <div className="block md:hidden">
            {data.map((item, index) => (
              <div key={index} className="border-b py-3">
                <p>
                  <strong>Number:</strong> {item?.customerIndex}
                </p>
                <p>
                  <strong>Name:</strong> {item?.firstName} {item?.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {item?.email}
                </p>
                <p>
                  <strong>Contact:</strong> {item?.contact}
                </p>
                <p>
                  <strong>Country:</strong> {item.address[0]?.country}
                </p>
                <div className="flex gap-4 mt-2">
                  <RemoveRedEyeIcon
                    onClick={() =>
                      navigate(
                        type === 'leads'
                          ? `/leads/${item._id}`
                          : `/customers/${item._id}`,
                      )
                    }
                  />
                  <DeleteIcon
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedCustomer(item);
                      setIsRemoveModalOpen(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
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

export default CustomerList;
