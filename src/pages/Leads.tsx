import { useEffect, useState, useRef, useContext } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import customer from '../images/new.jpg';
import move from '../images/move.jpg';
import relocation from '../images/relocation.jpg';
import moveLift from '../images/lift.jpg';
import app from '../images/app.jpg';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import CustomPagination from './UiElements/CustomPagination';
import { apiPath } from '../../apiPath';
import useClickOutside from '../clickoutsider/clickOutside';
import { UserContext } from '../UserContext';
import { toast } from 'react-toastify';
import { Phone, Mail, EditCalendar} from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Card,
  Paper,
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';

function Leads() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFormIndex, setActiveFormIndex] = useState(0);
  const [showBackButton, setShowBackButton] = useState(false);
  const forms = [
    renderContactForm,
    renderMoveForm,
    renderRelocationForm,
    renderHouseHoldForm,
  ];
  const [typeOfCustomer, setTypeOfCustomer] = useState('');
  const [salutation, setSalutation] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [findUs, setFindUs] = useState('');

  const [whereOption, setWhereOption] = useState('');
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const [distance, setDistance] = useState('');
  const [permission, setPermission] = useState('');
  const [simage, setImage] = useState('');
  const [floor, setFloor] = useState('');
  const [reports, setReports] = useState('');
  const [lift, setLift] = useState('');
  const [isImageSelected, setIsImageSelected] = useState(false);

  const [selectedRadio, setSelectedRadio] = useState('');
  const [internetLink, setInternetLink] = useState('');
  const [additionalDetail, setAditionalDetail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>() as any;
  const [leadList, setLeadList] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  // Set the minimum date as today's date
  const minDate = '';
  const pageSize = 5;
  let { username } = useContext(UserContext) as any;

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => {
    setIsModalOpen(false);
  });

  function getLeadList() {
    axios
      .get(`${apiPath}/leads/leadList?page=${currentPage}&pageSize=${pageSize}`)
      .then((response) => {
        setLeadList(response.data.leads);
        setTotalLeads(response.data.totalLeads);
      })
      .catch((error) => {
        console.error('Error fetching Leads:', error);
      });
  }

  useEffect(() => {
    getLeadList();
  }, [currentPage]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    async function searchLeads() {
      try {
        const response = await axios.get(
          `${apiPath}/leads/searchedLead?searchTerm=${searchTerm}`,
        );
        setLeadList(response.data);
        setTotalLeads(response.data.length);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    }
    // Only fetch customers when the searchTerm changes
    if (searchTerm.trim() !== '') {
      searchLeads();
    } else {
      setCurrentPage(1);
      searchLeads();
    }
  }, [searchTerm]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const [error, setError] = useState('');

  const handleFormChange = (event: any) => {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    switch (fieldName) {
      case 'typeOfCustomer':
        setTypeOfCustomer(fieldValue);
        break;
      case 'salutation':
        setSalutation(fieldValue);
        break;
      case 'firstName':
        setFirstName(fieldValue);
        break;
      case 'lastName':
        setLastName(fieldValue);
        break;
      case 'gender':
        setGender(fieldValue);
        break;
      case 'email':
        setEmail(fieldValue);
        break;
      case 'contact':
        if (/^\d{0,10}$/.test(fieldValue)) {
          setContact(fieldValue);
          setError(''); // Clear error message if valid (exactly 10 digits)
        } else {
          setError('Contact number should be exactly 10 digits.');
        }
        break;
      case 'findUs':
        setFindUs(fieldValue);
        break;
      case 'time':
        setTime(fieldValue);
        break;
      case 'date':
        // Check if the selected date is in the future
        const selectedDate = new Date(fieldValue);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set current date to midnight for comparison

        if (selectedDate <= currentDate) {
          setError('The moving date must be in the future.');
        } else {
          setDate(fieldValue);
          setError(''); // Clear error if valid
        }
        break;
      case 'from':
        setFrom(fieldValue);
        break;
      case 'to':
        setTo(fieldValue);
        break;
      case 'whereOption':
        setWhereOption(fieldValue);
        break;
      case 'permission':
        setPermission(fieldValue);
        break;
      case 'lift':
        setLift(fieldValue);
        break;
      case 'simage':
        setImage(fieldValue);
        break;
      case 'reports':
        setReports(fieldValue);
        break;
      case 'floor':
        setFloor(fieldValue);
        break;
      case 'distance':
        setDistance(fieldValue);
        break;
      case 'selectedRadio':
        setSelectedRadio(fieldValue);
        break;
      case 'internetLink':
        setInternetLink(fieldValue);
        break;
      case 'additionalDetail':
        setAditionalDetail(fieldValue);
        break;
      case 'selectedFile':
        const file = event.target.files?.[0];
        setSelectedFile(file || null);
        break;
      default:
        break;
    }
  };
  const notify = () => toast('🦄 leads created Successfully!');

  const handleFormSubmission = async () => {
    if (activeFormIndex === forms.length - 1) {
      const formData = {
        typeOfCustomer,
        salutation,
        firstName,
        lastName,
        gender,
        email,
        contact,
        findUs,
        time,
        date,
        from,
        to,
        whereOption,
        distance,
        floor,
        reports,
        permission,
        simage: isImageSelected ? selectedImage : '',
        lift,
        selectedRadio,
        internetLink,
        additionalDetail,
        selectedFile: selectedFile ? selectedFile.name : '',
      };
      const response = await fetch(`${apiPath}/leads/leads`, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const leadResponse = await response.json();
      if (leadResponse) {
        notify();
        getLeadList();
        closeModal();
        setActiveFormIndex(0);
      }
    } else {
      setActiveFormIndex(activeFormIndex + 1);
      setShowBackButton(true);
    }
  };
  const handleBackButtonClick = () => {
    if (activeFormIndex > 0) {
      setActiveFormIndex(activeFormIndex - 1);
      setShowBackButton(activeFormIndex > 1);
    }
  };

  const images = [
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(1).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(2).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(3).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(4).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(5).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(6).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(7).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(8).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(9).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(10).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(11).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(12).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(13).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(14).webp',
    'https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(15).webp',
  ];

  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image: any) => {
    setSelectedImage(image);
    setIsImageSelected(true);
  };

  const [selectedLead, setSelectedLead] = useState(null as any);
  const [comments, setComments] = useState([]);

  function handleLeadsClick(leadData: any) {
    setSelectedLead(leadData);
    fetch(`${apiPath}/api/commentListById/${leadData._id}`)
      .then((response) => response.json())
      .then((data) => {
        setComments(data);
      })
      .catch((error) => {
        console.error('Error :', error);
      });
  }

  function renderContactForm() {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Contact details
          </h3>
        </div>
        <form action="#">
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full">
                <label htmlFor="dropdown" className="block font-medium mb-2">
                  Type of customer:
                </label>
                <select
                  id="dropdown"
                  className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                  value={typeOfCustomer}
                  name="typeOfCustomer"
                  onChange={handleFormChange}
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  <option value="Commercial">Personal</option>
                  <option value="Particular">Commercial</option>
                </select>
              </div>
              <div className="w-full">
                <label htmlFor="dropdown" className="block font-medium mb-2">
                  Saluation
                </label>
                <select
                  id="dropdown"
                  className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                  value={salutation}
                  name="salutation"
                  onChange={handleFormChange}
                >
                  <option value="" disabled>
                    Select salutation
                  </option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Miss">Miss</option>
                </select>
              </div>

              <div className="w-full">
                <label className="mb-1.5 block text-black dark:text-white">
                  First name
                </label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  className="w-full p-2 rounded border-[1.5px] border-stroke bg-transparent font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="firstName"
                  value={firstName}
                  onChange={handleFormChange}
                />
              </div>

              <div className="w-full">
                <label className="mb-1.5 block text-black dark:text-white">
                  Last name
                </label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  className="w-full p-2 rounded border-[1.5px] border-stroke bg-transparent font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="lastName"
                  value={lastName}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Gender
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  value={gender}
                  name="gender"
                  onChange={handleFormChange}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Email <span className="text-meta-1">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                name="email"
                value={email}
                onChange={handleFormChange}
              />
            </div>

            <div className="w-full mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Contact
              </label>
              <input
                type="number"
                placeholder="Enter your contact no."
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                name="contact"
                value={contact}
                onChange={handleFormChange}
              />
              {error && (
                <p className="text-danger text-sm mt-2">{error}</p> // Error message if validation fails
              )}
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                How did you find us?
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  value={findUs}
                  name="findUs"
                  onChange={handleFormChange}
                >
                  <option value="" disabled>
                    Select plateform
                  </option>
                  <option value="Social media">Social media</option>
                  <option value="Google">Google</option>
                  <option value="Lead website">Lead website</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  function renderMoveForm() {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Moving Details
          </h3>
        </div>
        <form action="#">
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full">
                <label htmlFor="dropdown" className="block font-medium mb-2">
                  Do you know where you are*
                </label>
                <select
                  id="dropdown"
                  className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                  value={whereOption}
                  name="whereOption"
                  onChange={handleFormChange}
                >
                  {' '}
                  <option value="" disabled></option>
                  <option value="yes">yes I am comfortable</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="mb-4.5">
                <label className="mb-7 block text-black dark:text-white">
                  Moving date
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <input
                    type="Date"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent p-2 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="date"
                    value={date}
                    onChange={handleFormChange}
                    min={minDate}
                  />
                  {error && <p className="text-danger text-sm mt-2">{error}</p>}{' '}
                  {/* Display error message */}
                </div>
              </div>

              <div className="w-full">
                <label className="mb-7 block text-black dark:text-white">
                  Start time
                </label>
                <input
                  type="time"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent p-2 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="time"
                  value={time}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="w-full">
              <label className="mb-2.5 block text-black dark:text-white">
                From
              </label>
              <input
                type="text"
                placeholder="Enter address"
                name="from"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                value={from}
                onChange={handleFormChange}
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                to
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="Enter address"
                  name="to"
                  value={to}
                  onChange={handleFormChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  function renderRelocationForm() {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Address and property information
          </h3>
        </div>
        <form action="#">
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-64 mt-4">
                <label htmlFor="dropdown" className="block font-medium mb-2">
                  Choose property:
                </label>

                <input
                  type="checkbox"
                  id="imageSelector"
                  className="hidden"
                  name="simage"
                  checked={isImageSelected}
                  value={simage}
                  onChange={() => setIsImageSelected(!isImageSelected)}
                />
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer border ${
                        selectedImage === image
                          ? 'border-blue-500'
                          : 'border-gray-300'
                      }`}
                      onClick={() => handleImageClick(image)}
                    >
                      <img
                        src={image}
                        alt={`Image ${index}`}
                        className="mt-2 max-w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
                {selectedImage && (
                  <div className="mt-4">
                    <h2 className="text-lg font-semibold">
                      Selected Property:
                    </h2>
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="mt-2 max-w-full h-auto"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4.5">
                <label
                  htmlFor="dropdown"
                  className="mb-2.5 block text-black dark:text-white"
                >
                  Is lift available?
                </label>
                <div className="z-20 bg-transparent dark:bg-form-input">
                  <select
                    id="dropdown"
                    className="z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="lift"
                    value={lift}
                    onChange={handleFormChange}
                  >
                    <option value="" disabled></option>
                    <option value="yes">yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="mb-4.5">
                <label
                  htmlFor="dropdown"
                  className="mb-2.5 block text-black dark:text-white"
                >
                  Is permit needed?
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <select
                    id="dropdown"
                    className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="permission"
                    value={permission}
                    onChange={handleFormChange}
                  >
                    <option value="" disabled></option>
                    <option value="yes">yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-8.5 block text-black dark:text-white">
                  Any reports of the situation
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="reports"
                  value={reports}
                  onChange={handleFormChange}
                />
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-8.5 block text-black dark:text-white">
                  Which floor
                </label>
                <input
                  type="number"
                  placeholder=""
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="floor"
                  value={floor}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Waliking distance (in Meters){' '}
                <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                placeholder=""
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                name="distance"
                value={distance}
                onChange={handleFormChange}
              />
            </div>
          </div>
        </form>
      </div>
    );
  }

  function renderHouseHoldForm() {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
          <h2 className="text-2xl font-semibold mb-4">House Hold Details</h2>
          <form action="#">
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700">
                  How would you like to tell us the size of your household
                  inventory?
                </label>
                <div className="mt-2 space-y-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="send_email"
                      checked={selectedRadio === 'send_email'}
                      name="selectedRadio"
                      onChange={handleFormChange}
                    />
                    <span className="ml-2 mr-2">
                      I want to send an e-mail to info@universalmovers.nl
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="view_inventory"
                      name="selectedRadio"
                      checked={selectedRadio === 'view_inventory'}
                      onChange={handleFormChange}
                    />
                    <span className="ml-2 mr-2">
                      My house and inventory can be seen on the Internet
                    </span>
                  </label>
                  {selectedRadio === 'view_inventory' && (
                    <div>
                      <label className="block font-medium text-gray-700">
                        Internet link to view house
                      </label>
                      <input
                        className="w-full h-10 p-2 border rounded-md focus:ring-primary focus:border-dark"
                        placeholder="Internet link"
                        value={internetLink}
                        name="internetLink"
                        onChange={handleFormChange}
                      />
                    </div>
                  )}
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="upload_photo"
                      checked={selectedRadio === 'upload_photo'}
                      name="selectedRadio"
                      onChange={handleFormChange}
                    />
                    <span className="ml-2 mr-2">
                      I would like to upload photos/pdf of my inventory.
                    </span>
                  </label>
                  {selectedRadio === 'upload_photo' && (
                    <div>
                      <label className="block font-medium text-gray-700">
                        Choose File:
                      </label>
                      <input
                        type="file"
                        className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                        name="selectedFile"
                        onChange={handleFormChange}

                        // onChange={(event) => {
                        //   const file = event.target.files?.[0];
                        //   setSelectedFile(file || null);
                        // }}
                      />
                      {selectedFile && (
                        <div>
                          <p className="font-medium text-gray-700">
                            Selected File:
                          </p>
                          <p>{selectedFile.name}</p>
                        </div>
                      )}{' '}
                    </div>
                  )}
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="requirements"
                      checked={selectedRadio === 'requirements'}
                      name="selectedRadio"
                      onChange={handleFormChange}
                    />
                    <span className="ml-2 mr-2">
                      I would like to be called first to discuss my
                      requirements.
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="detail"
                      checked={selectedRadio === 'detail'}
                      name="selectedRadio"
                      onChange={handleFormChange}
                    />
                    <span className="ml-2 mr-2">
                      I will provide detail description.
                    </span>
                  </label>
                </div>
              </div>
              {selectedRadio === 'detail' && (
                <div>
                  <label className="block font-medium text-gray-700">
                    Additional Details:
                  </label>
                  <textarea
                    className="w-full h-20 p-2 border rounded-md focus:ring-primary focus:border-dark"
                    placeholder="Enter your details"
                    value={additionalDetail}
                    name="additionalDetail"
                    onChange={handleFormChange}
                  ></textarea>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  const [commentForm, setCommentForm] = useState({} as any);

  const handleCommentForm = (e: any) => {
    setCommentForm({
      ...commentForm,
      [e.target.name]: e.target.value,
    });
  };

  const submitCommentForm = async (e: any) => {
    e.preventDefault();
    const response = await fetch(`${apiPath}/api/comment`, {
      method: 'POST',
      body: JSON.stringify({
        userId: selectedLead._id,
        text: commentForm.comment,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const commentFormData = await response.json();
    console.log('data', commentFormData);
    commentForm.comment = null;
    handleLeadsClick(selectedLead);
  };
  return (
    <>
      <Breadcrumb pageName="Leads" />
      <div className="flex flex-col gap-[20px] xl:flex-row item-center">
        <div>
          <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight bg-gradient-to-r from-black to-primary bg-clip-text text-transparent md:text-5xl lg:text-4xl dark:text-white">
            Hi {username}, there are {leadList && leadList.length} tasks for
            you. Unpack for a while!
          </h1>
          <div className="flex justify-between">
            <button
              className="bg-button-color text-black active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1"
              type="button"
              onClick={() => {
                openModal();
              }}
            >
              Add new leads
            </button>

            <div>
              <input
                type="search"
                className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="border rounded-lg w-20 px-3 py-2 pl-5 pr-4 ml-1 focus:outline-none focus:border-blue-500"
                onClick={() => setShowFilterModal(!showFilterModal)}
              >
                Filter
              </button>
            </div>
          </div>
          {showFilterModal && (
            <div className="flex justify-between mt-3">
              <div>
                <div className="relative z-20 dark:bg-form-input">
                  <input
                    type="text"
                    placeholder="Team"
                    className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="firstName"
                  />
                </div>

                <div className="relative z-20 dark:bg-form-input">
                  <input
                    type="text"
                    placeholder="Case number"
                    className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="firstName"
                  />
                </div>
              </div>
              <div className="relative z-20 dark:bg-form-input">
                <input
                  type="text"
                  placeholder="Collegue"
                  className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="firstName"
                />
              </div>
            </div>
          )}

          <hr></hr>
          <h1 className="font-bold text-black mt-5">
            {' '}
            {leadList && leadList.length} results{' '}
          </h1>

          <Card className="w-full overflow-scroll mt-10">
            <table className="w-full min-w-max table-auto text-left">
              <tbody>
                {leadList &&
                  leadList.map((leadData: any) => (
                    <tr
                      key={leadData._id}
                      onClick={() => handleLeadsClick(leadData)} // Add click handler
                      style={{ cursor: 'pointer' }}
                      className="even:bg-black odd:bg-primary"
                    >
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal"
                        >
                          🕵🤚
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal"
                        >
                          🚩 Schedule a valutation at {leadData.firstName}{' '}
                          {leadData.lastName}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal"
                        >
                          Lead
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          as="a"
                          href="#"
                          variant="small"
                          color="white"
                          className="font-medium"
                        >
                          Open
                        </Typography>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div>
              <CustomPagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalLeads / pageSize)}
                onPageChange={handlePageChange}
              />
            </div>
          </Card>
        </div>
        <div className="border-l border-gray-300 flex-grow"></div>

        {!selectedLead && (
          <div className="w-[40%] flex flex-items-center">
            <div className="p-4">
              <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight bg-gradient-to-r from-black to-primary bg-clip-text text-transparent md:text-5xl lg:text-2xl dark:text-white">
                Shortcuts
              </h1>
              <h2 className="bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent">
                New customer
              </h2>
              <NavLink to="/customers">
                <img src={customer} alt="New customer" className="w-40 h-40" />
              </NavLink>

              <h2 className="bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent">
                New relocation existing customer
              </h2>
              <NavLink to="/jobs">
                <img src={move} alt="New move" className="w-40 h-40" />
              </NavLink>
              <h1 className="bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent">
                To employee app
              </h1>
              <img src={app} alt="To employee app" className="w-40 h-40" />
            </div>
            <div className="mt-16">
              <h2 className="bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent">
                New move
              </h2>
              <NavLink to="/jobs">
                <img
                  src={relocation}
                  alt="New relocation existing customer"
                  className="max-w-40 h-40"
                />
              </NavLink>
              <h2 className="bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent">
                New moving lift job
              </h2>
              <NavLink to="/jobs">
                <img
                  src={moveLift}
                  alt="New moving lift job"
                  className="w-50 h-40 mt-6"
                />
              </NavLink>
            </div>
          </div>
        )}

        {selectedLead && (
          <>
            <div className="w-1/2">
              <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-black md:text-5xl lg:text-2xl dark:text-white">
                Schedule a valuation at {selectedLead.firstName}{' '}
                {selectedLead.lastName} (2023-00025)
              </h1>
              <div className="mt-4 ml-5">
                <label htmlFor="dropdown" className="block font-extrabold mb-2">
                  APPOINTED TO
                </label>
                <select
                  id="dropdown"
                  className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                  // value={typeOfCustomer}
                  name="typeOfCustomer"
                  onChange={handleFormChange}
                  defaultValue={'Lead'}
                >
                  <option value="lead">Lead</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Particular">Personal</option>
                </select>
                <h3 className="font-semibold text-gray-700 mb-3 mt-3">
                  CUSTOMER INFORMATION :
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500">Customer</div>
                    <div className="text-gray-900 font-medium my-1">
                    {selectedLead.salutation} {selectedLead.firstName} {selectedLead.lastName}
                    </div>
                    <div className="text-gray-600 flex items-center">
                      <Phone fontSize="small" className="my-1 mr-2" />{' '}
                      {selectedLead.contact}
                    </div>
                    <div className="text-blue flex items-center">
                      <Mail fontSize="small" className="my-1 mr-2" />{' '}
                      {selectedLead.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 my-1">Offerred address</div>
                    <div className="text-gray-900 my-1 font-medium">
                      {selectedLead.from} {selectedLead.floor} <br/>
                      <EditCalendar/> {selectedLead.date}
                    </div>
                  </div>
                </div>
                <hr className="my-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="">
                  <h2 className="font-extrabold">Billing address:</h2>
                  <p>{selectedLead.to}</p>
                </div>
                <div>
                    <div className="font-extrabold">Reports</div>
                    <div className="text-gray-900 my-1 font-medium">
                      {selectedLead.reports}
                    </div>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="">
                  <h2 className="font-extrabold">Selected Property:</h2>
                  <img src={selectedLead.simage}></img>
                </div>
                
              </div>

              {comments && comments.length > 0 && (
                <Paper
                  elevation={3}
                  style={{ padding: '16px', margin: '16px' }}
                >
                  <Typography variant="h6" gutterBottom>
                    Comments
                  </Typography>
                  <Table>
                    <TableBody>
                      {comments.map((comment: any) => (
                        <TableRow
                          key={comment._id}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: '#6495ED',
                            },
                            '&:nth-of-type(even)': {
                              backgroundColor: '#5F9EA0', 
                            },
                          }}
                        >
                          <TableCell component="td" sx={{ color: 'white' }}>
                            <CommentIcon/> {comment.text} - {username}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              <form onSubmit={submitCommentForm}>
                <div className="mb-4.5">
                  <div className="relative z-20 bg-transparent dark:bg-form-input ml-5">
                    <input
                      type="textarea"
                      className="w-full rounded border-[1.5px] bg-white py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary  dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="comment"
                      value={commentForm.comment || ''}
                      onChange={handleCommentForm}
                    />
                  </div>
                </div>
                <button
                  className="bg-primary text-black active:bg-blue-500 
              font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ml-60"
                  type="submit"
                >
                  Post comment
                </button>
              </form>
            </div>
          </>
        )}

        <div className="flex items-center justify-center">
          {isModalOpen && (
            <div
              className={`fixed inset-0 flex items-center justify-center z-50  ${
                isModalOpen ? '' : 'hidden'
              }`}
            >
              <div className="fixed inset-0 bg-black opacity-80"></div>
              <div className="inset-0 flex items-center justify-center z-50 md:w-[80%] lg:w-[85%] xl:w-[95%]">
                <div
                  className="bg-white p-4 rounded-lg shadow-lg h-[34rem] overflow-auto"
                  ref={modalRef}
                >
                  <button
                    className="bg-blue-200 text-black active:bg-gray-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                    onClick={() => {
                      closeModal(), setActiveFormIndex(0);
                    }}
                  >
                    &times; Close
                  </button>
                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="flex flex-col gap-9">
                      {forms[activeFormIndex]()}

                      <div className="flex justify-between gap-3">
                        {showBackButton && (
                          <button
                            onClick={handleBackButtonClick}
                            className="flex justify-center rounded bg-primary p-3 font-medium text-gray"
                          >
                            Back
                          </button>
                        )}
                        <button
                          onClick={handleFormSubmission}
                          className="flex justify-center rounded bg-primary p-3 font-medium text-gray"
                        >
                          {activeFormIndex === forms.length - 1
                            ? 'Submit'
                            : 'Next'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Leads;
