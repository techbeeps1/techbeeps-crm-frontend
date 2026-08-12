
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import toast from 'react-hot-toast';

const CustomerAddress = ({ handleCustomer, address, customerId }: any) => {
  const [open, setOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: address || {},
  });

  const [countries, setCountries] = useState<string[]>([]);
  const [property, setProperty] = useState<string[]>([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset();
  };

  useEffect(() => {
    axios
      .get(`${apiPath}/api/sale_group?type=country`)
      .then((response) => {
        const countryNames = response.data.map((country: any) => country.name);
        setCountries(countryNames);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });

    axios
      .get(`${apiPath}/api/sale_group?type=property`)
      .then((response) => {
        const countryNames = response.data.map((country: any) => country.name);
        setProperty(countryNames);
      })
      .catch((error) => {
        console.error('Error fetching property types:', error);
      });
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);
      let response = await axios.post(`${apiPath}/customer/delete_address`, {
        customerId: customerId,
        addressId: address._id,
      });
      if (response.status === 200) {
        setIsDeleteModalOpen(false);
        handleClose();
        handleCustomer();
        toast.success('Address deleted successfully!');
      }
    } catch (error) {
      console.log('Error deleting address:', error);
      toast.error('Error deleting address');
    } finally {
      setLoading(false);
    }
  };

  const editAddressHandler = async (data: any) => {
    if (loading) return;
    setLoading(true);
    try {
      let response = await axios.post(`${apiPath}/customer/update_address`, data);
      if (response.status === 200) {
        handleClose();
        handleCustomer();
        toast.success('Address updated successfully!');
      }
    } catch (error) {
      console.log(error);
      toast.error('Error updating address');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: any) => {
    editAddressHandler(data);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Edit Address Button Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        title="Edit Address"
        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all cursor-pointer"
      >
        <EditIcon style={{ fontSize: 16 }} />
      </button>

      {/* Delete Address Button Trigger */}
      {address?.addressType !== 'head' && (
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          title="Delete Address"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all cursor-pointer"
        >
          <DeleteIcon style={{ fontSize: 16 }} />
        </button>
      )}

      {/* Glassmorphism Edit Address Modal Popup */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={handleClose}
        >
          <div
            className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-slate-100 dark:border-strokedark max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-strokedark bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <LocationOnIcon />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                    Edit Address Details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update location & property details for this customer address.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} noValidate id="edit-address-modal-form" className="space-y-4">
                {/* Address Type */}
                {address.addressType !== 'head' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Address Type <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                      name="addressType"
                      control={control}
                      defaultValue=""
                      rules={{ required: 'Address type is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                        >
                          <option value="" disabled>Select address type</option>
                          <option value="billing">Billing</option>
                          <option value="private">Private</option>
                          <option value="other">Other</option>
                        </select>
                      )}
                    />
                    {errors.addressType && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {String(errors.addressType.message)}
                      </span>
                    )}
                  </div>
                )}

                {/* Postcode & House Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Postcode <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 335701"
                      {...register('postcode', { required: 'Postcode is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                    />
                    {errors.postcode && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {String(errors.postcode.message)}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      House Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 15"
                      {...register('houseNumber', { required: 'House number is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                    />
                    {errors.houseNumber && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {String(errors.houseNumber.message)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Street & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Street <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sanjay Nagar, Jhotwara"
                      {...register('street', { required: 'Street is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                    />
                    {errors.street && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {String(errors.street.message)}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jaipur"
                      {...register('city', { required: 'City is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                    />
                    {errors.city && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {String(errors.city.message)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Addition */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Addition / Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. near Pink city 2"
                    {...register('addition')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                  />
                </div>

                {/* Type of Property & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Type of Property <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                      name="typeOfProperty"
                      control={control}
                      defaultValue=""
                      rules={{ required: 'Property type is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                        >
                          <option value="" disabled>Select property type</option>
                          {property &&
                            property.map((propItem, idx) => (
                              <option key={idx} value={propItem}>
                                {propItem}
                              </option>
                            ))}
                        </select>
                      )}
                    />
                    {errors.typeOfProperty && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {String(errors.typeOfProperty.message)}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                      name="country"
                      control={control}
                      defaultValue=""
                      rules={{ required: 'Country is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                        >
                          <option value="" disabled>Select country</option>
                          {countries &&
                            countries.map((cName, idx) => (
                              <option key={idx} value={cName}>
                                {cName}
                              </option>
                            ))}
                        </select>
                      )}
                    />
                    {errors.country && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {String(errors.country.message)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Floor, Lift Distance, Apartment Distance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Floor
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2"
                      {...register('floor')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Distance to Lift
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 20m"
                      {...register('distanceToLift')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Distance to Apartment
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 30m"
                      {...register('distanceToApartment')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Controller
                      name="hasElevator"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                        />
                      )}
                    />
                    <span>Has Elevator</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Controller
                      name="deliveringBoxes"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                        />
                      )}
                    />
                    <span>Delivering Boxes</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Controller
                      name="applyForPermit"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                        />
                      )}
                    />
                    <span>Apply for Permit</span>
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Action Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-strokedark bg-slate-50/60 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-address-modal-form"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-primary/25 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Glassmorphism Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-slate-100 dark:border-strokedark p-6 max-w-md w-full animate-in fade-in zoom-in duration-200 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto mb-4">
              <DeleteIcon style={{ fontSize: 30 }} />
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">
              Delete Address?
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3">
              <button
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAddress;



