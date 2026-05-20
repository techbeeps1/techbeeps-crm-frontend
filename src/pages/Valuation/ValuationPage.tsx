import React, { useState, useEffect, useContext } from 'react';

import { Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import Loader from '../../common/Loader';
import AddressFrom from './formSteps/AddressFrom';
import AddressVerification from './formSteps/AddressVerification';
import ServiceSelector from './formSteps/ServiceSelector';
import SelectedRooms from './formSteps/SelectedRooms';
import MaterialNeeds from './formSteps/MaterialNeeds';
import CustomerForm from './formSteps/CustomerForm';
import NotesForm from './formSteps/NotesForm';
import PriceAgree from './formSteps/PriceAgree';
import PriceCalculation from './formSteps/PriceCalculation';
import ValuationOffer from './formSteps/ValuationOffer';
import FinalStep from './formSteps/FinalStep';
import { toast } from 'react-toastify';
import { EmailContext } from '../../EmailProvider/EmailContext';
import { useNavigate, useParams } from 'react-router-dom';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

const steps = [
  { label: 'Where do you need to move from ?', heading: 'THE ADDRESS' },
  { label: 'Where should unloading take place ?', heading: 'THE ADDRESS' },
  { label: 'Is this information correct ?', heading: 'THE ADDRESS' },
  { label: 'What services need to take place ?', heading: 'SERVICES' },
  { label: 'Which rooms need to be moved ?', heading: 'ROOMS' },
  { label: 'What needs to be moved ?', heading: 'ROOMS' },
  { label: 'What Material is Needed ?', heading: 'ROOMS' },
  { label: 'Customer Details ?', heading: 'CUSTOMER' },
  { label: 'Is this information correct?', heading: 'CUSTOMER' },
  { label: 'What do you really need to remember?', heading: 'Notes' },
  // {
  //   label: 'Are there any other addresses for the move?',
  //   heading: 'THE ADDRESS',
  // },
  { label: 'The payment agreement ?', heading: 'OFFERS' },
  { label: 'The estimate', heading: 'OFFERS' },
  { label: 'From offer', heading: 'OFFERS' },
  { label: 'Do you want to send the quote?', heading: 'OFFERS' },
];
const ValuationPage: React.FC = () => {
  const methods = useForm<any>();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [property, setProperty] = useState([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [services, setServices] = useState<any>([]);
  const [rooms, setRooms] = useState<any>([]);
  const { jobId } = useParams<{ jobId: string }>();
  const [packageData, setPackageData] = useState<any>();
  const { settings } = useContext(EmailContext) as any;
  const [appendedItemsRef, setAppendedItems] = useState<Set<string>>(new Set());

  const navigate = useNavigate();

  const notify = (message: string) => toast.success(message);
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const handleBack = () => {
    if (activeStep === 12) {
      setActiveStep((prev) => prev - 2);
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    methods.handleSubmit(
      (data) => {
        setActiveStep((prev) => prev + 1);
        localStorage.setItem(
          'valuation',
          JSON.stringify({
            ...data,
            services: selectedServices,
            rooms: selectedRoom,
          }),
        );
      },
      (errors) => {
        console.error('Validation errors:', errors);
        notifyError('Validation errors:');
      },
    )();
  };

  const handleJob = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/api/jobs/${jobId}`);
      const offer = response.data?.offer[response.data?.offer.length - 1];
      if (offer) {
        Object.entries(offer).forEach(([key, value]: any) => {
          if (key.toLowerCase().includes('date') && value) {
            const formattedDate = new Date(value).toISOString().split('T')[0];
            methods.setValue(`offer.${key}`, formattedDate);
          } else {
            methods.setValue(`offer.${key}`, value);
          }
        });
      }
      methods.setValue('load', response.data?.load);
      methods.setValue('unload', response.data?.unload);
      methods.setValue('knownAddress', response.data?.knownAddress);
      methods.setValue('customer', response.data?.customer);
      methods.setValue('priceAgree', response.data?.package?.priceAgree);
      methods.setValue('package', response.data?.package?._id);
    } catch (err: any) {
      notifyError(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  const handleNotes = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/api/notesListByJobId?jobId=${jobId}`,
      );
      const notes = response.data.notesListByJobId;
      methods.setValue('notes', notes || null);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    if (jobId) {
      handleJob();
      handleNotes();
    }
  }, [jobId]);

  const sanitizeEstimateData = (data: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'number' && isNaN(value) ? 0 : value,
      ]),
    );
  };

  const onSubmit = (data: any) => {
    const filteredData = selectedRoom.map(({ _id, ...item }: any) => ({
      ...item,
      furnitureType: item.furnitureType.filter(
        (furniture: any) => furniture.quantity > 0,
      ),
    }));
    const formattedMaterials = data.materials
      .filter((material: any) => material.quantity > 0) // Filter materials with quantity > 0
      .map((material: any) => ({
        material: material._id, // Only include the _id of the material
        quantity: material.quantity,
      }));
    postData({
      notes: data.notes,
      jobId: jobId,
      package: data.package,
      load: data.load,
      unload: data.unload,
      materials: formattedMaterials,
      customer: data.customer,
      rooms: filteredData,
      offer: data.offer,
      relocation: sanitizeEstimateData(data.estimateData),
      knownAddress: data.knownAddress,
      signWithCustomer: data.signWithCustomer,
      sendImmediately: data.sendImmediately,
    });
  };
  const postData = async (data: any) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiPath}/api/valuation`, data);
      console.log(response.data);
      if (response.status === 200) {
        notify('Valuation Success');
        navigate('/');
        if (data.sendImmediately) {
          SendInvoice({
            ...response.data?.finance,
            email: data?.customer?.email,
          });
        }
      }
    } catch (error: any) {
      notifyError(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const SendInvoice = async (data:any) => {
    let activityData = {
      type: 'offer',
      title: `Quotation has been sending on ${data.email}`,
      offer: data._id,
      reference: 'admin',
      status: 'success',
    };
    await axios.post(`${apiPath}/api/activities`, activityData);
    try {
      const response = await axios.post(`${apiPath}/finance/send`, {
        Id: data._id,
        emailTemplateId: settings?.emailTemplates?.quoteReminders,
      });
      if (response.status === 200) {
        let activityData = {
          type: 'offer',
          title: `Quotation has been send successfully on ${data.email}`,
          offer: data._id,
          reference: 'admin',
          status: 'success',
          email: response.data,
        };
        await axios.post(`${apiPath}/api/activities`, activityData);
      }
      notify('Quotation send successfully');
    } catch (error: any) {
      console.error('Error fetching invoice data:', error);
      notifyError(error.message);
      let activityData = {
        type: 'offer',
        title: `Error in Quotation sending on ${data.email}`,
        offer: data._id,
        reference: 'admin',
        status: 'error',
        description: error.message,
      };
      await axios.post(`${apiPath}/api/activities`, activityData);
    }
  };

  const fetchFunction = async (setItem: any, path: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/api/${path}`);
      setItem(response.data);
    } catch (err: any) {
      notifyError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunction(setServices, 'services');
    fetchFunction(setRooms, 'room');
    axios
      .get(`${apiPath}/api/sale_group?type=country`)
      .then((response) => {
        const countryNames = response?.data?.map(
          (country: { name: string }) => country?.name,
        );
        setCountries(countryNames);
      })
      .catch((error: any) => {
        notifyError('Error fetching countries:');
        console.error('Error fetching countries:', error);
      });
      axios
       .get(`${apiPath}/api/sale_group?type=property`)
       .then((response) => {
              const countryNames = response.data.map((country:any) => country.name);
                  setProperty(countryNames);
               })
        .catch((error) => {
               console.error('Error fetching countries:', error);
              });
  }, []);

  return (
    <>
      {loading && <Loader />}
      <FormProvider {...methods}>
        <div className="relative">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div
              className="bg-white p-5 overflow-y-auto"
              style={{ height: '100vh' }}
            >
              <div className="absolute flex justify-between items-center top-0 left-0 right-0 bg-white shadow z-4 p-4">
                <div
                  onClick={() => (window.location.href = '/')}
                  className="text-lg font-bold flex items-center gap-2 cursor-pointer"
                >
                  <KeyboardBackspaceIcon
                    className="hover:bg-blue hover:text-white p-1 bg-gray"
                    style={{
                      fontSize: '40px',
                      borderRadius: '50%',
                      marginRight: '2px',
                    }}
                  />{' '}
                  Home
                </div>

                <div className="">
                  <h5 className="font-semibold text-center">
                    {steps[activeStep].heading}
                  </h5>
                  <h2 className="text-2xl font-semibold text-center text-blue">
                    {steps[activeStep].label}
                  </h2>
                </div>
                <div></div>
              </div>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="absolute md:top-22 top-35 bottom-18 left-0 right-0 overflow-auto bg-gray">
                  {activeStep === 0 && (
                    <AddressFrom countries={countries} type="load" property={property} />
                  )}
                  {activeStep === 1 && (
                    <AddressFrom countries={countries} type="unload" property={property}/>
                  )}
                  {activeStep === 2 && (
                    <AddressVerification watch={methods.watch} type="load" />
                  )}
                  {activeStep === 3 && (
                    <ServiceSelector
                      services={services && services}
                      setItem={setSelectedServices}
                      item={selectedServices}
                    />
                  )}
                  {activeStep === 4 && (
                    <ServiceSelector
                      services={rooms}
                      setItem={setSelectedRoom}
                      item={selectedRoom}
                    />
                  )}
                  {activeStep === 5 && (
                    <SelectedRooms
                      rooms={rooms}
                      services={selectedServices}
                      handleBack={handleBack}
                      selectedRoom={selectedRoom}
                      setSelectedRoom={setSelectedRoom}
                    />
                  )}
                  {activeStep === 6 && (
                    <MaterialNeeds useFieldArray={useFieldArray} />
                  )}
                  {activeStep === 7 && (
                     <CustomerForm type="customer" />

                  )}
                  {activeStep === 8 && (
                    <AddressVerification
                      watch={methods.watch}
                      type="customer"
                    />
                  )}
                  {activeStep === 9 && <NotesForm type="notes" />}
                  {/* {activeStep === 10 && (
                    <AddressVerification watch={methods.watch} type="load" />
                  )} */}
                  {activeStep === 10 && (
                    <PriceAgree
                      setPackageData={setPackageData}
                      setAppendedItems={setAppendedItems}
                    />
                  )}
                  {activeStep === 11 && (
                    <PriceCalculation
                      rooms={selectedRoom}
                      selectedServices={selectedServices}
                    />
                  )}
                  {activeStep === 12 && (
                    <ValuationOffer
                      packageData={packageData}
                      setAppendedItems={setAppendedItems}
                      appendedItemsRef={appendedItemsRef}
                    />
                  )}
                  {activeStep === 13 && <FinalStep />}
                </div>
                <div className="absolute bottom-0 left-0 right-0  py-2 px-6 bg-white">
                  <div className="md:flex justify-between mt-2 mb-2 text-center">
                    <Button
                      variant="outlined"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      size="large"
                    >
                      Back
                    </Button>
                    <div
                      className="flex justify-center gap-2 my-5"
                      style={{ alignItems: 'center' }}
                    >
                      {steps.map((_, index) => (
                        <div
                          key={index}
                          onClick={() =>
                            index <= activeStep && setActiveStep(index)
                          }
                          className={`w-1 h-3 rounded-full cursor-pointer transition-colors ${
                            index === activeStep ? 'bg-danger' : 'bg-primary'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      type="button"
                      disabled={
                        activeStep === 5 &&
                        !selectedRoom.every((room: any) => room.finished)
                      }
                      size="large"
                      onClick={
                        activeStep === steps.length - 1
                          ? methods.handleSubmit(onSubmit)
                          : handleNext
                      }
                    >
                      {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </LocalizationProvider>
        </div>
      </FormProvider>
    </>
  );
};

export default ValuationPage;
