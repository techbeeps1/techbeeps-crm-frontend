import axios from 'axios';
import { useEffect, useState } from 'react';
import { apiPath } from '../../../apiPath.tsx';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Button, } from '@mui/material';

import Loader from '../../common/Loader/index.tsx';
import toast from 'react-hot-toast';

import EditUserLead from './EditUserLead.jsx';
import ConvertAsCustomer from './ConvertAsCustomer.jsx';

const LeadDetail = () => {
  const [customerData, setcustomerData] = useState<any>(null);
      const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
      const [open, setOpen] = useState(false);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  let navigate = useNavigate();

  const { id } = useParams();

  const handleCustomer = async () => {
    let response = await fetch(apiPath + `/leads/lead/${id}`);
    let data = await response.json();
   
    if (data.success === true) {
      setcustomerData(data.data);
    } else {
      navigate('/leads');
    }
  };


  useEffect(() => {
    handleCustomer();
  }, []);


    const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
             setIsRemoveModalOpen(false);
        }
    };



    const deleteCustomer = async () => {
        try {
            const response = await axios.delete(`${apiPath}/leads/lead/${id}`);
            if (response.data.success) {
                 toast.success('Lead deleted successfully!');
             setIsRemoveModalOpen(false);
               navigate('/leads');
               
            } else {
                toast.error('Error deleting lead:');
                console.error('Error deleting lead:', response.data.msg);
            }
        } catch (error) {
            toast.error('Error deleting lead');
            console.error('Error deleting lead:', error);
        }
    };


  if (customerData == null) {
      return (<Loader />)
  }


  return (
    <>
      <div
        style={{ height: 'calc(100vh - 84px)' }}
        className="flex flex-col gap-1"
      >
        <div className="flex items-center justify-between gap-2 uppercase shadow p-2 bg-white">
          <div className="flex items-center gap-2">
            <KeyboardBackspaceIcon
              onClick={() => navigate(-1)}
              className="shadow bg-slate-200 hover:bg-blue hover:text-white p-1"
              style={{ fontSize: '40px', borderRadius: '50%' }}
            />
            <h1 className="text-xl font-extrabold whitespace-nowrap">
              {customerData?.firstName} {customerData?.lastName}
            </h1>
          </div>
        </div>
        <div className="w-full bg-white p-5 h-full">
          {/*customer data */}
          {true && (
            <div className="h-full overflow-auto p-4 max-w-screen-lg mx-auto  ">
              <div className="flex flex-wrap items-start justify-center md:justify-end gap-2 mb-4 ">
                <Button
                  variant="contained"
                  color="primary"
                  disabled={customerData?.status === "Converted"}
                  
                    onClick={() => customerData?.status !== "Converted" && setIsMergeModalOpen(true)}
                >
                  Convert as Customer
                </Button>
                <Button
                  variant="contained"
                  color="error"
                
                     onClick={() => { setIsRemoveModalOpen(true); }}
                  style={{ marginLeft: '10px' }}
                >
                  Remove Lead
                </Button>
               <EditUserLead

            setOpen={setOpen}
          open={open}
          handler={handleCustomer}
          
         customerData={customerData}
                                              

                   /> 
              </div>

              <div className="space-y-3 mt-4 ">
                <h2 className="font-bold text-black text-xl pb-2 capitalize border-b border-slate-300 mb-4 ">
                  Lead Details :
                </h2>
                {[
                  {
                    label: 'Name',
                    value: ` ${customerData?.firstName} ${customerData?.lastName}`,
                  },
                  { label: 'Gender', value: customerData?.gender },
                  { label: 'Contact', value: customerData?.contact },
                  { label: 'Email', value: customerData?.email },
                  { label: 'Type', value: customerData?.typeOfCustomer },
                  { label: 'Contact No', value: customerData?.contact },
                ].map(({ label, value }) => (
                  <div
                    className="flex flex-col sm:flex-row gap-4 text-slate-600 font-medium text-base sm:text-lg "
                    key={label}
                  >
                    <p className="text-slate-700">{label}:</p>
                    <p className="text-slate-800 capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


                  {/* Remove Customer Dialog */}
            {isRemoveModalOpen && (
                <div
                    id="modalBackdrop"
                    className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80"
                    onClick={handleClickOutside}
                >
                    <div className="bg-white p-5 rounded-lg shadow-lg z-50 text-lg max-w-3xl" onClick={(e) => e.stopPropagation()}>
                        <h1 className="font-extrabold text-danger pt-5 pb-3">
                            Delete Lead {customerData.firstName} {customerData.lastName}
                        </h1>
                        <p>Please note that if your Lead deletes {customerData.firstName} {customerData.lastName}, all associated information will be retained but will be anonymous.</p>
                        <div className="flex justify-end mt-4">
                            <button
                                className="text-red bg-gray-200 font-bold uppercase px-5 py-2 text-sm mr-2"
                                onClick={() => setIsRemoveModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="text-red bg-red-600 text-white font-bold uppercase text-sm px-5 py-2 rounded"
                                onClick={() => deleteCustomer()}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Merge Modal */}
            <ConvertAsCustomer 
            
            
            setOpen={setIsMergeModalOpen}
          open={isMergeModalOpen}
          handler={handleCustomer}
          
         customerData={customerData}
         />
          
    </>
  );
};

export default LeadDetail;
