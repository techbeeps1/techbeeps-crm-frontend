import React, { useState, useEffect, useContext } from 'react';

import { Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  useForm,
  useFieldArray,
  FormProvider,
  FieldError,
  Watch,
} from 'react-hook-form';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { isValidPhoneNumber } from '../../utils/phoneUtil';
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
import { m } from 'framer-motion';
import { OfflineBanner } from '../../components/OfflineNoticeCard';

const steps = [
  { label: 'Customer Details', heading: 'CUSTOMER' },
  { label: 'Where do you need to move from?', heading: 'THE ADDRESS' },
  { label: 'Where should unloading take place?', heading: 'THE ADDRESS' },
  { label: 'Is this address information correct?', heading: 'THE ADDRESS' },
  { label: 'Which services are required?', heading: 'SERVICES' },
  { label: 'Which rooms need to be moved?', heading: 'ROOMS' },
  { label: 'What items need to be moved?', heading: 'ROOMS' },
  { label: 'What materials are needed?', heading: 'ROOMS' },

  { label: 'Is this customer information correct?', heading: 'CUSTOMER' },
  { label: 'Important notes & reminders', heading: 'Notes' },
  // {
  //   label: 'Are there any other addresses for the move?',
  //   heading: 'THE ADDRESS',
  // },
  { label: 'Pricing Agreement', heading: 'OFFERS' },
  { label: 'Cost Calculation & Estimate', heading: 'OFFERS' },
  { label: 'Quotation Review', heading: 'OFFERS' },
  { label: 'Send Quotation to Customer', heading: 'OFFERS' },
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
  const [fetchservices, setFetchServices] = useState<any>([]);
  const [rooms, setRooms] = useState<any>([]);
  const { Id: OpenId, type: OpenType } = useParams<{
    Id: string;
    type: string;
  }>();
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    if (stepParam === 'services' || stepParam === '4') {
      setActiveStep(4);
    } else if (stepParam && !isNaN(Number(stepParam))) {
      setActiveStep(Number(stepParam));
    }
  }, []);

  useEffect(() => {
    if (fetchservices.length > 0 && services.length > 0) {
      const updatedSelectedServices = services.filter((service: any) =>
        fetchservices.some((fs: any) => (fs?._id || fs) === service._id)
      );

      setSelectedServices(updatedSelectedServices);
    }
  }, [fetchservices, services]);
  const handleNext = () => {
    if (activeStep === 0) {
      const customer = methods.watch('customer');
      if (
        !customer?.typeOfCustomer &&
        !customer?.firstName &&
        !customer?.lastName &&
        !customer?.email
      ) {
        notifyError('Please add or select customer details');
        return;
      }
      const customerType = customer?.typeOfCustomer;
      if (!customerType) {
        notifyError('Select type of customer');
        return;
      } else if (
        (customerType === 'Commerical' || customerType === 'Commercial') &&
        (!customer?.companyName || !customer?.companyName.trim())
      ) {
        notifyError('Company Name is required for commercial customers');
        return;
      } else if (!customer?.firstName || !customer?.firstName.trim()) {
        notifyError('First Name is required');
        return;
      } else if (!customer?.lastName || !customer?.lastName.trim()) {
        notifyError('Last Name is required');
        return;
      } else if (!customer?.email || !customer?.email.trim()) {
        notifyError('Email is required');
        return;
      } else if (
        customer?.mobile &&
        typeof customer.mobile === 'string' &&
        customer.mobile.trim().length > 0 &&
        !isValidPhoneNumber(customer.mobile)
      ) {
        notifyError('Please enter a valid mobile number (e.g. 06 12345678 or +31 6 12345678).');
        return;
      } else if (
        customer?.contact &&
        typeof customer.contact === 'string' &&
        customer.contact.trim().length > 0 &&
        !isValidPhoneNumber(customer.contact)
      ) {
        notifyError('Please enter a valid telephone number (e.g. 010 1234567 or +31 10 1234567).');
        return;
      }

      // If existing customer profile was completed/updated in Step 0, sync to database (AT-006-3)
      if (customer?._id) {
        const token = localStorage.getItem('token');
        axios
          .put(
            `${apiPath}/customer/editCustomer/${customer._id}`,
            customer,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} },
          )
          .catch((err) =>
            console.error('Failed to sync completed profile to customer:', err),
          );
      }
    }

    if (activeStep === 10) {
      const priceAgree = methods.getValues('priceAgree');
      const selectedPkg = methods.getValues('package');
      if (!priceAgree) {
        notifyError('Please select a Price Agreement (Fixed Price or On an Hourly Basis).');
        return;
      }
      if (!selectedPkg) {
        notifyError('Please select a valid Package before proceeding to Cost Calculation.');
        return;
      }
    }

    if (activeStep === 11) {
      const relocation = methods.getValues('relocation') || {};
      const vol = Number(relocation.totalVolume) || 0;
      const hours = Number(relocation.travelTime) || 0;
      const dist = Number(relocation.distance) || 0;

      const cubicRate = relocation.pricePerMeterCubic;
      const hourlyRate = relocation.pricePerHour;
      const kmRate = relocation.pricePerKilometer;

      // AT-013-2: Block quote when a required price is unknown/missing
      if (vol > 0 && (cubicRate === undefined || cubicRate === null || String(cubicRate).trim() === '' || isNaN(Number(cubicRate)))) {
        notifyError('Required price for Moving Volume (m³) is missing. Please enter a rate or configure standard price in Features.');
        return;
      }

      if (hours > 0 && (hourlyRate === undefined || hourlyRate === null || String(hourlyRate).trim() === '' || isNaN(Number(hourlyRate)))) {
        notifyError('Required price for Travel Time is missing. Please enter a rate or configure standard price in Features.');
        return;
      }

      if (dist > 0 && (kmRate === undefined || kmRate === null || String(kmRate).trim() === '' || isNaN(Number(kmRate)))) {
        notifyError('Required price for Travel Distance (km) is missing. Please enter a rate or configure standard price in Features.');
        return;
      }
    }

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
        const loadErrors = errors?.load as Record<string, FieldError>;

        const firstKey = Object.keys(loadErrors || {})[0];

        notifyError(
          (errors?.package?.message as string) ||
          loadErrors?.[firstKey]?.message ||
          'Please fill all required fields in the current step before proceeding.',
        );
      },
    )();
  };

  const handleJob = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/api/jobs/${OpenId}`);
      const jobData = response.data;
      if (!jobData) return;

      const offer = Array.isArray(jobData.offer) && jobData.offer.length > 0
        ? jobData.offer[jobData.offer.length - 1]
        : jobData.offer;

      if (offer && typeof offer === 'object') {
        const sanitizedOffer = { ...offer };
        if (sanitizedOffer.financialTemplate) {
          sanitizedOffer.financialTemplate =
            sanitizedOffer.financialTemplate?._id || sanitizedOffer.financialTemplate;
        }
        if (Array.isArray(sanitizedOffer.items)) {
          sanitizedOffer.items = sanitizedOffer.items.map((it: any) => ({
            ...it,
            salesgroup:
              it.salesgroup?._id ||
              it.salesgroup ||
              it.salesGroup?._id ||
              it.salesGroup ||
              '',
          }));
        }
        Object.entries(sanitizedOffer).forEach(([key, value]: any) => {
          if (key.toLowerCase().includes('date') && value) {
            const formattedDate = new Date(value).toISOString().split('T')[0];
            methods.setValue(`offer.${key}`, formattedDate);
          } else {
            methods.setValue(`offer.${key}`, value);
          }
        });
      }

      setFetchServices(jobData.services || []);

      setSelectedRoom(() => {
        const roomsWithFinishedStatus = jobData.rooms?.map(
          (room: any) => ({
            ...room,
            finished: true,
          }),
        );
        return roomsWithFinishedStatus || [];
      });
      methods.setValue('materials', jobData.materials || []);
      methods.setValue('load', jobData.load);
      methods.setValue('unload', jobData.unload);
      methods.setValue('knownAddress', jobData.knownAddress !== undefined ? jobData.knownAddress : (jobData.unload?.city || jobData.unload?.postcode ? true : false));
      methods.setValue('customer', jobData.customer);

      if (jobData.package) {
        if (typeof jobData.package === 'object') {
          setPackageData(jobData.package);
          methods.setValue('package', jobData.package._id);
          methods.setValue('priceAgree', jobData.package.priceAgree);
        } else {
          methods.setValue('package', jobData.package);
          methods.setValue('priceAgree', jobData.priceAgree);
          axios
            .get(`${apiPath}/api/packages/${jobData.package}`)
            .then((res) => {
              if (res.data) {
                setPackageData(res.data);
                if (res.data.priceAgree) {
                  methods.setValue('priceAgree', res.data.priceAgree);
                }
              }
            })
            .catch(console.error);
        }
      }
      if (jobData.relocation) {
        const relData = jobData.relocation;
        const prefixes = [
          'relocation',
          'movingLift',
          'packing',
          'unpacking',
          'assembling',
          'certificate',
          'disassembling',
          'storage',
          'insurance',
        ];
        const unpacked: Record<string, any> = {};
        prefixes.forEach((p) => {
          unpacked[p] = {};
        });

        Object.entries(relData).forEach(([key, value]) => {
          let matched = false;
          for (const prefix of prefixes) {
            if (key.startsWith(`${prefix}_`)) {
              const subKey = key.slice(prefix.length + 1);
              unpacked[prefix][subKey] = value;
              matched = true;
              break;
            }
          }
          if (!matched) {
            unpacked.relocation[key] = value;
          }
        });

        prefixes.forEach((p) => {
          if (Object.keys(unpacked[p]).length > 0) {
            methods.setValue(p, unpacked[p]);
          }
        });
        methods.setValue('estimateData', jobData.relocation);
      }
      methods.setValue('signWithCustomer', jobData.signWithCustomer);
      methods.setValue('sendImmediately', jobData.sendImmediately);
    } catch (err: any) {
      console.error('Error fetching job in valuation:', err);
      notifyError(err?.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomer = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiPath}/customer/customerdetial`, { id: OpenId });
      const customer = response.data?.customer;
      if (customer) {
        methods.setValue('customer', customer);
        const headAddress = Array.isArray(customer.address)
          ? customer.address.find((addr: any) => addr.addressType === 'head') || customer.address[0]
          : null;

        if (headAddress) {
          methods.setValue('load.postcode', headAddress.postcode || '');
          methods.setValue('load.houseNumber', headAddress.houseNumber || '');
          methods.setValue('load.street', headAddress.street || '');
          methods.setValue('load.addition', headAddress.addition || '');
          methods.setValue('load.city', headAddress.city || '');
          methods.setValue('load.country', headAddress.country || '');
          methods.setValue('load.typeOfProperty', headAddress.typeOfProperty || '');
          methods.setValue('load.floor', headAddress.floor || '');
        }
      }
    } catch (err: any) {
      console.error('Error fetching customer for valuation:', err);
      notifyError(err?.response?.data?.message || 'Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleNotes = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/api/notesListByJobId?jobId=${OpenId}`,
      );
      const notes = response.data.notesListByJobId;

      methods.setValue('notes', notes || null);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    if (OpenId && OpenType === 'customer') {
      handleCustomer();
    } else if (OpenId && OpenType !== 'customer') {
      handleJob();
      handleNotes();
    }
  }, [OpenId, OpenType]);

  const sanitizeEstimateData = (data: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'number' && isNaN(value) ? 0 : value,
      ]),
    );
  };
  const postData = async (data: any) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiPath}/api/valuation`, data);

      if (response.status === 200) {
        notify('Valuation Success');
        const targetJobId = (OpenType !== 'customer' && OpenId) || response.data?.job?._id || data?.jobId;
        if (targetJobId && targetJobId !== 'new') {
          navigate(`/jobs/${targetJobId}`);
        } else {
          navigate('/jobs');
        }
        if (data.sendImmediately) {
          SendInvoice({
            ...response.data?.finance,
            email: data?.customer?.email,
          });
        }
      }
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to submit valuation. Please try again.';
      notifyError(errMsg);
      console.error('Error submitting valuation:', errMsg);
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = (data: any) => {
    const filteredData = selectedRoom.map(({ _id, ...item }: any) => ({
      ...item,
      roomId: _id,
      furnitureType: item.furnitureType.filter(
        (furniture: any) => furniture.quantity > 0,
      ),
    }));

    const formattedMaterials = data.materials
      .filter((material: any) => material.quantity > 0) // Filter materials with quantity > 0
      .map((material: any) => ({
        material: material._id, // Only include the _id of the material
        quantity: material.quantity,
        cubicMeter: material.cubicMeter,
        name: material.name,
      }));
    postData({
      notes: data.notes,
      jobId: OpenId,
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
      services: selectedServices.map((service: any) => service._id),
    });
  };

  const SendInvoice = async (data: any) => {
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
        emailTemplateId: settings?.emailTemplates?.quote || settings?.emailTemplates?.quoteReminders,
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
        const countryNames = response.data.map((country: any) => country.name);
        setProperty(countryNames);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  return (
    <>
      <OfflineBanner />
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
                  onClick={() => {
                    if (confirm('are you sure you want to go back') == true) {
                      navigate('/');
                    }
                  }}
                  className="text-lg font-bold flex items-center gap-2 cursor-pointer"
                >
                  <KeyboardBackspaceIcon
                    className="hover:bg-blue-500 hover:text-white p-1 bg-gray"
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
                    <CustomerForm
                      type="customer"
                      customerid={
                        OpenType === 'customer'
                          ? OpenId
                          : (methods.watch('customer')?._id || methods.watch('customer._id'))
                      }
                    />
                  )}
                  {activeStep === 1 && (
                    <AddressFrom
                      countries={countries}
                      type="load"
                      property={property}
                    />
                  )}
                  {activeStep === 2 && (
                    <AddressFrom
                      countries={countries}
                      type="unload"
                      property={property}
                    />
                  )}
                  {activeStep === 3 && (
                    <AddressVerification watch={methods.watch} type="load" />
                  )}
                  {activeStep === 4 && (
                    <ServiceSelector
                      services={services && services}
                      setItem={setSelectedServices}
                      item={selectedServices}
                    />
                  )}
                  {activeStep === 5 && (
                    <ServiceSelector
                      services={rooms}
                      setItem={setSelectedRoom}
                      item={selectedRoom}
                    />
                  )}
                  {activeStep === 6 && (
                    <SelectedRooms
                      rooms={rooms}
                      services={selectedServices}
                      handleBack={handleBack}
                      selectedRoom={selectedRoom}
                      setSelectedRoom={setSelectedRoom}
                    />
                  )}
                  {activeStep === 7 && (
                    <MaterialNeeds useFieldArray={useFieldArray} />
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
                      data={methods.watch()}
                      packageData={packageData}
                    />
                  )}
                  {activeStep === 12 && (
                    <ValuationOffer
                      packageData={packageData}
                      setAppendedItems={setAppendedItems}
                      appendedItemsRef={appendedItemsRef}
                      rooms={selectedRoom}
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
                          className={`w-1 h-3 rounded-full cursor-pointer transition-colors ${index === activeStep ? 'bg-danger' : 'bg-primary'
                            }`}
                        ></div>
                      ))}
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      type="button"
                      disabled={
                        activeStep === 6 &&
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
