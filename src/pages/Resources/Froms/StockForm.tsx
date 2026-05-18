import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { toast } from 'react-toastify';


const StockForm: React.FC<any> = ({ supplier, handleAllData }) => {
  const { handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      supplier: '',
      receivedOn: '',
      quantity: '',
      orderOn: '',
      orderQuantity: '',
    },
  });
  const notify = (message: string) => toast.success(message);
  const notifyError = (message: string) => toast.error(message, {
    autoClose: 2000,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [type, setType] = useState<string>('');

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  const handleFormSubmit = (data: any) => {
    addStock({ ...data, material: supplier._id, type: type })
    reset();
    handleClosePopup();
  };

  const addStock = async (stockData: any) => {
    try {
      const response = await axios.post(`${apiPath}/api/material-stock`, stockData);
      if (response) {
        notify('Stock added/updated successfully:');
        handleAllData()
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      notifyError(errorMessage);
    }
  };

  const handleCancel = () => {
    reset();
    handleClosePopup();
  };

  return (
    <>
      <div className='flex gap-3 my-3'>
        <Button onClick={() => { handleOpenPopup(), setType('Order') }}
          variant="contained"
          size="large"
        >Order</Button>
        <Button onClick={() => { handleOpenPopup(), setType('Register') }}
          variant="contained"
          size="large"
        >Sign in</Button>
      </div>
      <Dialog open={isPopupOpen} onClose={handleClosePopup} fullWidth maxWidth="sm">
        <div className="p-4">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary mb-1" style={{ fontSize: '28px' }}>{type === 'Order' ? 'Submit Order' : "Register Order"}</span>
              <IconButton onClick={handleCancel}>
                <CloseIcon />
              </IconButton>
            </div>
          </DialogTitle>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <DialogContent className="space-y-4">
              <div>
                <label className="block text-md font-medium pb-2">Supplier</label>
                <Controller
                  name="supplier"
                  control={control}
                  defaultValue=''
                  rules={{ required: "Supplier is a required field" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select warehouse</option>
                      {supplier && supplier.inventorySuppliers.map((item: any) =>
                        <option key={item.supplier?._id} value={item.supplier?._id}>{item.supplier?.name}</option>
                      )}
                    </select>
                  )}
                />
                {errors.supplier && <p className="text-red-500 text-sm">{errors.supplier.message}</p>}
              </div>
              {/* Received On (Date Picker) */}
              {type === 'Register' &&
                <>
                  <div>
                    <label className="block text-md font-medium pb-2">Received On</label>
                    <Controller
                      name="receivedOn"
                      control={control}
                      defaultValue=''
                      rules={{ required: "receivedOn is a required field" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          placeholder="description"
                          className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    />
                    {errors.receivedOn && <p className="text-red-500 text-sm">{errors.receivedOn.message}</p>}
                  </div>

                  <div>
                    <label className="block text-md font-medium pb-2">Number</label>
                    <Controller
                      name="quantity"
                      control={control}
                      defaultValue=''
                      rules={{ required: "Number is a required field" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Number"
                          className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    />
                    {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
                  </div>
                </>
              }
              {type === 'Order' &&
                <>
                  <div>
                    <label className="block text-md font-medium pb-2">Order date</label>
                    <Controller
                      name="orderOn"
                      control={control}
                      defaultValue=''
                      rules={{ required: "date is a required field" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          placeholder="description"
                          className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    />
                    {errors.orderOn && <p className="text-red-500 text-sm">{errors.orderOn.message}</p>}
                  </div>

                  <div>
                    <label className="block text-md font-medium pb-2">Number</label>
                    <Controller
                      name="orderQuantity"
                      control={control}
                      defaultValue=''
                      rules={{ required: "Number is a required field" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Number"
                          className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    />
                    {errors.orderQuantity && <p className="text-red-500 text-sm">{errors.orderQuantity.message}</p>}
                  </div>
                </>
              }

            </DialogContent>
            <DialogActions className="space-x-4">
              <Button
                onClick={handleCancel}
                variant="outlined"
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Submit
              </Button>
            </DialogActions>
          </form>
        </div>


      </Dialog>
    </>
  );
};

export default StockForm;
