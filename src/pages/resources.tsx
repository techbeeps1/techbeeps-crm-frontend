import { useEffect, useState, useRef } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setFormField, resetForm } from './Redux/formSlice';
import axios from 'axios';
import CountryDropdown from './CountryDropdown';
import CustomPagination from './UiElements/CustomPagination';

import EditSupplier from './EditTemplateForm/editSupplier';
import { apiPath } from '../../apiPath';
import useClickOutside from '../clickoutsider/clickOutside';

function Resources() {
  const [showModal, setShowModal] = useState(false);
  const [showBoxModal, setShowBoxModal] = useState(false);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showStorage, setShowStorage] = useState(true);
  const [showStorageComponent, setShowStorageComponent] = useState(true);
  const [showLoadStorageModal, setShowLoadStorageModal] = useState(false);
  const [showBoxComponent, setShowBoxComponent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => {
    setShowModal(false);
    setShowBoxModal(false);
    setShowSquadModal(false);
    setShowVehicleModal(false);
    setShowMaterialModal(false);
    setIsOrderModalOpen(false);
    setIsLoginModalOpen(false);
    setSelectedOption(null);
    setIsCostSelected(false);
    setIsStorageRemoveModalOpen(false);
    setIsRemoveModalOpen(false);
    setIsVehicleRemoveModalOpen(false);
    setShowLoadStorageModal(false);
  });

  const [showEmployeeComponent, setShowEmployeeComponent] = useState(false);

  const vehicleForms = [
    renderVehicleForm,
    renderLicenseVForm,
    renderMaintenanceForm,
    renderFuelCardForm,
  ];

  const loadStorageForms = [
    renderWhatForm,
    renderCustomerForm,
    renderBillingForm,
  ];

  const [activeFormIndex, setActiveFormIndex] = useState(0);
  const [showBackButton, setShowBackButton] = useState(false);
  const [showSquadComponent, setShowSquadComponent] = useState(false);

  const [showVehicleComponent, setShowVehicleComponent] = useState(false);

  const [showMaterialComponent, setShowMaterialComponent] = useState(false);

  const [, setSelectedFile] = useState<File | null>();
  const [countries, setCountries] = useState([]);

  const [bulletinList, setBulletinList] = useState([] as any);
  const [totalBulletins, setTotalBulletins] = useState(0);
  const [currentBulletinPage, setCurrentBulletinPage] = useState(1);
  const [searchBulletinTerm, setSearchBulletinTerm] = useState('');
  const bulletinPageSize = 5;

  const [boxList, setBoxList] = useState([] as any);
  const [totalBoxes, setTotalBoxes] = useState(0);
  const [currentBoxPage, setCurrentBoxPage] = useState(1);
  const [searchBoxTerm, setSearchBoxTerm] = useState('');
  const boxPageSize = 5;

  const [staffList, setStaffList] = useState([] as any);


  const [vehicleList, setVehicleList] = useState([] as any);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [currentVehiclePage, setCurrentVehiclePage] = useState(1);
  const [truckSelected, setTruckSelected] = useState(false);
  const [elivatorSelected, setEleivatorSelected] = useState(false);
  const [searchVehicleTerm, setSearchVehicleTerm] = useState('');
  const vehiclePageSize = 5;

  const [materialList, setMaterialList] = useState([] as any);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [currentMaterialPage, setCurrentMaterialPage] = useState(1);
  const [searchMaterialTerm, setSearchMaterialTerm] = useState('');
  const materialPageSize = 5;
  const [selectedRadio, setSelectedRadio] = useState('');
  const dispatch = useDispatch();

  const bulletinForm = 'bulletins';
  const bulletinFormState = useSelector(
    (state: any) => state.forms[bulletinForm],
  );

  const handleBulletinFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setFormField({ formName: bulletinForm, field: name, value } as any),
    );
  };

  const handleBulletinPageChange = (newPage: number) => {
    setCurrentBulletinPage(newPage);
  };

  const [selectedBulletin, setSelectedBulletin] = useState(null as any);
  const [isBulletinSelected, setIsBulletinSelceted] = useState(true);
  const [isActivitySelected, setIsActivitySelceted] = useState(false);
  const [isStorageRemoveModalOpen, setIsStorageRemoveModalOpen] =
    useState(false);
  const [isCostSelected, setIsCostSelected] = useState(false);

  const boxForm = 'boxes';
  const boxFormState = useSelector((state: any) => state.forms[boxForm]);

  const handleBoxFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(setFormField({ formName: boxForm, field: name, value } as any));
  };

  const handleBoxPageChange = (newPage: number) => {
    setCurrentBoxPage(newPage);
  };
  const [selectedBox, setSelectedBox] = useState(null as any);
  const [isBoxSelected, setIsBoxSelceted] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const staffForm = 'staff';

  const handleButtonClick = (value: any) => {
    dispatch(
      setFormField({ formName: staffForm, field: 'driverLicense', value }),
    );
  };


  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);


  const vehicleForm = 'vehicle';
  const vehicleFormState = useSelector(
    (state: any) => state.forms[vehicleForm],
  );

  const handleVehicleFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setFormField({ formName: vehicleForm, field: name, value } as any),
    );
    console.log(name, value);
  };

  const handleVehicleButtonClick = (value: any) => {
    dispatch(
      setFormField({ formName: vehicleForm, field: 'vehicleType', value }),
    );
  };

  const handleTowBarButtonClick = (value: any) => {
    dispatch(
      setFormField({ formName: vehicleForm, field: 'isTowBarExist', value }),
    );
  };

  const handleVehiclePageChange = (newPage: number) => {
    setCurrentVehiclePage(newPage);
  };

  const [selectedVehicle, setSelectedVehicle] = useState(null as any);
  const [isVehicleSelected, setIsVehicleSelceted] = useState(true);
  const [isTripSelected, setIsTripSelceted] = useState(false);
  const [isVehicleRemoveModalOpen, setIsVehicleRemoveModalOpen] =
    useState(false);

  const deleteVehicle = async (vehicleId: string) => {
    try {
      const response = await axios.delete(
        `${apiPath}/api/Resources/deleteVehicle/${vehicleId}`,
      );
      if (response.data.status) {
        setVehicleList(
          vehicleList.filter((vehicle: any) => vehicle._id !== vehicleId),
        );
        closeVehicleRemoveModal();
      } else {
        console.error('Error deleting customer:', response.data.msg);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  function handleVehicleClick(team: any) {
    setSelectedVehicle(team);
  }
  const openVehicleRemoveModal = () => {
    setIsVehicleRemoveModalOpen(true);
  };
  const closeVehicleRemoveModal = () => {
    setIsVehicleRemoveModalOpen(false);
  };

  const materialForm = 'materials';
  const materialFormState = useSelector(
    (state: any) => state.forms[materialForm],
  );

  const handleMaterialFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setFormField({ formName: materialForm, field: name, value } as any),
    );
    console.log(name, value);
  };

  const handleMaterialPageChange = (newPage: number) => {
    setCurrentMaterialPage(newPage);
  };

  const [selectedMaterial, setSelectedMaterial] = useState(null as any);
  const [isMaterialSelected, setIsMaterialSelceted] = useState(true);
  const [isOutstandingSelected, setIsOutstandingSelceted] = useState(false);
  const [isSupplierSelected, setIsSupplierSelceted] = useState(false);
  const [isOrderSelected, setIsOrderSelceted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [customers, setCustomers] = useState([] as any);

  function handleMaterialClick(material: any) {
    setSelectedMaterial(material);
    ReceivedInventoryListForMaterial(material);
    getSupplierListForMaterial(material);
    getMatchesSupplierListForMaterial(material);
    orderListForMaterial(material);
  }
  const handleOptionChange = (event: any) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    axios
      .get('https://restcountries.com/v3.1/all')
      .then((response: any) => {
        const countryNames = response.data.map(
          (country: any) => country.name.common,
        );
        setCountries(countryNames);
      })
      .catch((error: any) => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  const currentPage = 1;
  const pageSize = 5;

  useEffect(() => {
    // Make an API request to fetch customer data when the component mounts
    axios
      .get(`${apiPath}/customer/customerList?page=${currentPage}&pageSize=${pageSize}`)
      .then((response) => {
        setCustomers(response.data.customers);
      })
      .catch((error) => {
        console.error('Error fetching customer data:', error);
      });
  }, []);

  function handleStaffFormSubmission(){
    console.log('Submission')
  }

  // staff forms


  //vehicle forms
  function renderVehicleForm() {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Vehicle</h3>
        </div>
        <form onSubmit={handleVehicleFormSubmission}>
          <div className="ml-3 mt-2">
            <h2>Vehicle type</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 ml-3 mt-2">
            <Link
              to="#"
              onClick={() => {
                setTruckSelected(false),
                  setEleivatorSelected(false),
                  handleVehicleButtonClick('Vehicle');
              }}
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
              <span>
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                    fill=""
                  />
                  <path
                    d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                    fill=""
                  />
                  <path
                    d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                    fill=""
                  />
                </svg>
              </span>
              Vehicle
            </Link>
            <Link
              to="#"
              onClick={() => {
                setTruckSelected(true),
                  setEleivatorSelected(false),
                  handleVehicleButtonClick('Truck');
              }}
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-meta-3 py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-10"
            >
              <span>
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                    fill=""
                  />
                  <path
                    d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                    fill=""
                  />
                  <path
                    d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                    fill=""
                  />
                </svg>
              </span>
              Truck
            </Link>
            <Link
              to="#"
              onClick={() => {
                setTruckSelected(false),
                  setEleivatorSelected(true),
                  handleVehicleButtonClick('Moving elivator');
              }}
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-meta-3 py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-10"
            >
              <span>
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                    fill=""
                  />
                  <path
                    d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                    fill=""
                  />
                  <path
                    d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                    fill=""
                  />
                </svg>
              </span>
              Moving elivator
            </Link>
            <input
              type="text"
              name="vehicleType"
              onChange={handleVehicleButtonClick}
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 ml-4">
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Name
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="vehicle Name"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="vehicleName"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Price per kilometer
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="number"
                  placeholder=" Price per kilometer"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="priceKm"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Price per hour
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="number"
                  placeholder=" Price per hour."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="priceHr"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                License Plate
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="licensePlate"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                VIN
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="VIN"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="vin"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Modal
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="Modal"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="modal"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Fuel
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="fuel"
                  onChange={handleVehicleFormChange}
                >
                  <option value="">Select Fuel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hydrogen">Hydrogen</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Transmission
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="transmission"
                  onChange={handleVehicleFormChange}
                >
                  <option value="">Select transport</option>
                  <option value="Vending transmission">
                    Vending transmission
                  </option>
                  <option value="Manual transmission">
                    Manual transmission
                  </option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Counstruction year
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="date"
                  placeholder="city"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="constructionYear"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Purchase
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="puchase"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="purchase"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
          </div>

          <div className="ml-4">
            <span>Does the vehicle have tow bar?</span>
          </div>
          <div className="container mb-5 ml-3 mt-2">
            <Link
              to="#"
              onClick={() => handleTowBarButtonClick('Yes')}
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
              <span>
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                    fill=""
                  />
                  <path
                    d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                    fill=""
                  />
                  <path
                    d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                    fill=""
                  />
                </svg>
              </span>
              Yes
            </Link>

            <Link
              to="#"
              onClick={() => handleTowBarButtonClick('No')}
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-meta-3 py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-10"
            >
              <span>
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                    fill=""
                  />
                  <path
                    d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                    fill=""
                  />
                  <path
                    d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                    fill=""
                  />
                </svg>
              </span>
              No
            </Link>
            <input
              type="text"
              name="isTowBarExist"
              onChange={handleTowBarButtonClick}
              readOnly
            ></input>
          </div>

          {truckSelected && (
            <div className="grid grid-cols-2 gap-3 mt-4 ml-4">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  length
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <input
                    type="number"
                    placeholder="length"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="length"
                    onChange={handleVehicleFormChange}
                  />
                </div>
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  width
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <input
                    type="number"
                    placeholder="width"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="width"
                    onChange={handleVehicleFormChange}
                  />
                </div>
              </div>
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  height
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <input
                    type="number"
                    placeholder="height."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="height"
                    onChange={handleVehicleFormChange}
                  />
                </div>
              </div>
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  contents
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <input
                    type="text"
                    placeholder="contents"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="contents"
                    onChange={handleVehicleFormChange}
                  />
                </div>
              </div>
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Tailgate length
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <input
                    type="number"
                    placeholder="tailgate length"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="tgLength"
                    onChange={handleVehicleFormChange}
                  />
                </div>
              </div>
            </div>
          )}

          {elivatorSelected && (
            <div className="grid grid-cols-2 gap-3 mt-4 ml-4">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Floor
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <input
                    type="text"
                    placeholder="floor"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="floor"
                    onChange={handleVehicleFormChange}
                  />
                </div>
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  height
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <input
                    type="number"
                    placeholder="height"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="elHeight"
                    onChange={handleVehicleFormChange}
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }

  function renderLicenseVForm() {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Drivers license
          </h3>
        </div>
        <form onSubmit={handleStaffFormSubmission}>
          <div className="container mx-auto p-4">
            <button
              className="bg-blue-200 text-blue active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ml-3 mb-1"
              type="button"
              onClick={() => handleButtonClick('B')}
            >
              - <br></br> B
            </button>
            <button
              className="bg-blue-200 text-blue active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-2 mb-1"
              type="button"
              onClick={() => handleButtonClick('BE')}
            >
              - <br></br> BE
            </button>
            <button
              className="bg-blue-200 text-blue active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ml-3 mb-1"
              type="button"
              onClick={() => handleButtonClick('B+')}
            >
              - <br></br> B+
            </button>
            <button
              className="bg-blue-200 text-blue active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ml-3 mb-1"
              type="button"
              onClick={() => handleButtonClick('C')}
            >
              - <br></br> C
            </button>
            <button
              className="bg-blue-200 text-blue active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ml-3 mb-1"
              type="button"
              onClick={() => handleButtonClick('C1')}
            >
              - <br></br> C1
            </button>
            <button
              className="bg-blue-200 text-blue active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ml-3 mb-1"
              type="button"
              onClick={() => handleButtonClick('C1E')}
            >
              - <br></br> C1E
            </button>
            <button
              className="bg-blue-200 text-blue active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ml-3 mb-1"
              type="button"
              onClick={() => handleButtonClick('CE')}
            >
              - <br></br> CE
            </button>
            <br></br>
            <button
              className="bg-blue-200 text-blue active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ml-3 mb-1"
              type="button"
              onClick={() => handleButtonClick('C 95')}
            >
              - <br></br> C 95
            </button>
          </div>
          <input
            type="text"
            name="driverLicense"
            onChange={handleButtonClick}
            readOnly
          />
        </form>
      </div>
    );
  }

  function renderMaintenanceForm() {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Maintenance
          </h3>
        </div>
        <form onSubmit={handleVehicleFormSubmission}>
          <div className="grid grid-cols-2 gap-3 mt-4 ml-4">
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Dealer
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="dealer"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="dealer"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Leasing service
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="leasing service"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="leasing"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Next inspection
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="date"
                  placeholder="house no."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="inspection"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Maintenance required
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="date"
                  placeholder="..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="maintenance"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  function renderFuelCardForm() {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Fuel card</h3>
        </div>
        <form onSubmit={handleVehicleFormSubmission}>
          <div className="grid grid-cols-2 gap-3 mt-4 ml-4">
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Supplier
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="supplier"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="supplier"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Card number
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="card no."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="cardNumber"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                CVC
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="cvc"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="cvc"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Pin code
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="pincode"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="pinCode"
                  onChange={handleVehicleFormChange}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  //load storage forms
  function renderWhatForm() {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">What</h3>
        </div>
        <form onSubmit={handleLoadStorageFormSubmission}>
          <div className="grid grid-cols-2 gap-3 mt-4 ml-4">
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Percentage filled
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="number"
                  placeholder="%"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="percentage"
                  onChange={handleLoadStorageFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                notes
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="notes"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="notes"
                  onChange={handleLoadStorageFormChange}
                />
              </div>
            </div>
            <div>
              CONTENTS LIST <br />
              Archive is still empty
            </div>{' '}
            <br />
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                What
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="what"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="what"
                  onChange={handleLoadStorageFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Date
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="Date"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="date"
                  onChange={handleLoadStorageFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Employee
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="employee"
                  onChange={handleLoadStorageFormChange}
                >
                  <option value="">Select employee</option>
                  {staffList.map((staff: any) => (
                    <option key={staff._id} value={staff.firstName}>
                      {staff.firstName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <br />
            <div>
              THE COST OF ACTION <br />
              Do you want to invoice the handling costs?
            </div>
            <br />
            <div className="grid grid-cols-3 gap-3 ml-3 mt-2">
              <Link
                to="#"
                onClick={() => {
                  setIsCostSelected(true);
                  handleInvoiceSelectionClick('yes');
                }}
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
              >
                <span>
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                      fill=""
                    />
                    <path
                      d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                      fill=""
                    />
                    <path
                      d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                      fill=""
                    />
                  </svg>
                </span>
                yes
              </Link>
              <Link
                to="#"
                onClick={() => {
                  setIsCostSelected(false);
                  handleInvoiceSelectionClick('No');
                }}
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-meta-3 py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-10"
              >
                <span>
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                      fill=""
                    />
                    <path
                      d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                      fill=""
                    />
                    <path
                      d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                      fill=""
                    />
                  </svg>
                </span>
                No
              </Link>
            </div>
            <br />
            {isCostSelected && (
              <>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Description
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <input
                      type="text"
                      placeholder="description"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="description"
                      onChange={handleLoadStorageFormChange}
                    />
                  </div>
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Amount
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <input
                      type="text"
                      placeholder="amount"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="amount"
                      onChange={handleLoadStorageFormChange}
                    />
                  </div>
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Number
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <input
                      type="number"
                      placeholder="number"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="number"
                      onChange={handleLoadStorageFormChange}
                    />
                  </div>
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Action date
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <input
                      type="date"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="actionDate"
                      onChange={handleLoadStorageFormChange}
                    />
                  </div>
                  <br />
                  <input type="checkbox" name="invoiceSelected" /> invoiced
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    );
  }

  function renderCustomerForm() {
    return (
      <>
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">Customer</h3>
          </div>
          <div className="flex items-center justify-center h-80">
            <div className="h-80 overflow-y-auto">
              <form onSubmit={handleLoadStorageFormSubmission}>
                <div className="flex items-center justify-center mt-10">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="new_customer"
                      checked={selectedRadio === 'new_customer'}
                      name="selectedRadio"
                      onChange={handleLoadStorageFormChange}
                    />
                    <span className="ml-2 mr-2">New customer</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary"
                      value="existing_customer"
                      checked={selectedRadio === 'existing_customer'}
                      name="selectedRadio"
                      onChange={handleLoadStorageFormChange}
                    />
                    <span className="ml-2 mr-2">Existing customer</span>
                  </label>
                </div>
                {selectedRadio === 'new_customer' && (
                  <div className="p-6.5 w-150">
                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                      <div className="w-full xl:w-1/2">
                        <label
                          htmlFor="dropdown"
                          className="block font-medium mb-2"
                        >
                          Type of customer:
                        </label>
                        <select
                          id="dropdown"
                          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                          name="typeOfCustomer"
                          onChange={handleLoadStorageFormChange}
                        >
                          <option value="">Select type</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Particular">Particular</option>
                        </select>
                      </div>
                      <div className="w-full xl:w-1/2">
                        <label
                          htmlFor="dropdown"
                          className="block font-medium mb-2"
                        >
                          Saluation
                        </label>
                        <select
                          id="dropdown"
                          className="w-full p-2 mt-6 border rounded-md focus:outline-none focus:border-blue-500"
                          name="salutation"
                          onChange={handleLoadStorageFormChange}
                        >
                          <option value="">Select salutation</option>
                          <option value="Heer">Heer</option>
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Miss">Miss</option>
                        </select>
                      </div>

                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          First name
                        </label>
                        <input
                          type="text"
                          placeholder="first name"
                          className="w-full rounded border-[1.5px] mt-5 border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          name="firstName"
                          onChange={handleLoadStorageFormChange}
                        />
                      </div>

                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Last name
                        </label>
                        <input
                          type="text"
                          placeholder="last name"
                          className="w-full rounded border-[1.5px] mt-5 border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          name="lastName"
                          onChange={handleLoadStorageFormChange}
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
                          name="gender"
                          onChange={handleLoadStorageFormChange}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
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
                        onChange={handleLoadStorageFormChange}
                      />
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Contact
                      </label>
                      <input
                        type="number"
                        placeholder="Enter your contact no."
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="contact"
                        onChange={handleLoadStorageFormChange}
                      />
                    </div>

                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Language
                      </label>
                      <div className="relative z-20 bg-transparent dark:bg-form-input">
                        <select
                          className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          name="language"
                          onChange={handleLoadStorageFormChange}
                        >
                          <option value="">Select language</option>
                          <option value="Dutch">Dutch</option>
                          <option value="Engles">Engles</option>
                          <option value="German">German</option>
                          <option value="Frans">Frans</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        How did you find us?
                      </label>
                      <div className="relative z-20 bg-transparent dark:bg-form-input">
                        <select
                          className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          name="plateform"
                          onChange={handleLoadStorageFormChange}
                        >
                          <option value="">Select plateform</option>
                          <option value="Social media">Social media</option>
                          <option value="Google">Google</option>
                          <option value="Lead website">Lead website</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-b border-stroke py-3 px-1 dark:border-strokedark">
                      <h2 className="font-medium text-black dark:text-white">
                        Address
                      </h2>
                    </div>
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 mt-2 block text-black dark:text-white">
                        Postcode
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your Postcode"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="postCode"
                        onChange={handleLoadStorageFormChange}
                      />
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 mt-2 block text-black dark:text-white">
                        House number
                      </label>
                      <input
                        type="number"
                        placeholder="Enter your house number"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="houseNumber"
                        onChange={handleLoadStorageFormChange}
                      />
                    </div>
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 mt-2 block text-black dark:text-white">
                        Addition
                      </label>
                      <input
                        type="text"
                        placeholder="Addition"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="addition"
                        onChange={handleLoadStorageFormChange}
                      />
                    </div>
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 mt-2 block text-black dark:text-white">
                        Street
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your Street"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="street"
                        onChange={handleLoadStorageFormChange}
                      />
                    </div>
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 mt-2 block text-black dark:text-white">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your city"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="city"
                        onChange={handleLoadStorageFormChange}
                      />
                    </div>

                    <div className="mb-4.5">
                      <label className="mb-2.5 mt-2 block text-black dark:text-white">
                        Country
                      </label>
                      <CountryDropdown
                        countries={countries}
                        s
                        name="selectedCountry"
                        onChange={handleLoadStorageFormChange}
                      />
                    </div>
                  </div>
                )}
                {selectedRadio === 'existing_customer' && (
                  <div className="mb-4.5">
                    <label className="mb-2.5 mt-2 block text-black dark:text-white">
                      Customer
                    </label>
                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                      <select
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="selectedCustomer"
                        onChange={handleLoadStorageFormChange}
                      >
                        <option value="" disabled>
                          Select Customer
                        </option>
                        {customers.map((customer: any) => (
                          <option key={customer._id} value={customer.firstName}>
                            {customer.firstName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderBillingForm() {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Billing</h3>
        </div>
        <form onSubmit={handleLoadStorageFormSubmission}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 ml-4">
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Billing period
              </label>
              <div className="inline-block sm:flex">
                <button
                  className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                  onClick={() => {
                    handleBillingPeriodClick('Daily');
                  }}
                  type="button"
                >
                  Daily
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                  onClick={() => {
                    handleBillingPeriodClick('Weekly');
                  }}
                  type="button"
                >
                  Weekly
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                  onClick={() => {
                    handleBillingPeriodClick('Monthly');
                  }}
                  type="button"
                >
                  Monthly
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                  onClick={() => {
                    handleBillingPeriodClick('Quaterly');
                  }}
                  type="button"
                >
                  Quaterly
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                  onClick={() => {
                    handleBillingPeriodClick('Annual');
                  }}
                  type="button"
                >
                  Annual
                </button>
              </div>
            </div>
            <br />

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Is the price inclusive or exclusive of VAT?
              </label>
              <div className="flex">
                <button
                  className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                  onClick={() => {
                    handleVatClick('Including VAT');
                  }}
                  type="button"
                >
                  Including VAT
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                  onClick={() => {
                    handleVatClick('Exclusive VAT');
                  }}
                  type="button"
                >
                  Exclusive VAT
                </button>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Do you want to invoice storage in advance or after...
              </label>
              <div className="flex">
                <button
                  className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                  type="button"
                  onClick={() => handleInvoiceStorageClick('Prior to')}
                >
                  Prior to
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                  type="button"
                  onClick={() => handleInvoiceStorageClick('Afterwards')}
                >
                  Afterwards
                </button>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                BTW
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="btw"
                  onChange={handleLoadStorageFormChange}
                >
                  <option value="">BTW</option>
                  <option value="9%">9%</option>
                  <option value="21%">21%</option>
                  <option value="0%">0%</option>
                </select>
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Price
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="number"
                  placeholder="price"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="price"
                  onChange={handleLoadStorageFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Sales group
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="salesGroup"
                  onChange={handleLoadStorageFormChange}
                >
                  <option value="">Select group</option>
                  <option value="Transport">Transport</option>
                  <option value="bulletin">bulletin</option>
                  <option value="To deposit">To deposit</option>
                  <option value="Bussiness turnover">Bussiness turnover</option>
                  <option value="Private turnover">Private turnover</option>
                </select>
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Job
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="job"
                  onChange={handleLoadStorageFormChange}
                >
                  <option value="">Select job</option>
                  <option value="test data">test data</option>
                </select>
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Invoice reference
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="text"
                  placeholder="Invoice reference"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="invoice"
                  onChange={handleLoadStorageFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Start Date
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="date"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="startDate"
                  onChange={handleLoadStorageFormChange}
                />
              </div>
            </div>
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Last billed date
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <input
                  type="date"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  name="lastDate"
                  onChange={handleLoadStorageFormChange}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  const handleBackButtonClick = () => {
    if (activeFormIndex > 0) {
      setActiveFormIndex(activeFormIndex - 1);
      setShowBackButton(activeFormIndex > 1);
    }
  };

  const handleBulletinFormSubmission = async (e: any) => {
    e.preventDefault();
    const response = await fetch(`${apiPath}/api/Resources/createBulletin`, {
      method: 'POST',
      body: JSON.stringify(bulletinFormState),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('Form data to be saved:', data);
    dispatch(resetForm({ formName: bulletinForm } as any));
  };

  useEffect(() => {
    axios
      .get(
        `${apiPath}/api/Resources/bulletinList?page=${currentBulletinPage}&pageSize=${bulletinPageSize}`,
      )
      .then((response) => {
        setBulletinList(response.data.bulletinList);
        setTotalBulletins(response.data.totalBulletins);
      })
      .catch((error) => {
        console.error('Error fetching customer data:', error);
      });
  }, [currentBulletinPage]);

  useEffect(() => {
    async function searchBulletins() {
      try {
        const response = await axios.get(
          `${apiPath}/api/searchedBulletin?searchTerm=${searchBulletinTerm}`,
        );
        setBulletinList(response.data);
        setTotalBulletins(response.data.length);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    }
    // Only fetch customers when the searchTerm changes
    if (searchBulletinTerm.trim() !== '') {
      searchBulletins();
    } else {
      setCurrentBulletinPage(1);
      searchBulletins();
      // axios
      // .get(`${apiPath}/finance/FinanceList?page=${currentFinancePage}&pageSize=${financePageSize}`)
      // .then((response) => {
      //   setFinanceList(response.data.financeData);
      // })
      // .catch((error) => {
      //   console.error('Error fetching Finance Data:', error);
      // });
    }
  }, [searchBulletinTerm]);

  const loadStorageForm = 'loadStorage';
  const loadStorageformState = useSelector(
    (state: any) => state.forms[loadStorageForm],
  );

  const handleLoadStorageFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setFormField({ formName: loadStorageForm, field: name, value } as any),
    );
    switch (name) {
      case 'selectedRadio':
        setSelectedRadio(value);
        break;
      default:
        break;
    }
    console.log(name, value);
  };

  const handleInvoiceSelectionClick = (value: any) => {
    dispatch(
      setFormField({ formName: loadStorageForm, field: 'addCost', value }),
    );
  };

  const handleBillingPeriodClick = (value: any) => {
    dispatch(
      setFormField({
        formName: loadStorageForm,
        field: 'billingPeriod',
        value,
      }),
    );
  };

  const handleVatClick = (value: any) => {
    dispatch(setFormField({ formName: loadStorageForm, field: 'vat', value }));
  };

  const handleInvoiceStorageClick = (value: any) => {
    dispatch(
      setFormField({
        formName: loadStorageForm,
        field: 'invoiceStorage',
        value,
      }),
    );
  };

  const handleLoadStorageFormSubmission = async (e: any) => {
    if (activeFormIndex === loadStorageForms.length - 1) {
      e.preventDefault();
      console.log('Form data to be saved:', loadStorageformState);
      dispatch(resetForm({ formName: loadStorageForm } as any));
    } else {
      setActiveFormIndex(activeFormIndex + 1);
      setShowBackButton(true);
    }
    console.log('activeFormIndex', activeFormIndex);
  };

  const handleBoxFormSubmission = async (e: any) => {
    e.preventDefault();
    const response = await fetch(`${apiPath}/api/Resources/createBox`, {
      method: 'POST',
      body: JSON.stringify(boxFormState),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('Form data to be saved:', data);
    dispatch(resetForm({ formName: boxForm } as any));
  };

  useEffect(() => {
    axios
      .get(
        `${apiPath}/api/Resources/boxList?page=${currentBoxPage}&pageSize=${boxPageSize}`,
      )
      .then((response) => {
        setBoxList(response.data.boxList);
        setTotalBoxes(response.data.totalBoxes);
      })
      .catch((error) => {
        console.error('Error fetching customer data:', error);
      });
  }, [currentBoxPage]);

  useEffect(() => {
    async function searchBoxes() {
      try {
        const response = await axios.get(
          `${apiPath}/api/searchedBoxes?searchTerm=${searchBoxTerm}`,
        );
        setBoxList(response.data);
        setTotalBoxes(response.data.length);
      } catch (error) {
        console.error('Error fetching boxes:', error);
      }
    }
    if (searchBoxTerm.trim() !== '') {
      searchBoxes();
    } else {
      setCurrentBulletinPage(1);
      searchBoxes();
    }
  }, [searchBoxTerm]);

  const [, setReceivedInventoryList] = useState([] as any);
  const [orderList, setOrderList] = useState([] as any);
  const [addNewSupplier, setIsAddNewSupplier] = useState(false);
  const [addNewSupplierIntoSupplierList, setIsAddNewSupplierIntoSupplierList] =
    useState(false);
  const [isExistingSupplierSelected, setIsExistingSupplierSelected] =
    useState(false);
  const [isNewSupplierSelected, setIsNewSupplierSelected] = useState(false);
  const [supplierList, setSupplierList] = useState([] as any);
  const [allSupplierList, setAllSupplierList] = useState([] as any);
  const [isSupplierEditFormOpen, setIsSupplierEditFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState([] as any);
  const [isSupplierExist, setIsSupplierExist] = useState(false);

  const receivedInventoryForm = 'receivedInventory';
  const receivedInventoryFormState = useSelector(
    (state: any) => state.forms[receivedInventoryForm],
  );
  const handleReceivedInventoryFormFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setFormField({
        formName: receivedInventoryForm,
        field: name,
        value,
      } as any),
    );
    if (selectedBox) {
      dispatch(
        setFormField({
          formName: receivedInventoryForm,
          field: 'boxId',
          value: selectedBox._id,
        } as any),
      );
    } else {
      dispatch(
        setFormField({
          formName: receivedInventoryForm,
          field: 'materialId',
          value: selectedMaterial._id,
        } as any),
      );
    }

    console.log(name, value);
  };

  const otherForms = 'otherForms';
  const otherFormsState = useSelector((state: any) => state.forms[otherForms]);
  const handleOtherformsChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(setFormField({ formName: otherForms, field: name, value } as any));
    if (selectedBox) {
      dispatch(
        setFormField({
          formName: otherForms,
          field: 'boxId',
          value: selectedBox._id,
        } as any),
      );
    } else {
      dispatch(
        setFormField({
          formName: otherForms,
          field: 'materialId',
          value: selectedMaterial._id,
        } as any),
      );
    }
    console.log(name, value);
  };

  const supplierForm = 'supplier';
  const supplierFormState = useSelector(
    (state: any) => state.forms[supplierForm],
  );
  const handleSupplierFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setFormField({ formName: supplierForm, field: name, value } as any),
    );
    if (selectedBox) {
      dispatch(
        setFormField({
          formName: supplierForm,
          field: 'boxId',
          value: selectedBox._id,
        } as any),
      );
    } else {
      dispatch(
        setFormField({
          formName: supplierForm,
          field: 'materialId',
          value: selectedMaterial._id,
        } as any),
      );
    }
    console.log(name, value);
  };

  const ExistingSupplierForm = 'existingSupplier';
  const existingSupplierFormState = useSelector(
    (state: any) => state.forms[ExistingSupplierForm],
  );
  const handleExistingSupplierFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setFormField({
        formName: ExistingSupplierForm,
        field: name,
        value,
      } as any),
    );
    if (selectedBox) {
      dispatch(
        setFormField({
          formName: ExistingSupplierForm,
          field: 'boxId',
          value: selectedBox._id,
        } as any),
      );
    } else {
      dispatch(
        setFormField({
          formName: ExistingSupplierForm,
          field: 'materialId',
          value: selectedMaterial._id,
        } as any),
      );
    }
    console.log(name, value);
  };

  const handleReceivedInventory = async (e: any) => {
    e.preventDefault();
    const response = await fetch(`${apiPath}/api/Resources/Box/receivedInventory`, {
      method: 'POST',
      body: JSON.stringify(receivedInventoryFormState),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (selectedBox) {
      axios
        .get(
          `${apiPath}/api/Resources/boxList?page=${currentBoxPage}&pageSize=${boxPageSize}`,
        )
        .then((response) => {
          setBoxList(response.data.boxList);
          setTotalBoxes(response.data.totalBoxes);
        });
    } else {
      axios
        .get(
          `${apiPath}/api/Resources/materialList?page=${currentMaterialPage}&pageSize=${materialPageSize}`,
        )
        .then((response) => {
          setMaterialList(response.data.materialList);
          setTotalMaterials(response.data.totalMaterials);
        });
    }

    console.log('Form data to be saved:', data);
    dispatch(resetForm({ formName: receivedInventoryForm } as any));
    setIsLoginModalOpen(false);
  };

  function ReceivedInventoryList(boxData: any) {
    axios
      .get(
        `${apiPath}/api/Resources/Box/receivedInventoryList?boxId=${boxData._id}`,
      )
      .then((response) => {
        setReceivedInventoryList(response.data.receivedInventoryList);
      })
      .catch((error) => {
        console.error('Error fetching :', error);
      });
  }

  const handleOrders = async (e: any) => {
    e.preventDefault();
    const response = await fetch(`${apiPath}/api/Resources/Box/order`, {
      method: 'POST',
      body: JSON.stringify(receivedInventoryFormState),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setIsOrderModalOpen(false);
    console.log('ORDER DATA', data);
    if (selectedBox) {
      axios
        .get(`${apiPath}/api/Resources/Box/orderList?boxId=${selectedBox._id}`)
        .then((response) => {
          setOrderList(response.data.orderList);
        });
    } else {
      axios
        .get(
          `${apiPath}/api/Resources/Box/orderList?materialId=${selectedMaterial._id}`,
        )
        .then((response) => {
          setOrderList(response.data.orderList);
        });
    }
  };

  function orderListForBox(boxData: any) {
    axios
      .get(`${apiPath}/api/Resources/Box/orderList?boxId=${boxData._id}`)
      .then((response) => {
        setOrderList(response.data.orderList);
      })
      .catch((error) => {
        console.error('Error fetching :', error);
      });
  }

  const getSupplierName = (supplierId: string) => {
    const foundSupplier = supplierList.find(
      (supplier: any) => supplier._id === supplierId,
    );
    console.log('found ', foundSupplier);
    return foundSupplier ? foundSupplier.companyName : 'Unknown Supplier';
  };

  const handleReportWornOut = async (e: any) => {
    e.preventDefault();
    const response = await fetch(`${apiPath}/api/Resources/Box/reportWornOut`, {
      method: 'POST',
      body: JSON.stringify(receivedInventoryFormState),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (selectedBox) {
      axios
        .get(
          `${apiPath}/api/Resources/boxList?page=${currentBoxPage}&pageSize=${boxPageSize}`,
        )
        .then((response) => {
          setBoxList(response.data.boxList);
          setTotalBoxes(response.data.totalBoxes);
        });
    } else {
      axios
        .get(
          `${apiPath}/api/Resources/materialList?page=${currentMaterialPage}&pageSize=${materialPageSize}`,
        )
        .then((response) => {
          setMaterialList(response.data.materialList);
          setTotalMaterials(response.data.totalMaterials);
        });
    }
    console.log('Form data to be saved:', data);
    dispatch(resetForm({ formName: receivedInventoryForm } as any));
    setSelectedOption(null);
  };

  const handleSold = async (e: any) => {
    e.preventDefault();
    if (selectedOption === 'To sell') {
      const response = await fetch(`${apiPath}/api/Resources/Box/sold`, {
        method: 'POST',
        body: JSON.stringify(otherFormsState),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await response.json();
    } else if (selectedOption === 'Rent out') {
      const response = await fetch(`${apiPath}/api/Resources/Box/reportOut`, {
        method: 'POST',
        body: JSON.stringify(otherFormsState),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await response.json();
    } else {
      const response = await fetch(`${apiPath}/api/Resources/Box/reportIn`, {
        method: 'POST',
        body: JSON.stringify(otherFormsState),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await response.json();
    }
    if (selectedBox) {
      axios
        .get(
          `${apiPath}/api/Resources/boxList?page=${currentBoxPage}&pageSize=${boxPageSize}`,
        )
        .then((response) => {
          setBoxList(response.data.boxList);
          setTotalBoxes(response.data.totalBoxes);
        });
    } else {
      axios
        .get(
          `${apiPath}/api/Resources/materialList?page=${currentMaterialPage}&pageSize=${materialPageSize}`,
        )
        .then((response) => {
          setMaterialList(response.data.materialList);
          setTotalMaterials(response.data.totalMaterials);
        });
    }
    dispatch(resetForm({ formName: otherForms } as any));
    setSelectedOption(null);
  };

  const handleSupplierFormSubmission = async (e: any) => {
    console.log('hello');
    e.preventDefault();
    if (!isExistingSupplierSelected) {
      const response = await fetch(`${apiPath}/api/Resources/Box/supplier`, {
        method: 'POST',
        body: JSON.stringify(supplierFormState),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Form data to be saved:', data);
      if (selectedBox) {
        axios
          .get(`${apiPath}/api/Resources/Box/supplierList?boxId=${selectedBox._id}`)
          .then((response) => {
            setSupplierList(response.data.supplierList);
          });
      } else {
        axios
          .get(
            `${apiPath}/api/Resources/Box/supplierList?materialId=${selectedMaterial._id}`,
          )
          .then((response) => {
            setSupplierList(response.data.supplierList);
          });
      }
    } else {
      const response = await fetch(
        `${apiPath}/api/Resources/Box/existingSupplier`,
        {
          method: 'POST',
          body: JSON.stringify(existingSupplierFormState),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await response.json();
      console.log('Existing data to be saved:', data);
      if (selectedBox) {
        axios
          .get(
            `${apiPath}/api/Resources/Box/allSupplierList/?boxId=${selectedBox._id}`,
          )
          .then((response) => {
            setAllSupplierList(response.data.allSupplierList);
          });
      } else {
        axios
          .get(
            `${apiPath}/api/Resources/Box/allSupplierList/?materialId=${selectedMaterial._id}`,
          )
          .then((response) => {
            setAllSupplierList(response.data.allSupplierList);
          });
      }
    }

    dispatch(resetForm({ formName: supplierFormState } as any));
    setIsNewSupplierSelected(false);
    setIsExistingSupplierSelected(false);
  };

  function getSupplierList(boxData: any) {
    axios
      .get(`${apiPath}/api/Resources/Box/supplierList?boxId=${boxData._id}`)
      .then((response) => {
        setSupplierList(response.data.supplierList);
        response.data.supplierList.length
          ? setIsSupplierExist(false)
          : setIsSupplierExist(true);
      })
      .catch((error) => {
        console.error('Error fetching :', error);
      });
  }

  function getMatchesSupplierList(boxData: any) {
    axios
      .get(`${apiPath}/api/Resources/Box/allSupplierList/?boxId=${boxData._id}`)
      .then((response) => {
        setAllSupplierList(response.data.allSupplierList);
      })
      .catch((error) => {
        console.error('Error fetching :', error);
      });
  }

  const handleEditSupplierSubmit = async (editedData: any) => {
    try {
      const response = await fetch(
        `${apiPath}/api/Resources/Box/editSupplier/${editedData._id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editedData),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        axios
          .get(`${apiPath}/api/Resources/Box/supplierList?boxId=${selectedBox._id}`)
          .then((response) => {
            setSupplierList(response.data.supplierList);
          });
      }
    } catch (error) {
      // Handle errors (e.g., show an error message to the user)
      console.error('Error updating supplier:', error);
      throw error; // Rethrow the error to be caught by the higher-level catch block
    }
    setIsSupplierEditFormOpen(false);
  };

  const handleEditButtonClick = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsSupplierEditFormOpen(true);
  };

  const handleVehicleFormSubmission = async (e: any) => {
    e.preventDefault();
    if (activeFormIndex === vehicleForms.length - 1) {
      const response = await fetch(`${apiPath}/api/Resources/addVehicle`, {
        method: 'POST',
        body: JSON.stringify(vehicleFormState),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Form data to be saved:', data);
      dispatch(resetForm({ formName: staffForm } as any));
    } else {
      setActiveFormIndex(activeFormIndex + 1);
      setShowBackButton(true);
    }
    console.log('activeFormIndex', activeFormIndex);
  };

  useEffect(() => {
    axios
      .get(
        `${apiPath}/api/Resources/vehicleList?page=${currentVehiclePage}&pageSize=${vehiclePageSize}`,
      )
      .then((response) => {
        setVehicleList(response.data.vehicleList);
        setTotalVehicles(response.data.totalVehicles);
      })
      .catch((error) => {
        console.error('Error fetching customer data:', error);
      });
  }, [currentVehiclePage]);

  useEffect(() => {
    async function searchVehicle() {
      try {
        const response = await axios.get(
          `${apiPath}/api/searchedVehicle?searchTerm=${searchVehicleTerm}`,
        );
        setVehicleList(response.data);
        setTotalVehicles(response.data.length);
      } catch (error) {
        console.error('Error fetching boxes:', error);
      }
    }
    if (searchVehicleTerm.trim() !== '') {
      searchVehicle();
    } else {
      setCurrentVehiclePage(1);
      searchVehicle();
    }
  }, [searchVehicleTerm]);

  const handleMaterialFormSubmission = async (e: any) => {
    e.preventDefault();
    const response = await fetch(`${apiPath}/api/Resources/createMaterial`, {
      method: 'POST',
      body: JSON.stringify(materialFormState),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('Form data to be saved:', data);
    dispatch(resetForm({ formName: materialForm } as any));
  };

  useEffect(() => {
    axios
      .get(
        `${apiPath}/api/Resources/materialList?page=${currentMaterialPage}&pageSize=${materialPageSize}`,
      )
      .then((response) => {
        setMaterialList(response.data.materialList);
        setTotalMaterials(response.data.totalMaterials);
      })
      .catch((error) => {
        console.error('Error fetching material data:', error);
      });
  }, [currentMaterialPage]);

  useEffect(() => {
    async function searchMaterial() {
      try {
        const response = await axios.get(
          `${apiPath}/api/searchedMaterial?searchTerm=${searchMaterialTerm}`,
        );
        setMaterialList(response.data);
        setTotalMaterials(response.data.length);
      } catch (error) {
        console.error('Error fetching boxes:', error);
      }
    }
    if (searchMaterialTerm.trim() !== '') {
      searchMaterial();
    } else {
      setCurrentMaterialPage(1);
      searchMaterial();
    }
  }, [searchMaterialTerm]);

  function ReceivedInventoryListForMaterial(materialData: any) {
    axios
      .get(
        `${apiPath}/api/Resources/Box/receivedInventoryList?materialId=${materialData._id}`,
      )
      .then((response) => {
        setReceivedInventoryList(response.data.receivedInventoryList);
      })
      .catch((error) => {
        console.error('Error fetching :', error);
      });
  }

  function getSupplierListForMaterial(materialData: any) {
    axios
      .get(
        `${apiPath}/api/Resources/Box/supplierList?materialId=${materialData._id}`,
      )
      .then((response) => {
        setSupplierList(response.data.supplierList);
        response.data.supplierList.length
          ? setIsSupplierExist(false)
          : setIsSupplierExist(true);
      })
      .catch((error) => {
        console.error('Error fetching :', error);
      });
  }

  function getMatchesSupplierListForMaterial(materialData: any) {
    axios
      .get(
        `${apiPath}/api/Resources/Box/allSupplierList/?materialId=${materialData._id}`,
      )
      .then((response) => {
        setAllSupplierList(response.data.allSupplierList);
      })
      .catch((error) => {
        console.error('Error fetching :', error);
      });
  }

  function orderListForMaterial(materialData: any) {
    axios
      .get(`${apiPath}/api/Resources/Box/orderList?materialId=${materialData._id}`)
      .then((response) => {
        setOrderList(response.data.orderList);
      })
      .catch((error) => {
        console.error('Error fetching :', error);
      });
  }

  // vehicle trip registration table
  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const startDate = new Date('2023-11-06');

  const dayRows = days.map((day, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const formattedDate = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
    return (
      <tr key={day}>
        <td>{day}</td>
        <td>{formattedDate}</td>
        <td></td>
        <td></td>
        <td>0</td>
        <td>0</td>
      </tr>
    );
  });
  const weekInfo = `Week 45: 6 to 12 November`;

  // staff availability slider


  function preventHorizontalKeyboardNavigation(event: any) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
    }
  }

  function formattedDateTime(dateTimeString: Date, updateDate: Date) {
    const inputDate = new Date(dateTimeString);
    const updateAt = new Date(updateDate);

    const formattedDate = `${inputDate.toLocaleDateString(
      'en-GB',
    )} ${updateAt.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    return formattedDate;
  }

  return (
    <>
      <Breadcrumb pageName="Resources" />
      <div className="flex items-center overflow-auto">
        <button
          type="button"
          className="ml-5 mb-5"
          onClick={() => {
            setShowStorageComponent(true);
            setShowBoxComponent(false);
            setShowEmployeeComponent(false);
            setShowSquadComponent(false);
            setShowVehicleComponent(false);
            setShowMaterialComponent(false);
          }}
        >
          Bulletin
        </button>
        <button
          type="button"
          className="ml-5 mb-5"
          onClick={() => {
            setShowBoxComponent(true);
            setShowStorageComponent(false);
            setShowEmployeeComponent(false);
            setShowSquadComponent(false);
            setShowVehicleComponent(false);
            setShowMaterialComponent(false);
          }}
        >
          Boxes
        </button>
        <button
          type="button"
          className="ml-5 mb-5"
          onClick={() => {
            setShowEmployeeComponent(false);
            setShowStorageComponent(false);
            setShowBoxComponent(false);
            setShowSquadComponent(false);
            setShowVehicleComponent(true);
            setShowMaterialComponent(false);
          }}
        >
          Vehicles
        </button>
        <button
          type="button"
          className="ml-5 mb-5"
          onClick={() => {
            setShowEmployeeComponent(false);
            setShowStorageComponent(false);
            setShowBoxComponent(false);
            setShowSquadComponent(false);
            setShowVehicleComponent(false);
            setShowMaterialComponent(true);
          }}
        >
          Materials
        </button>
      </div>
      <hr></hr>
      <br></br>

      {showStorageComponent && (
        <>
          <div className="flex flex-col gap-[20px] xl:flex-row item-center">
            <div>
              <div className="flex justify-between p-2">
                <button
                  className="bg-button-color text-black active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                  type="button"
                  onClick={() => setShowModal(true)}
                >
                  New Storage
                </button>
                <div>
                  <input
                    type="search"
                    className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-5 focus:outline-none focus:border-blue-500"
                    placeholder="Search..."
                    value={searchBulletinTerm}
                    onChange={(e) => setSearchBulletinTerm(e.target.value)}
                  />
                  <button
                    className="border rounded-lg w-20 px-3 py-2 pl-5 pr-4 ml-5 focus:outline-none focus:border-blue-500"
                    onClick={() => setShowFilterModal(!showFilterModal)}
                  >
                    Filter
                  </button>
                </div>
              </div>
              {showFilterModal && (
                <div className="flex">
                  <div>
                    <div className="p-6.5">
                      <div className="mb-4.5">
                        <div className="relative z-20 dark:bg-form-input">
                          <input
                            type="text"
                            placeholder="Customer"
                            className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            name="firstName"
                            // value={searchData.firstName}
                            // onChange={handleSearchInputChange}
                          />
                        </div>
                      </div>

                      <div className="mb-4.5">
                        <div className="relative z-20 dark:bg-form-input">
                          <input
                            type="text"
                            placeholder="Storage Number"
                            className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            name="firstName"
                            // value={searchData.firstName}
                            // onChange={handleSearchInputChange}
                          />
                        </div>
                      </div>
                      <div className="mb-4.5">
                        <div className="relative z-20  bg-dark dark:bg-form-input">
                          <input
                            type="text"
                            placeholder="Seal"
                            className="w-50 rounded border-[1.5px] border-  stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            name="Seal"
                            // value={searchData.firstName}
                            // onChange={handleSearchInputChange}
                          />
                        </div>
                      </div>
                      <div className="mb-4.5">
                        <div className="relative z-20 dark:bg-form-input">
                          <input
                            type="text"
                            placeholder="Minimum Value"
                            className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            name="firstName"
                            // value={searchData.firstName}
                            // onChange={handleSearchInputChange}
                          />
                        </div>
                      </div>
                      <div className="mb-4.5">
                        <div className="relative z-20 dark:bg-form-input">
                          <input
                            type="date"
                            placeholder="Last billed for"
                            className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            name="firstName"
                            // value={searchData.firstName}
                            // onChange={handleSearchInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="container mx-auto p-4">
                      <button
                        className="bg-blue-200 text-blue active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ml-3 mb-1"
                        type="button"
                      >
                        Free
                      </button>
                      <button
                        className="bg-blue-200 text-blue active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-2 mb-1"
                        type="button"
                      >
                        In use
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <div className="grid grid-cols-2 gap-50 overflow-x-auto">
                  <div className="col-span-1">
                    <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                      <div className="overflow-hidden">
                        <table className="min-w-full text-left text-sm font-light">
                          <thead className="border-b font-medium dark:border-neutral-500">
                            <tr>
                              <th scope="col" className="px-6 py-4">
                                Type
                              </th>
                              <th scope="col" className="px-6 py-4">
                                Nr
                              </th>
                              <th scope="col" className="px-6 py-4">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-4">
                                Contents
                              </th>
                              <th scope="col" className="px-6 py-4">
                                Customer
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulletinList.map(
                              (bulletin: any, index: number) => (
                                <tr
                                  key={bulletin._id}
                                  style={{ cursor: 'pointer' }}
                                  className={`${
                                    index % 2 === 0 ? 'bg-gray-100' : ''
                                  } border-b dark:border-neutral-500`}
                                  onClick={() => {
                                    setSelectedBulletin(bulletin);
                                  }}
                                >
                                  <td className="whitespace-nowrap px-6 py-4 font-medium">
                                    {bulletin.type}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    {bulletin.storageNumber}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    free
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    {bulletin.contents}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <div>
                <CustomPagination
                  currentPage={currentBulletinPage}
                  totalPages={Math.ceil(totalBulletins / bulletinPageSize)}
                  onPageChange={handleBulletinPageChange}
                />
              </div>
            </div>

            <div className="border-l border-gray-300 flex-grow"></div>

            {selectedBulletin && (
              <>
                <div className="w-full p-4">
                  <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight bg-gradient-to-r from-black to-primary bg-clip-text text-transparent md:text-5xl lg:text-2xl dark:text-white">
                    {selectedBulletin.storageNumber}
                  </h1>

                  <div className="flex items-center">
                    <button
                      type="button"
                      className="ml-5 mb-5"
                      onClick={() => {
                        setIsBulletinSelceted(true);
                        setIsActivitySelceted(false);
                      }}
                    >
                      <pre>Bulletin</pre>
                    </button>
                    <button
                      type="button"
                      className="ml-5 mb-5 opacity-40"
                      disabled
                    >
                      The cost of action
                    </button>
                    <button
                      type="button"
                      className="ml-5 mb-5 opacity-40"
                      disabled
                    >
                      <pre>Doucuments</pre>
                    </button>
                    <button
                      type="button"
                      className="ml-5 mb-5"
                      onClick={() => {
                        setIsActivitySelceted(true);
                        setIsBulletinSelceted(false);
                      }}
                    >
                      Activity
                    </button>
                  </div>
                  <hr></hr>
                  <br></br>

                  {isBulletinSelected && (
                    <>
                      <div className="flex">
                        <button
                          className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                          onClick={() => {
                            setShowLoadStorageModal(true);
                          }}
                        >
                          Load storage
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                          onClick={() => {
                            setIsStorageRemoveModalOpen(true);
                          }}
                        >
                          Delete Storage
                        </button>
                      </div>

                      <div className="flex">
                        <div>
                          <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent mt-4">
                            SPECIFICATIONS
                          </h2>
                          <p>{selectedBulletin.type}</p>
                          <p>{selectedBulletin.contents}</p>
                        </div>
                        <div className="ml-20">
                          <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent mt-4">
                            LOCATION
                          </h2>
                          <p>
                            {selectedBulletin.street}{' '}
                            {selectedBulletin.houseNumber}{' '}
                            {selectedBulletin.addition}
                          </p>
                          <p>
                            {selectedBulletin.pinCode} {selectedBulletin.city}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent mt-4">
                          CONTENTS LIST
                        </h2>
                        <p>Storage is still empty</p>
                      </div>
                      <div>
                        <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent mt-4">
                          NOTES
                        </h2>
                        <p>No notes</p>
                      </div>
                      <div>
                        <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent mt-4">
                          CONTRACT
                        </h2>
                        <p>The storage is still available.</p>
                      </div>
                    </>
                  )}

                  {isActivitySelected && <p>No activities have taken place</p>}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-center">
            {showModal && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50  ${
                  showModal ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div className="inset-0 flex items-center justify-center z-50 md:w-[80%] lg:w-[85%] xl:w-[95%]">
                  <div
                    className="w-full max-w-screen-xl bg-gray p-4 rounded-lg shadow-lg h-[34rem] overflow-auto"
                    ref={modalRef}
                  >
                    <div className="modal-container bg-white w-full max-w-screen rounded shadow-lg z-50 overflow-x-auto">
                      <div className="modal-content w-full py-4 text-left px-6">
                        {/* Close button */}
                        <div className="flex justify-between">
                          <div></div>
                          <button
                            className="modal-close cursor-pointer z-50"
                            onClick={() => setShowModal(false)}
                          >
                            <svg
                              className="fill-current text-black"
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                            >
                              <path d="M5.293 5.293a1 1 0 011.414 0L9 7.586l2.293-2.293a1 1 0 111.414 1.414L10.414 9l2.293 2.293a1 1 0 11-1.414 1.414L9 10.414l-2.293 2.293a1 1 0 01-1.414-1.414L7.586 9 5.293 6.707a1 1 0 010-1.414z"></path>
                            </svg>
                          </button>
                        </div>
                        {/* Modal content */}
                        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                              Add new storage
                            </h3>
                          </div>
                          <span className="ml-4">
                            You can add storage in bulk by filling in the excel
                            file, it is also possible to fill in the form below.
                          </span>
                          <div className="col-6 p-4">
                            <Link
                              to="#"
                              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                              onClick={() => {
                                setShowUpload(true);
                                setShowStorage(false);
                              }}
                            >
                              <span>
                                <svg
                                  className="fill-current"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                                    fill=""
                                  />
                                  <path
                                    d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                                    fill=""
                                  />
                                  <path
                                    d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                                    fill=""
                                  />
                                </svg>
                              </span>
                              Bulk add
                            </Link>

                            <Link
                              to="#"
                              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-meta-3 py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-10"
                              onClick={() => {
                                setShowStorage(true);
                                setShowUpload(false);
                              }}
                            >
                              <span>
                                <svg
                                  className="fill-current"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                                    fill=""
                                  />
                                  <path
                                    d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                                    fill=""
                                  />
                                  <path
                                    d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                                    fill=""
                                  />
                                </svg>
                              </span>
                              Add some
                            </Link>
                          </div>
                          <form onSubmit={handleBulletinFormSubmission}>
                            {showUpload && (
                              <div className="ml-4 mt-10">
                                upload document <br />
                                <input
                                  type="file"
                                  className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                                  name="selectedFile"
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    setSelectedFile(file || null);
                                  }}
                                />
                                <Link
                                  to="#"
                                  className="flex mt-10 text-primary hover:bg-opacity-90"
                                >
                                  Download sample file
                                </Link>
                              </div>
                            )}
                            {showStorage && (
                              <div className="grid md:grid-cols-2 gap-3 mt-4 ml-4">
                                <div className="mb-4.5">
                                  <label className="mb-2.5 block text-black dark:text-white ml-5 sm:ml-0">
                                    Storage number
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="Storage number"
                                      className="w-75 sm:w-full ml-4 sm:ml-0  rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="storageNumber"
                                      onChange={handleBulletinFormChange}
                                    />
                                  </div>
                                </div>

                                <div className="mb-4.5">
                                  <label className=" ml-5 sm:ml-0 mb-2.5 block text-black dark:text-white">
                                    Type
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <select
                                      className="w-75 sm:w-full ml-4 sm:ml-0 relative z-20 appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="type"
                                      onChange={handleBulletinFormChange}
                                    >
                                      {' '}
                                      <option value="">Select type</option>
                                      <option value="Container">
                                        Container
                                      </option>
                                      <option value="Pallet">Pallet</option>
                                      <option value="Chest">Chest</option>
                                      <option value="Unit">Unit</option>
                                      <option value="Conventional">
                                        Conventional
                                      </option>
                                      <option value="Archive">Archive</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="mb-4.5">
                                  <label className="ml-5 sm:ml-0 mb-2.5 block text-black dark:text-white">
                                    Contents
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="contents.."
                                      className="w-75 sm:w-full ml-4 sm:ml-0 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="contents"
                                      onChange={handleBulletinFormChange}
                                    />
                                  </div>
                                </div>
                                <div className="mb-4.5">
                                  <label className="ml-5 sm:ml-0 mb-2.5 block text-black dark:text-white">
                                    Post code
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="post code"
                                      className="w-75 sm:w-full ml-4 sm:ml-0 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="postCode"
                                      onChange={handleBulletinFormChange}
                                    />
                                  </div>
                                </div>
                                <div className="mb-4.5">
                                  <label className="ml-5 sm:ml-0 mb-2.5 block text-black dark:text-white">
                                    House number
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="house no."
                                      className="w-75 sm:w-full ml-4 sm:ml-0 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="houseNumber"
                                      onChange={handleBulletinFormChange}
                                    />
                                  </div>
                                </div>
                                <div className="mb-4.5">
                                  <label className="ml-5 sm:ml-0 mb-2.5 block text-black dark:text-white">
                                    Street
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="street"
                                      className="w-75 sm:w-full ml-4 sm:ml-0 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="street"
                                      onChange={handleBulletinFormChange}
                                    />
                                  </div>
                                </div>
                                <div className="mb-4.5">
                                  <label className="ml-5 sm:ml-0 mb-2.5 block text-black dark:text-white">
                                    City
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="city"
                                      className="w-75 sm:w-full ml-4 sm:ml-0 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="city"
                                      onChange={handleBulletinFormChange}
                                    />
                                  </div>
                                </div>
                                <div className="mb-4.5">
                                  <label className="ml-5 sm:ml-0 mb-2.5 block text-black dark:text-white">
                                    Country
                                  </label>
                                  <CountryDropdown
                                    countries={countries}
                                    s
                                    name="selectedCountry"
                                    onChange={handleBulletinFormChange}
                                  />
                                </div>
                              </div>
                            )}
                            <div className="justify-center sm:justify-end pt-2 grid grid-col-1">
                              <button
                                className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-10 focus:outline-none focus:border-blue-500"
                                onClick={() => setShowModal(false)}
                              >
                                Cancel
                              </button>
                              <button
                                className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-10 focus:outline-none focus:border-blue-500 mt-5 sm:mt-0"
                                type="submit"
                              >
                                New storage
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* storage remove modal */}
          <div className="max-h-screen flex items-center justify-center">
            {isStorageRemoveModalOpen && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  isStorageRemoveModalOpen ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div className="inset-0 w-full flex items-center justify-center z-50">
                  <div
                    className=" bg-white p-4 rounded-lg shadow-lg"
                    ref={modalRef}
                  >
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <h1 className="font-extrabold text-danger ml-2">
                        {' '}
                        Delete storage {selectedBulletin.storageNumber}
                      </h1>
                      Are you sure you want to delete the save? We can't get him
                      back then.
                      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                          <button
                            className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                            type="button"
                            onClick={() => {
                              setIsStorageRemoveModalOpen(false);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="text-black bg-danger active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                            type="submit"
                            onClick={() => {
                              // deleteVehicle(selectedBulletin._id);
                            }}
                          >
                            To confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* load storage modal */}
          <div className="max-h-screen flex items-center justify-center">
            {showLoadStorageModal && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  showLoadStorageModal ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div className="inset-0 w-full flex items-center justify-center z-50">
                  <div
                    className="w-full max-w-screen-2xl bg-white p-4 rounded-lg shadow-lg"
                    ref={modalRef}
                  >
                    <div className="modal-container bg-white max-w-screen rounded shadow-lg z-50 overflow-auto h-125">
                      <div className="modal-content py-4 text-left px-6">
                        {/* Close button */}
                        <div className="flex justify-end items-center w-full">
                          <button
                            className="modal-close cursor-pointer z-50"
                            onClick={() => setShowLoadStorageModal(false)}
                          >
                            <svg
                              className="fill-current text-black"
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                            >
                              <path d="M5.293 5.293a1 1 0 011.414 0L9 7.586l2.293-2.293a1 1 0 111.414 1.414L10.414 9l2.293 2.293a1 1 0 11-1.414 1.414L9 10.414l-2.293 2.293a1 1 0 01-1.414-1.414L7.586 9 5.293 6.707a1 1 0 010-1.414z"></path>
                            </svg>
                          </button>
                        </div>
                        {/* Modal content */}
                        <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                          <div className="flex flex-col gap-9">
                            {loadStorageForms[activeFormIndex]()}
                            <div className="flex gap-3">
                              {showBackButton && (
                                <button
                                  onClick={handleBackButtonClick}
                                  className="flex justify-center rounded bg-primary p-3 font-medium text-gray"
                                >
                                  Previous
                                </button>
                              )}
                              <button
                                onClick={handleLoadStorageFormSubmission}
                                type="submit"
                                className="flex justify-center rounded bg-primary p-3 font-medium text-gray"
                              >
                                {activeFormIndex === loadStorageForms.length - 1
                                  ? 'Load archive'
                                  : 'Following'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showBoxComponent && (
        <>
          <div className="flex justify-between p-2">
            <button
              className="bg-button-color text-black active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
              type="button"
              onClick={() => setShowBoxModal(true)}
            >
              New type of box
            </button>
            <div>
              <input
                type="search"
                className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-5 focus:outline-none focus:border-blue-500"
                placeholder="Search..."
                value={searchBoxTerm}
                onChange={(e) => setSearchBoxTerm(e.target.value)}
              />
              <button
                className="border rounded-lg w-20 px-3 py-2 pl-5 pr-4 ml-5 focus:outline-none focus:border-blue-500"
                onClick={() => setShowFilterModal(!showFilterModal)}
              >
                Filter
              </button>
            </div>
          </div>
          {showFilterModal && (
            <div className="flex">
              <div>
                <div className="p-6.5">
                  <div className="mb-4.5">
                    <div className="relative z-20 dark:bg-form-input">
                      <input
                        type="text"
                        placeholder="Type"
                        className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="firstName"
                        // value={searchData.firstName}
                        // onChange={handleSearchInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-[20px] xl:flex-row item-center">
            <div className="flex-shrink-0 w-full xl:w-1/2 border-r border-gray-300 overflow-y-auto">
              <div className="col-span-1">
                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left text-sm font-light overflow-x-auto">
                      <thead className="border-b font-medium dark:border-neutral-500">
                        <tr>
                          <th scope="col" className="px-6 py-4">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Stock
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Out
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Bulletin
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {boxList.map((box: any, index: number) => (
                          <tr
                            key={box._id}
                            style={{ cursor: 'pointer' }}
                            className={`${
                              index % 2 === 0
                                ? 'bg-button-color text-black'
                                : ''
                            } border-b dark:border-blue`}
                            onClick={() => {
                              setSelectedBox(box);
                              ReceivedInventoryList(box);
                              getSupplierList(box);
                              getMatchesSupplierList(box);
                              orderListForBox(box);
                            }}
                          >
                            <td className="whitespace-nowrap px-6 py-4 font-medium">
                              {box.type}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {box.stock || 0}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {box.out || 0}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">0</td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {box.stock > 50 ? 'Normal' : 'Attention'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div>
                      <CustomPagination
                        currentPage={currentBoxPage}
                        totalPages={Math.ceil(totalBoxes / boxPageSize)}
                        onPageChange={handleBoxPageChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 w-full xl:w-1/2 max-h-screen overflow-y-auto ml-5">
              {selectedBox && (
                <>
                  <div className="overflow-x-auto">
                    <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight bg-gradient-to-r from-black to-primary bg-clip-text text-transparent md:text-5xl lg:text-2xl dark:text-white">
                      {selectedBox.type}
                    </h1>

                    <div className="flex items-center">
                      <button
                        type="button"
                        className="ml-5 mb-5"
                        onClick={() => {
                          setIsBoxSelceted(true);
                          setIsSupplierSelceted(false);
                          setIsOrderSelceted(false);
                          setIsOutstandingSelceted(false);
                        }}
                      >
                        <pre>Box</pre>
                      </button>
                      <button
                        type="button"
                        className="ml-5 mb-5"
                        onClick={() => {
                          setIsOutstandingSelceted(true);
                          setIsBoxSelceted(false);
                          setIsSupplierSelceted(false);
                          setIsOrderSelceted(false);
                        }}
                      >
                        Outstanding
                      </button>
                      <button
                        type="button"
                        className="ml-5 mb-5"
                        onClick={() => {
                          setIsSupplierSelceted(true);
                          setIsOutstandingSelceted(false);
                          setIsOrderSelceted(false);
                          setIsBoxSelceted(false);
                        }}
                      >
                        <pre>Suppliers</pre>
                      </button>
                      <button
                        type="button"
                        className="ml-5 mb-5"
                        onClick={() => {
                          setIsOrderSelceted(true);
                          setIsSupplierSelceted(false);
                          setIsOutstandingSelceted(false);
                          setIsBoxSelceted(false);
                        }}
                      >
                        Orders
                      </button>
                    </div>
                    <hr></hr>
                    <br></br>

                    {isBoxSelected && (
                      <>
                        <div className="flex">
                          <button
                            className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                            onClick={() => {
                              setIsOrderModalOpen(true);
                            }}
                            disabled={isSupplierExist}
                            style={{ opacity: isSupplierExist ? 0.5 : 1 }}
                          >
                            To order
                          </button>
                          <button
                            className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-2"
                            onClick={() => {
                              setIsLoginModalOpen(true);
                            }}
                            disabled={isSupplierExist}
                            style={{ opacity: isSupplierExist ? 0.5 : 1 }}
                          >
                            Log In
                          </button>
                          <select
                            id="dropdown"
                            className="p-2 border bg-danger rounded-md focus:outline-none focus:border-blue-500 text-black ml-2"
                            onChange={handleOptionChange}
                            // value={selectedOption}
                          >
                            <option value="">More Actions</option>
                            <option value="Throw away">Throw away</option>
                            <option value="To sell">To sell</option>
                            <option value="Rent out">Rent out</option>
                            <option value="Received return">
                              Received return
                            </option>
                          </select>
                        </div>
                        <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent mt-4">
                          BOX SPECIFICATIONS
                        </h2>
                        <p>Name: {selectedBox.type}</p>
                        <p>Rental price: {selectedBox.rentalPrize}</p>
                        <p>Selling prize: {selectedBox.sellingPrize}</p>
                        <p>
                          Dimensions: {selectedBox.length}cm *{' '}
                          {selectedBox.width}cm * {selectedBox.height}cm
                        </p>
                        <p>Contents: {selectedBox.contents}</p>
                      </>
                    )}

                    {isOutstandingSelected && (
                      <div>
                        <div className="flex mb-5">
                          <input
                            type="search"
                            className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-10 focus:outline-none focus:border-blue-500"
                            placeholder="Search..."
                            // value={searchTerm}
                            // onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                            <div className="overflow-hidden">
                              <table className="min-w-full text-left text-sm font-light">
                                <thead className="border-b font-medium dark:border-neutral-500">
                                  <tr>
                                    <th scope="col" className="px-6 py-4">
                                      Customer
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                      Out
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                      Bulletin
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                      Last modification
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>There is no outstanding stock.</tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isSupplierSelected && (
                      <>
                        {supplierList.length ? (
                          <>
                            {!addNewSupplierIntoSupplierList && (
                              <>
                                <div className="flex">
                                  {supplierList
                                    .reduce(
                                      (
                                        rows: any,
                                        supplier: any,
                                        index: number,
                                      ) => {
                                        if (index % 2 === 0) {
                                          // Start a new row for every two collections
                                          rows.push([]);
                                        }
                                        rows[rows.length - 1].push(supplier);
                                        return rows;
                                      },
                                      [],
                                    )
                                    .map((row: any, rowIndex: number) => (
                                      <div key={rowIndex} className="flex-row">
                                        {row.map((supplier: any) => (
                                          <div
                                            key={supplier._id}
                                            className="ml-3"
                                          >
                                            <h1>SUPPLIERS</h1>
                                            <p>{supplier.companyName}</p>
                                            <p>
                                              Purchase price:{' '}
                                              {supplier.purchase}
                                            </p>
                                            <p>{supplier.mobile}</p>
                                            <p>{supplier.telephone}</p>
                                            <p>{supplier.email}</p>
                                            <p>{supplier.webiste}</p>
                                            <p>
                                              {supplier.street}{' '}
                                              {supplier.houseNumber}
                                            </p>
                                            <p>
                                              {supplier.postCode}{' '}
                                              {supplier.city}
                                            </p>

                                            {!addNewSupplierIntoSupplierList ? (
                                              <>
                                                <div className="ml-7">
                                                  <button
                                                    onClick={() => {
                                                      setIsAddNewSupplierIntoSupplierList(
                                                        true,
                                                      );
                                                    }}
                                                  >
                                                    ➕
                                                  </button>
                                                  <button
                                                    className="ml-4"
                                                    onClick={() =>
                                                      handleEditButtonClick(
                                                        supplier,
                                                      )
                                                    }
                                                  >
                                                    ✎
                                                  </button>
                                                </div>
                                              </>
                                            ) : (
                                              <>
                                                <div className="ml-7">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setIsAddNewSupplierIntoSupplierList(
                                                        false,
                                                      );
                                                      setIsExistingSupplierSelected(
                                                        false,
                                                      );
                                                      setIsNewSupplierSelected(
                                                        false,
                                                      );
                                                    }}
                                                  >
                                                    {' '}
                                                    🚫{' '}
                                                  </button>
                                                  <button
                                                    type="submit"
                                                    className="ml-4"
                                                    onClick={(e) => {
                                                      setIsAddNewSupplier(
                                                        false,
                                                      );
                                                      setIsAddNewSupplierIntoSupplierList(
                                                        false,
                                                      );
                                                      handleSupplierFormSubmission(
                                                        e,
                                                      );
                                                    }}
                                                  >
                                                    💾
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {!addNewSupplier && (
                              <>
                                <div className="flex">
                                  <div>
                                    <h1>Suppliers</h1>
                                    <p>There are no suppliers yet</p>
                                  </div>
                                  <div className="ml-7">
                                    <button
                                      onClick={() => {
                                        setIsAddNewSupplier(true);
                                      }}
                                    >
                                      {' '}
                                      ➕
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        )}

                        <form onSubmit={handleSupplierFormSubmission}>
                          {addNewSupplierIntoSupplierList && (
                            <>
                              <div className="flex">
                                {supplierList
                                  .reduce(
                                    (
                                      rows: any,
                                      supplier: any,
                                      index: number,
                                    ) => {
                                      if (index % 2 === 0) {
                                        // Start a new row for every two collections
                                        rows.push([]);
                                      }
                                      rows[rows.length - 1].push(supplier);
                                      return rows;
                                    },
                                    [],
                                  )
                                  .map((row: any, rowIndex: number) => (
                                    <div key={rowIndex} className="flex-row">
                                      {row.map((supplier: any) => (
                                        <div
                                          key={supplier._id}
                                          className="ml-3"
                                        >
                                          <h1>SUPPLIERS</h1>
                                          <p>{supplier.companyName}</p>
                                          <p>
                                            Purchase price:{supplier.purchase}
                                          </p>
                                          <p>{supplier.mobile}</p>
                                          <p>{supplier.telephone}</p>
                                          <p>{supplier.email}</p>
                                          <p>{supplier.webiste}</p>
                                          <p>
                                            {supplier.street}{' '}
                                            {supplier.houseNumber}
                                          </p>
                                          <p>
                                            {supplier.postCode} {supplier.city}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ))}

                                <div className="ml-7">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsAddNewSupplierIntoSupplierList(
                                        false,
                                      );
                                      setIsExistingSupplierSelected(false);
                                      setIsNewSupplierSelected(false);
                                    }}
                                  >
                                    {' '}
                                    🚫{' '}
                                  </button>
                                  <button
                                    type="submit"
                                    className="ml-4"
                                    onClick={(e) => {
                                      setIsAddNewSupplier(false);
                                      setIsAddNewSupplierIntoSupplierList(
                                        false,
                                      );
                                      handleSupplierFormSubmission(e);
                                    }}
                                  >
                                    💾
                                  </button>
                                </div>
                              </div>

                              <div className="flex">
                                <button
                                  className="bg-button-color text-black active:bg-blue   
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                                  type="button"
                                  onClick={() => {
                                    setIsNewSupplierSelected(true);
                                    setIsExistingSupplierSelected(false);
                                  }}
                                >
                                  New Supplier
                                </button>
                                <button
                                  className="bg-button-color text-black active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                                  type="button"
                                  onClick={() => {
                                    setIsExistingSupplierSelected(true);
                                    setIsNewSupplierSelected(false);
                                  }}
                                >
                                  Existing Supplier
                                </button>
                              </div>
                            </>
                          )}

                          {addNewSupplier && (
                            <>
                              <div className="flex">
                                <div>
                                  <h1>Suppliers</h1>
                                  <p>There are no suppliers yet</p>
                                </div>
                                <div className="ml-7">
                                  <button
                                    onClick={() => {
                                      setIsAddNewSupplier(false);
                                      setIsExistingSupplierSelected(false);
                                      setIsNewSupplierSelected(false);
                                      setIsAddNewSupplierIntoSupplierList(
                                        false,
                                      );
                                    }}
                                  >
                                    {' '}
                                    🚫{' '}
                                  </button>
                                  <button
                                    type="submit"
                                    className="ml-4"
                                    onClick={(e) => {
                                      setIsAddNewSupplier(false);
                                      setIsAddNewSupplierIntoSupplierList(
                                        false,
                                      );
                                      handleSupplierFormSubmission(e);
                                    }}
                                  >
                                    💾
                                  </button>
                                </div>
                              </div>
                              <div className="flex">
                                <button
                                  className="bg-button-color text-black active:bg-blue   
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                                  type="button"
                                  onClick={() => {
                                    setIsNewSupplierSelected(true);
                                    setIsExistingSupplierSelected(false);
                                  }}
                                >
                                  New Supplier
                                </button>
                                <button
                                  className="bg-button-color text-black active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                                  type="button"
                                  onClick={() => {
                                    setIsExistingSupplierSelected(true);
                                    setIsNewSupplierSelected(false);
                                  }}
                                >
                                  Existing Supplier
                                </button>
                              </div>
                            </>
                          )}

                          {isSupplierEditFormOpen && (
                            <div>
                              <EditSupplier
                                supplierData={selectedSupplier}
                                handleEditSubmit={handleEditSupplierSubmit}
                                handleCloseEditForm={() =>
                                  setIsSupplierEditFormOpen(false)
                                }
                              />
                            </div>
                          )}

                          {/* add new and exisiting supplier form */}
                          <div>
                            {isExistingSupplierSelected && (
                              <>
                                <div className="flex mt-5 bg-white">
                                  <div className="w-full xl:w-1/2">
                                    <label className="mb-2.5 mt-2 block text-black dark:text-white ml-3">
                                      Select supplier
                                    </label>
                                    <select
                                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="selectedSupplier"
                                      onChange={
                                        handleExistingSupplierFormChange
                                      }
                                    >
                                      <option value="">Select Supplier</option>
                                      {allSupplierList &&
                                        allSupplierList.map((supplier: any) => (
                                          <option
                                            key={supplier._id}
                                            value={supplier._id}
                                          >
                                            {supplier.companyName}
                                          </option>
                                        ))}
                                    </select>
                                  </div>

                                  <div className="w-full xl:w-1/2">
                                    <label className="mb-2.5 mt-2 block text-black dark:text-white ml-3">
                                      Purchase price
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="purchase price"
                                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-1 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="purchase"
                                      onChange={
                                        handleExistingSupplierFormChange
                                      }
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {isNewSupplierSelected && (
                              <>
                                <div className="w-150 mt-3 bg-white">
                                  <div className="flex ml-3">
                                    <div>
                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Company Name
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="company name"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="companyName"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Website
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                          <input
                                            type="text"
                                            placeholder="website"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            name="website"
                                            onChange={handleSupplierFormChange}
                                          />
                                        </div>
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          First name
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                          <input
                                            type="text"
                                            placeholder="first name"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            name="fname"
                                            onChange={handleSupplierFormChange}
                                          />
                                        </div>
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Infix
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="infix"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="infix"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Last name
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="last name."
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="lname"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Purchase price
                                        </label>
                                        <input
                                          type="number"
                                          placeholder="purchase price"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="purchase"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          E-mail address
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter email."
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="email"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Telephone
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                          <input
                                            type="text"
                                            placeholder="telephone"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            name="telephone"
                                            onChange={handleSupplierFormChange}
                                          />
                                        </div>
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Mobile
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                          <input
                                            type="text"
                                            placeholder="mobile no."
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            name="mobile"
                                            onChange={handleSupplierFormChange}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="ml-2">
                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          Postcode
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter your Postcode"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="postCode"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          House number
                                        </label>
                                        <input
                                          type="number"
                                          placeholder="Enter your house number"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="houseNumber"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>
                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          Addition
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Addition"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="addition"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>
                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          Street
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter your Street"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="street"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>
                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          City
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter your city"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="city"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          Country
                                        </label>
                                        <CountryDropdown
                                          countries={countries}
                                          s
                                          name="selectedCountry"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </form>
                      </>
                    )}

                    {isOrderSelected && (
                      <div>
                        <div className="flex mb-5">
                          <input
                            type="search"
                            className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-10 focus:outline-none focus:border-blue-500"
                            placeholder="Search..."
                            // value={searchTerm}
                            // onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                            <div className="overflow-hidden">
                              <table className="min-w-full text-left text-sm font-light">
                                <thead className="border-b font-medium dark:border-neutral-500">
                                  <tr>
                                    <th scope="col" className="px-6 py-4">
                                      Supplier
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                      Number Outstanding
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                      Last modification
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderList.map(
                                    (order: any, index: number) => (
                                      <tr
                                        key={order._id}
                                        style={{ cursor: 'pointer' }}
                                        className={`${
                                          index % 2 === 0
                                            ? 'bg-button-color text-black'
                                            : ''
                                        } border-b dark:border-blue`}
                                      >
                                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                                          {getSupplierName(order.supplier)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                                          {order.number}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                                          {formattedDateTime(
                                            order.date,
                                            order.updatedAt,
                                          )}
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {showBoxModal && (
            <div className="flex items-center justify-center">
              {showBoxModal && (
                <div
                  className={`fixed inset-0 flex items-center justify-center z-50   ${
                    showBoxModal ? '' : 'hidden'
                  }`}
                >
                  <div className="fixed inset-0 bg-black opacity-80"></div>
                  <div className="inset-0 flex items-center justify-center z-50 md:w-[80%] lg:w-[85%] xl:w-[95%]">
                    <div
                      className="w-full max-w-screen-xl bg-gray p-4 rounded-lg shadow-lg h-[34rem] overflow-auto"
                      ref={modalRef}
                    >
                      <div className="modal-container bg-white w-full max-w-screen rounded shadow-lg z-50 overflow-x-auto">
                        <div className="modal-content w-full py-4 text-left px-6">
                          {/* Close button */}
                          <div className="flex justify-end items-center w-full">
                            <button
                              className="modal-close cursor-pointer z-50"
                              onClick={() => setShowBoxModal(false)}
                            >
                              <svg
                                className="fill-current text-black"
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                              >
                                <path d="M5.293 5.293a1 1 0 011.414 0L9 7.586l2.293-2.293a1 1 0 111.414 1.414L10.414 9l2.293 2.293a1 1 0 11-1.414 1.414L9 10.414l-2.293 2.293a1 1 0 01-1.414-1.414L7.586 9 5.293 6.707a1 1 0 010-1.414z"></path>
                              </svg>
                            </button>
                          </div>
                          {/* Modal content */}
                          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                              <h3 className="font-medium text-black dark:text-white ml-8 sm:ml-0">
                                Create a new type of box
                              </h3>
                            </div>
                            <form onSubmit={handleBoxFormSubmission}>
                              <div className="grid grid-1 sm:grid-cols-2 gap-3 mt-4">
                                <div className="mb-4.5">
                                  <label className="mb-2.5 block text-black dark:text-white ml-12 sm:ml-0">
                                    Type
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="type"
                                      className="w-60 ml-12 sm:ml-0 sm:w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="type"
                                      onChange={handleBoxFormChange}
                                    />
                                  </div>
                                </div>

                                <div className="mb-4.5">
                                  <label className="mb-2.5 block text-black dark:text-white ml-12 sm:ml-0">
                                    Selling price
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="selling price"
                                      className="w-60 ml-12 sm:ml-0 sm:w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="sellingPrize"
                                      onChange={handleBoxFormChange}
                                    />
                                  </div>
                                </div>
                                <div className="mb-4.5">
                                  <label className="mb-2.5 block text-black dark:text-white ml-12 sm:ml-0">
                                    Rental price
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="rental price"
                                      className="w-60 ml-12 sm:ml-0 sm:w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="rentalPrize"
                                      onChange={handleBoxFormChange}
                                    />
                                  </div>
                                </div>
                                <div className="mb-4.5">
                                  <label className="mb-2.5 block text-black dark:text-white ml-12 sm:ml-0">
                                    Length
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="length"
                                      className="w-60 ml-12 sm:ml-0 sm:w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="length"
                                      onChange={handleBoxFormChange}
                                    />
                                  </div>
                                </div>
                                <div className="mb-4.5">
                                  <label className="mb-2.5 block text-black dark:text-white ml-12 sm:ml-0">
                                    Width
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="width"
                                      className="w-60 ml-12 sm:ml-0 sm:w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="width"
                                      onChange={handleBoxFormChange}
                                    />
                                  </div>
                                </div>
                                <div className="mb-4.5">
                                  <label className="mb-2.5 block text-black dark:text-white ml-12 sm:ml-0">
                                    Height
                                  </label>
                                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <input
                                      type="text"
                                      placeholder="height"
                                      className="w-60 ml-12 sm:ml-0 sm:w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="height"
                                      onChange={handleBoxFormChange}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="inline-block sm:flex justify-end pt-2">
                                <button
                                  className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-10 focus:outline-none focus:border-blue-500"
                                  onClick={() => setShowBoxModal(false)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-10 focus:outline-none focus:border-blue-500"
                                  type="submit"
                                >
                                  Create
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* throw away modal */}
          <div className="max-h-screen flex items-center justify-center">
            {selectedOption === 'Throw away' && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  isRemoveModalOpen ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div className="inset-0 w-full flex items-center justify-center z-50">
                  <div
                    className=" bg-white p-4 rounded-lg shadow-lg"
                    ref={modalRef}
                  >
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <h1 className="font-extrabold text-danger ml-2">
                        {' '}
                        Throwing away stuff
                      </h1>
                      <form onSubmit={handleReportWornOut}>
                        <div className="inline-block sm:flex mt-5">
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Suppiler
                              </label>
                              <select
                                className="relative z-20  appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="supplier"
                                onChange={handleReceivedInventoryFormFormChange}
                              >
                                <option value="">select supplier</option>
                                <option value="test data">test data</option>
                              </select>
                            </div>
                            <div className="mb-4.5 ml-10">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Date
                              </label>
                              <input
                                type="date"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="date"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Number
                              </label>
                              <input
                                type="number"
                                placeholder="number"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="number"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <button
                              className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                              type="button"
                              onClick={() => setSelectedOption(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-black bg-danger active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                              type="submit"
                            >
                              To confirm
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* others modal */}
          <div className="max-h-screen flex items-center justify-center">
            {(selectedOption === 'To sell' ||
              selectedOption === 'Rent out' ||
              selectedOption === 'Received return') && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  isRemoveModalOpen ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div className="inset-0 w-full flex items-center justify-center z-50">
                  <div
                    className=" bg-white p-4 rounded-lg shadow-lg"
                    ref={modalRef}
                  >
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <h1 className="font-extrabold text-danger ml-2">
                        {' '}
                        {selectedOption === 'Rent out'
                          ? 'Rent out stuff'
                          : selectedOption === 'Received return'
                          ? 'Received return stuff'
                          : 'Sell stuff'}
                      </h1>
                      <form onSubmit={handleSold}>
                        <div className="inline-block sm:flex mt-5">
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Customer
                              </label>
                              <select
                                className="relative z-20  appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="customer"
                                onChange={handleOtherformsChange}
                              >
                                <option value="">select customer</option>
                                {customers.map((customer: any) => (
                                  <option
                                    key={customer._id}
                                    value={customer.firstName}
                                  >
                                    {customer.firstName}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Job
                              </label>
                              <select
                                className="relative z-20  appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="job"
                                onChange={handleOtherformsChange}
                              >
                                <option value="">select job</option>
                                <option value="test data">test data</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <div className="mb-4.5 ml-10">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Date
                              </label>
                              <input
                                type="date"
                                placeholder="File name"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="date"
                                onChange={handleOtherformsChange}
                              />
                            </div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Number
                              </label>
                              <input
                                type="number"
                                placeholder="sender"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="number"
                                onChange={handleOtherformsChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <button
                              className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                              type="button"
                              onClick={() => setSelectedOption(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-black bg-danger active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                              type="submit"
                            >
                              To sell
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* to order modal */}
          <div className="max-h-screen flex items-center justify-center">
            {isOrderModalOpen && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  isOrderModalOpen ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div
                  className="inset-0 w-full flex items-center justify-center z-50"
                  ref={modalRef}
                >
                  <div
                    className=" bg-white p-4 rounded-lg shadow-lg
            "
                  >
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <h1 className="font-extrabold text-danger ml-2">
                        {' '}
                        Submit order
                      </h1>
                      <form onSubmit={handleOrders}>
                        <div className="inline-block sm:flex mt-5">
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Supiler
                              </label>
                              <select
                                className="relative z-20  appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="supplier"
                                onChange={handleReceivedInventoryFormFormChange}
                              >
                                <option value="">select supplier</option>
                                {supplierList &&
                                  supplierList.map((supplier: any) => (
                                    <option
                                      key={supplier._id}
                                      value={supplier._id}
                                    >
                                      {supplier.companyName}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Order date
                              </label>
                              <input
                                type="date"
                                placeholder="File name"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="date"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Number
                              </label>
                              <input
                                type="number"
                                placeholder="sender"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="number"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <button
                              className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                              type="button"
                              onClick={() => {
                                setIsOrderModalOpen(false);
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-black bg-danger active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                              type="submit"
                            >
                              To order
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Login modal */}
          <div className="max-h-screen flex items-center justify-center">
            {isLoginModalOpen && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  isOrderModalOpen ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div
                  className="inset-0 w-full flex items-center justify-center z-50"
                  ref={modalRef}
                >
                  <div
                    className=" bg-white p-4 rounded-lg shadow-lg
            "
                  >
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <h1 className="font-extrabold text-danger ml-2">
                        {' '}
                        Submit order
                      </h1>
                      <form onSubmit={handleReceivedInventory}>
                        <div className="inline-block sm:flex mt-5">
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Supiler
                              </label>
                              <select
                                className="relative z-20  appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="supplier"
                                onChange={handleReceivedInventoryFormFormChange}
                              >
                                <option value="">select supplier</option>
                                {supplierList &&
                                  supplierList.map((supplier: any) => (
                                    <option
                                      key={supplier._id}
                                      value={supplier._id}
                                    >
                                      {supplier.companyName}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Received on
                              </label>
                              <input
                                type="date"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="date"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Number
                              </label>
                              <input
                                type="number"
                                placeholder="number"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="number"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <button
                              className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                              type="button"
                              onClick={() => {
                                setIsLoginModalOpen(false);
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-black bg-danger active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                              type="submit"
                            >
                              Log in
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showVehicleComponent && (
        <>
          <div>
            <div className="flex justify-between p-2" ref={modalRef}>
              <button
                className="bg-button-color text-black active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                type="button"
                onClick={() => setShowVehicleModal(true)}
              >
                New Vehicle
              </button>
              <div>
                <input
                  type="search"
                  className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-5 focus:outline-none focus:border-blue-500"
                  placeholder="Search..."
                  value={searchVehicleTerm}
                  onChange={(e) => setSearchVehicleTerm(e.target.value)}
                />
                <button
                  className="border rounded-lg w-20 px-3 py-2 pl-5 pr-4 ml-5 focus:outline-none focus:border-blue-500"
                  onClick={() => setShowFilterModal(!showFilterModal)}
                >
                  Filter
                </button>
              </div>
            </div>
            {showFilterModal && (
              <div>
                <div className="container mx-auto p-4">
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="firstName"
                    />

                    <input
                      type="number"
                      placeholder="Modal"
                      className="w-50 rounded ml-10 border-[1.5px] border-stroke  py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="License plate"
                      className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />

                    <input
                      type="number"
                      placeholder="Leaseing company"
                      className="w-50 ml-10 rounded border-[1.5px] border-stroke  py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="clientNumber"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="VIN"
                      className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="email"
                    />

                    <input
                      type="text"
                      placeholder="Dealer"
                      className="w-50 ml-10 rounded border-[1.5px] border-stroke  py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Minimum volume"
                      className="w-50 rounded border-[1.5px] border-stroke  py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex flex-col gap-[20px] xl:flex-row item-center">
                <div className="col-span-1">
                  <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                    <div className="overflow-hidden">
                      <table className="min-w-full text-left text-sm font-light">
                        <thead className="border-b font-medium dark:border-neutral-500">
                          <tr>
                            <th scope="col" className="px-6 py-4">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-4">
                              License Plate
                            </th>
                            <th scope="col" className="px-6 py-4">
                              Modal
                            </th>
                            <th scope="col" className="px-6 py-4">
                              Extra
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicleList.map((vehicle: any, index: number) => (
                            <tr
                              key={vehicle._id}
                              onClick={() => handleVehicleClick(vehicle)}
                              style={{ cursor: 'pointer' }}
                              className={`${
                                index % 2 === 0 ? 'bg-gray-100' : ''
                              } border-b dark:border-neutral-500`}
                            >
                              <td className="whitespace-nowrap px-6 py-4 font-medium">
                                {vehicle.vehicleName}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                {vehicle.licensePlate}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                {vehicle.modal}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                {vehicle.contents
                                  ? vehicle.contents
                                  : vehicle.floor}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* pagination  */}
                      <div>
                        <CustomPagination
                          currentPage={currentVehiclePage}
                          totalPages={Math.ceil(
                            totalVehicles / vehiclePageSize,
                          )}
                          onPageChange={handleVehiclePageChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {selectedVehicle && (
                  <>
                    <div className="overflow-x-auto">
                      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight bg-gradient-to-r from-black to-primary bg-clip-text text-transparent md:text-5xl lg:text-2xl dark:text-white">
                        {selectedVehicle.vehicleName} <br />
                        <span className="bg-primary text-black">
                          {selectedVehicle.licensePlate}
                        </span>
                      </h1>

                      <div className="flex items-center">
                        <button
                          type="button"
                          className="ml-5 mb-5"
                          onClick={() => {
                            setIsVehicleSelceted(true);
                            setIsTripSelceted(false);
                          }}
                        >
                          <pre>Vehicle</pre>
                        </button>
                        <button
                          type="button"
                          className="ml-5 mb-5"
                          onClick={() => {
                            setIsTripSelceted(true);
                            setIsVehicleSelceted(false);
                          }}
                        >
                          Trip registration
                        </button>
                      </div>
                      <hr></hr>
                      <br></br>

                      {isVehicleSelected && (
                        <>
                          <button
                            className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                            onClick={() => openVehicleRemoveModal()}
                          >
                            Remove vehicle
                          </button>
                          <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent mt-4">
                            Vehicle Details:
                          </h2>
                          <p>Name: {selectedVehicle.vehicleName}</p>
                          <p>Price per kilomete: {selectedVehicle.priceKm}</p>
                          <p>Price per hour: {selectedVehicle.priceHr}</p>
                          <p>VIN: {selectedVehicle.vin}</p>
                          <p>Model: {selectedVehicle.model}</p>
                          <p>Fuel: {selectedVehicle.fuel}</p>
                          <p>Transmission: {selectedVehicle.transmission}</p>
                          <p>
                            Construction year:{' '}
                            {selectedVehicle.constructionYear}
                          </p>
                          <p>Purchase: {selectedVehicle.purchase}</p>
                          <p>Tow bar: {selectedVehicle.isTowBarExist}</p>
                          <p>Contents: {selectedVehicle.contents}</p>
                          <p>Dimensions: {selectedVehicle.dimensions}</p>
                          <p>Tailgate length: {selectedVehicle.tgLength}</p>
                          <div className="mt-10">
                            <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent">
                              Driver License
                            </h2>
                            <sub style={{ backgroundColor: 'black' }}>
                              {selectedVehicle.driverLicense}
                            </sub>
                          </div>
                          <div className="mt-10">
                            <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent">
                              MAINTENANCE
                            </h2>
                            <p>Dealer: {selectedVehicle.dealer}</p>
                            <p>Leasing Company: {selectedVehicle.leasing}</p>
                            <p>
                              Maintenance required:{' '}
                              {selectedVehicle.maintenance}
                            </p>
                            <p>Next inspection: {selectedVehicle.inspection}</p>
                            <p>No maintenance data is known</p>
                          </div>

                          <div className="mt-10">
                            <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent">
                              Fuel card
                            </h2>
                            <p>Supplier: {selectedVehicle.supplier}</p>
                            <p>Card cvc: {selectedVehicle.cvc}</p>
                            <p>Pin code: {selectedVehicle.pinCode}</p>
                          </div>
                        </>
                      )}

                      {isTripSelected && (
                        <div className="max-w-md mx-auto bg-white p-4 rounded-md shadow-lg">
                          <h1 className="text-lg font-semibold mb-4">
                            {weekInfo}
                          </h1>
                          <table className="w-full">
                            <thead>
                              <tr>
                                <th>Day</th>
                                <th>Date</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Start KM</th>
                                <th>End KM</th>
                              </tr>
                            </thead>
                            <tbody>{dayRows}</tbody>
                            <tfoot>
                              <tr>
                                <td>Total</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>0</td>
                                <td>0</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center">
              {showVehicleModal && (
                <div
                  className={`fixed inset-0 flex items-center justify-center z-50  ${
                    showVehicleModal ? '' : 'hidden'
                  }`}
                >
                  <div className="fixed inset-0 bg-black opacity-80"></div>
                  <div className="inset-0 flex items-center justify-center z-50 md:w-[80%] lg:w-[85%] xl:w-[95%]">
                    <div
                      className="w-full max-w-screen-xl bg-gray p-4 rounded-lg shadow-lg h-[34rem] overflow-auto"
                      ref={modalRef}
                    >
                      <div className="modal-container bg-white w-full max-w-screen rounded shadow-lg z-50 overflow-x-auto">
                        <div className="modal-content w-full py-4 text-left px-6">
                          {/* Close button */}
                          <div className="flex justify-end items-center w-full">
                            <button
                              className="modal-close cursor-pointer z-50"
                              onClick={() => setShowVehicleModal(false)}
                            >
                              <svg
                                className="fill-current text-black"
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                              >
                                <path d="M5.293 5.293a1 1 0 011.414 0L9 7.586l2.293-2.293a1 1 0 111.414 1.414L10.414 9l2.293 2.293a1 1 0 11-1.414 1.414L9 10.414l-2.293 2.293a1 1 0 01-1.414-1.414L7.586 9 5.293 6.707a1 1 0 010-1.414z"></path>
                              </svg>
                            </button>
                          </div>
                          {/* Modal content */}
                          <div
                            className="grid grid-cols-1 gap-9 sm:grid-cols-1"
                            ref={modalRef}
                          >
                            <div className="flex flex-col gap-9">
                              {vehicleForms[activeFormIndex]()}
                              <div className="flex gap-3">
                                {showBackButton && (
                                  <button
                                    onClick={handleBackButtonClick}
                                    className="flex justify-center rounded bg-primary p-3 font-medium text-gray"
                                  >
                                    Previous
                                  </button>
                                )}
                                <button
                                  onClick={handleVehicleFormSubmission}
                                  className="flex justify-center rounded bg-primary p-3 font-medium text-gray"
                                >
                                  {activeFormIndex === vehicleForms.length - 1
                                    ? 'Submit'
                                    : 'Following'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* vehicle remove modal */}
          <div className="flex items-center justify-center">
            {isVehicleRemoveModalOpen && (
              <div
                className={`fixed w-100 inset-0 flex items-center justify-center z-50 ml-100 ${
                  isRemoveModalOpen ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div className="inset-0 flex items-center justify-center z-50 h-80">
                  <div
                    className=" bg-white p-4 rounded-lg shadow-lg"
                    ref={modalRef}
                  >
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <h1 className="font-extrabold text-danger ml-2">
                        {' '}
                        Remove Vehicle {selectedVehicle.vehicleName}
                      </h1>
                      The vehicle will be removed from all scheduled
                      appointments, this cannot be reversed.
                      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                          <button
                            className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                            type="button"
                            onClick={() => closeVehicleRemoveModal()}
                          >
                            Cancel
                          </button>
                          <button
                            className="text-black bg-danger active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                            type="submit"
                            onClick={() => {
                              deleteVehicle(selectedVehicle._id);
                            }}
                          >
                            To confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showMaterialComponent && (
        <>
          <div className="flex justify-between p-2">
            <button
              className="bg-button-color text-black active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
              type="button"
              onClick={() => setShowMaterialModal(true)}
            >
              New Material
            </button>
            <div>
              <input
                type="search"
                className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-5 focus:outline-none focus:border-blue-500"
                placeholder="Search..."
                value={searchMaterialTerm}
                onChange={(e) => setSearchMaterialTerm(e.target.value)}
              />
              <button
                className="border rounded-lg w-20 px-3 py-2 pl-5 pr-4 ml-5 focus:outline-none focus:border-blue-500"
                onClick={() => setShowFilterModal(!showFilterModal)}
              >
                Filter
              </button>
            </div>
          </div>

          {showFilterModal && (
            <div className="flex">
              <div>
                <div className="p-6.5">
                  <div className="mb-4.5">
                    <div className="relative z-20 dark:bg-form-input">
                      <input
                        type="text"
                        placeholder="Type"
                        className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="firstName"
                        // value={searchData.firstName}
                        // onChange={handleSearchInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-[20px] xl:flex-row item-center">
            <div className="flex-shrink-0 w-full xl:w-1/2 border-r border-gray-300 overflow-y-auto">
              <div className="col-span-1">
                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left text-sm font-light">
                      <thead className="border-b font-medium dark:border-neutral-500">
                        <tr>
                          <th scope="col" className="px-6 py-4">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Stock
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Out
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {materialList.map((material: any, index: number) => (
                          <tr
                            key={material._id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleMaterialClick(material)}
                            className={`${
                              index % 2 === 0 ? 'bg-gray-100' : ''
                            } border-b dark:border-neutral-500`}
                          >
                            <td className="whitespace-nowrap px-6 py-4 font-medium">
                              {material.name}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {' '}
                              {material.stock || 0}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {' '}
                              {material.out || 0}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {material.stock > 50 ? 'Normal' : 'Attention'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div>
                      <CustomPagination
                        currentPage={currentMaterialPage}
                        totalPages={Math.ceil(
                          totalMaterials / materialPageSize,
                        )}
                        onPageChange={handleMaterialPageChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 w-full xl:w-1/2 max-h-screen overflow-y-auto ml-5">
              {selectedMaterial && (
                <>
                  <div className="overflow-x-auto">
                    <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight bg-gradient-to-r from-black to-primary bg-clip-text text-transparent md:text-5xl lg:text-2xl dark:text-white">
                      {selectedMaterial.name}
                    </h1>

                    <div className="flex items-center">
                      <button
                        type="button"
                        className="ml-5 mb-5"
                        onClick={() => {
                          setIsMaterialSelceted(true);
                          setIsSupplierSelceted(false);
                          setIsOrderSelceted(false);
                          setIsOutstandingSelceted(false);
                        }}
                      >
                        <pre>Material</pre>
                      </button>
                      <button
                        type="button"
                        className="ml-5 mb-5"
                        onClick={() => {
                          setIsOutstandingSelceted(true);
                          setIsMaterialSelceted(false);
                          setIsSupplierSelceted(false);
                          setIsOrderSelceted(false);
                        }}
                      >
                        Outstanding
                      </button>
                      <button
                        type="button"
                        className="ml-5 mb-5"
                        onClick={() => {
                          setIsSupplierSelceted(true);
                          setIsOutstandingSelceted(false);
                          setIsOrderSelceted(false);
                          setIsMaterialSelceted(false);
                        }}
                      >
                        <pre>Suppliers</pre>
                      </button>
                      <button
                        type="button"
                        className="ml-5 mb-5"
                        onClick={() => {
                          setIsOrderSelceted(true);
                          setIsSupplierSelceted(false);
                          setIsOutstandingSelceted(false);
                          setIsMaterialSelceted(false);
                        }}
                      >
                        Orders
                      </button>
                    </div>
                    <hr></hr>
                    <br></br>

                    {isMaterialSelected && (
                      <>
                        <div className="flex">
                          <button
                            className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white lg:px-8 xl:px-10"
                            disabled={isSupplierExist}
                            style={{ opacity: isSupplierExist ? 0.5 : 1 }}
                            onClick={() => {
                              setIsOrderModalOpen(true);
                            }}
                          >
                            To order
                          </button>
                          <button
                            className="inline-flex items-center justify-center rounded-md bg-danger p-3 text-center font-medium text-white lg:px-8 xl:px-10 ml-2"
                            disabled={isSupplierExist}
                            style={{ opacity: isSupplierExist ? 0.5 : 1 }}
                            onClick={() => {
                              setIsLoginModalOpen(true);
                            }}
                          >
                            Log In
                          </button>
                          <select
                            id="dropdown"
                            className="p-2 border bg-danger rounded-md focus:outline-none focus:border-blue-500 text-black ml-2"
                            onChange={handleOptionChange}
                            // value={selectedOption}
                          >
                            <option value="">More Actions</option>
                            <option value="Throw away">Throw away</option>
                            <option value="To sell">To sell</option>
                            <option value="Rent out">Rent out</option>
                            <option value="Received return">
                              Received return
                            </option>
                          </select>
                        </div>
                        <h2 className=" font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent mt-4">
                          MATERIAL SPECIFICATIONS
                        </h2>
                        <p>Name: {selectedMaterial.name}</p>
                        <p>Rental price: {selectedMaterial.rentalPrize}</p>
                        <p>Selling prize: {selectedMaterial.sellingPrize}</p>
                        <p>Dimensions: {selectedMaterial.dimensions}</p>
                        <p>Contents: {selectedMaterial.contents}</p>
                      </>
                    )}

                    {isOutstandingSelected && (
                      <div>
                        <div className="flex mb-5">
                          <input
                            type="search"
                            className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-10 focus:outline-none focus:border-blue-500"
                            placeholder="Search..."
                            // value={searchTerm}
                            // onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                            <div className="overflow-hidden">
                              <table className="min-w-full text-left text-sm font-light">
                                <thead className="border-b font-medium dark:border-neutral-500">
                                  <tr>
                                    <th scope="col" className="px-6 py-4">
                                      Customer
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                      Out
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                      Bulletin
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                      Last modification
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>There is no outstanding stock.</tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isSupplierSelected && (
                      <>
                        {supplierList.length ? (
                          <>
                            {!addNewSupplierIntoSupplierList && (
                              <>
                                <div className="flex">
                                  {supplierList
                                    .reduce(
                                      (
                                        rows: any,
                                        supplier: any,
                                        index: number,
                                      ) => {
                                        if (index % 2 === 0) {
                                          // Start a new row for every two collections
                                          rows.push([]);
                                        }
                                        rows[rows.length - 1].push(supplier);
                                        return rows;
                                      },
                                      [],
                                    )
                                    .map((row: any, rowIndex: number) => (
                                      <div key={rowIndex} className="flex-row">
                                        {row.map((supplier: any) => (
                                          <div
                                            key={supplier._id}
                                            className="ml-3"
                                          >
                                            <h1>SUPPLIERS</h1>
                                            <p>{supplier.companyName}</p>
                                            <p>
                                              Purchase price:{' '}
                                              {supplier.purchase}
                                            </p>
                                            <p>{supplier.mobile}</p>
                                            <p>{supplier.telephone}</p>
                                            <p>{supplier.email}</p>
                                            <p>{supplier.webiste}</p>
                                            <p>
                                              {supplier.street}{' '}
                                              {supplier.houseNumber}
                                            </p>
                                            <p>
                                              {supplier.postCode}{' '}
                                              {supplier.city}
                                            </p>

                                            {!addNewSupplierIntoSupplierList ? (
                                              <>
                                                <div className="ml-7">
                                                  <button
                                                    onClick={() => {
                                                      setIsAddNewSupplierIntoSupplierList(
                                                        true,
                                                      );
                                                    }}
                                                  >
                                                    ➕
                                                  </button>
                                                  <button
                                                    className="ml-4"
                                                    onClick={() =>
                                                      handleEditButtonClick(
                                                        supplier,
                                                      )
                                                    }
                                                  >
                                                    ✎
                                                  </button>
                                                </div>
                                              </>
                                            ) : (
                                              <>
                                                <div className="ml-7">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setIsAddNewSupplierIntoSupplierList(
                                                        false,
                                                      );
                                                      setIsExistingSupplierSelected(
                                                        false,
                                                      );
                                                      setIsNewSupplierSelected(
                                                        false,
                                                      );
                                                    }}
                                                  >
                                                    {' '}
                                                    🚫{' '}
                                                  </button>
                                                  <button
                                                    type="submit"
                                                    className="ml-4"
                                                    onClick={(e) => {
                                                      setIsAddNewSupplier(
                                                        false,
                                                      );
                                                      setIsAddNewSupplierIntoSupplierList(
                                                        false,
                                                      );
                                                      handleSupplierFormSubmission(
                                                        e,
                                                      );
                                                    }}
                                                  >
                                                    💾
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {!addNewSupplier && (
                              <>
                                <div className="flex">
                                  <div>
                                    <h1>Suppliers</h1>
                                    <p>There are no suppliers yet</p>
                                  </div>
                                  <div className="ml-7">
                                    <button
                                      onClick={() => {
                                        setIsAddNewSupplier(true);
                                      }}
                                    >
                                      {' '}
                                      ➕
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        )}

                        <form onSubmit={handleSupplierFormSubmission}>
                          {addNewSupplierIntoSupplierList && (
                            <>
                              <div className="flex">
                                {supplierList
                                  .reduce(
                                    (
                                      rows: any,
                                      supplier: any,
                                      index: number,
                                    ) => {
                                      if (index % 2 === 0) {
                                        // Start a new row for every two collections
                                        rows.push([]);
                                      }
                                      rows[rows.length - 1].push(supplier);
                                      return rows;
                                    },
                                    [],
                                  )
                                  .map((row: any, rowIndex: number) => (
                                    <div key={rowIndex} className="flex-row">
                                      {row.map((supplier: any) => (
                                        <div
                                          key={supplier._id}
                                          className="ml-3"
                                        >
                                          <h1>SUPPLIERS</h1>
                                          <p>{supplier.companyName}</p>
                                          <p>
                                            Purchase price:{supplier.purchase}
                                          </p>
                                          <p>{supplier.mobile}</p>
                                          <p>{supplier.telephone}</p>
                                          <p>{supplier.email}</p>
                                          <p>{supplier.webiste}</p>
                                          <p>
                                            {supplier.street}{' '}
                                            {supplier.houseNumber}
                                          </p>
                                          <p>
                                            {supplier.postCode} {supplier.city}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ))}

                                <div className="ml-7">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsAddNewSupplierIntoSupplierList(
                                        false,
                                      );
                                      setIsExistingSupplierSelected(false);
                                      setIsNewSupplierSelected(false);
                                    }}
                                  >
                                    {' '}
                                    🚫{' '}
                                  </button>
                                  <button
                                    type="submit"
                                    className="ml-4"
                                    onClick={(e) => {
                                      setIsAddNewSupplier(false);
                                      setIsAddNewSupplierIntoSupplierList(
                                        false,
                                      );
                                      handleSupplierFormSubmission(e);
                                    }}
                                  >
                                    💾
                                  </button>
                                </div>
                              </div>

                              <div className="flex">
                                <button
                                  className="bg-button-color text-black active:bg-blue   
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                                  type="button"
                                  onClick={() => {
                                    setIsNewSupplierSelected(true);
                                    setIsExistingSupplierSelected(false);
                                  }}
                                >
                                  New Supplier
                                </button>
                                <button
                                  className="bg-button-color text-black active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                                  type="button"
                                  onClick={() => {
                                    setIsExistingSupplierSelected(true);
                                    setIsNewSupplierSelected(false);
                                  }}
                                >
                                  Existing Supplier
                                </button>
                              </div>
                            </>
                          )}

                          {addNewSupplier && (
                            <>
                              <div className="flex">
                                <div>
                                  <h1>Suppliers</h1>
                                  <p>There are no suppliers yet</p>
                                </div>
                                <div className="ml-7">
                                  <button
                                    onClick={() => {
                                      setIsAddNewSupplier(false);
                                      setIsExistingSupplierSelected(false);
                                      setIsNewSupplierSelected(false);
                                      setIsAddNewSupplierIntoSupplierList(
                                        false,
                                      );
                                    }}
                                  >
                                    {' '}
                                    🚫{' '}
                                  </button>
                                  <button
                                    type="submit"
                                    className="ml-4"
                                    onClick={(e) => {
                                      setIsAddNewSupplier(false);
                                      setIsAddNewSupplierIntoSupplierList(
                                        false,
                                      );
                                      handleSupplierFormSubmission(e);
                                    }}
                                  >
                                    💾
                                  </button>
                                </div>
                              </div>
                              <div className="flex">
                                <button
                                  className="bg-button-color text-black active:bg-blue   
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                                  type="button"
                                  onClick={() => {
                                    setIsNewSupplierSelected(true);
                                    setIsExistingSupplierSelected(false);
                                  }}
                                >
                                  New Supplier
                                </button>
                                <button
                                  className="bg-button-color text-black active:bg-blue-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                                  type="button"
                                  onClick={() => {
                                    setIsExistingSupplierSelected(true);
                                    setIsNewSupplierSelected(false);
                                  }}
                                >
                                  Existing Supplier
                                </button>
                              </div>
                            </>
                          )}

                          {isSupplierEditFormOpen && (
                            <div>
                              <EditSupplier
                                supplierData={selectedSupplier}
                                handleEditSubmit={handleEditSupplierSubmit}
                                handleCloseEditForm={() =>
                                  setIsSupplierEditFormOpen(false)
                                }
                              />
                            </div>
                          )}

                          {/* add new and exisiting supplier form */}
                          <div>
                            {isExistingSupplierSelected && (
                              <>
                                <div className="flex mt-5 bg-white">
                                  <div className="w-full xl:w-1/2">
                                    <label className="mb-2.5 mt-2 block text-black dark:text-white ml-3">
                                      Select supplier
                                    </label>
                                    <select
                                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="selectedSupplier"
                                      onChange={
                                        handleExistingSupplierFormChange
                                      }
                                    >
                                      <option value="">Select Supplier</option>
                                      {allSupplierList &&
                                        allSupplierList.map((supplier: any) => (
                                          <option
                                            key={supplier._id}
                                            value={supplier._id}
                                          >
                                            {supplier.companyName}
                                          </option>
                                        ))}
                                    </select>
                                  </div>

                                  <div className="w-full xl:w-1/2">
                                    <label className="mb-2.5 mt-2 block text-black dark:text-white ml-3">
                                      Purchase price
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="purchase price"
                                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-1 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      name="purchase"
                                      onChange={
                                        handleExistingSupplierFormChange
                                      }
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {isNewSupplierSelected && (
                              <>
                                <div className="w-150 mt-3 bg-white">
                                  <div className="flex ml-3">
                                    <div>
                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Company Name
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="company name"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="companyName"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Website
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                          <input
                                            type="text"
                                            placeholder="website"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            name="website"
                                            onChange={handleSupplierFormChange}
                                          />
                                        </div>
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          First name
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                          <input
                                            type="text"
                                            placeholder="first name"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            name="fname"
                                            onChange={handleSupplierFormChange}
                                          />
                                        </div>
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Infix
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="infix"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="infix"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Last name
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="last name."
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="lname"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Purchase price
                                        </label>
                                        <input
                                          type="number"
                                          placeholder="purchase price"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="purchase"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          E-mail address
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter email."
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="email"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Telephone
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                          <input
                                            type="text"
                                            placeholder="telephone"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            name="telephone"
                                            onChange={handleSupplierFormChange}
                                          />
                                        </div>
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Mobile
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                          <input
                                            type="text"
                                            placeholder="mobile no."
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            name="mobile"
                                            onChange={handleSupplierFormChange}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="ml-2">
                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          Postcode
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter your Postcode"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="postCode"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          House number
                                        </label>
                                        <input
                                          type="number"
                                          placeholder="Enter your house number"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="houseNumber"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>
                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          Addition
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Addition"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="addition"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>
                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          Street
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter your Street"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="street"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>
                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          City
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter your city"
                                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          name="city"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>

                                      <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 mt-2 block text-black dark:text-white">
                                          Country
                                        </label>
                                        <CountryDropdown
                                          countries={countries}
                                          s
                                          name="selectedCountry"
                                          onChange={handleSupplierFormChange}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </form>
                      </>
                    )}

                    {isOrderSelected && (
                      <div>
                        <div className="flex mb-5">
                          <input
                            type="search"
                            className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-10 focus:outline-none focus:border-blue-500"
                            placeholder="Search..."
                            // value={searchTerm}
                            // onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                            <div className="overflow-hidden">
                              <table className="min-w-full text-left text-sm font-light">
                                <thead className="border-b font-medium dark:border-neutral-500">
                                  <tr>
                                    <th scope="col" className="px-6 py-4">
                                      Supplier
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                      Number Outstanding
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                      Last modification
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderList.map(
                                    (order: any, index: number) => (
                                      <tr
                                        key={order._id}
                                        style={{ cursor: 'pointer' }}
                                        className={`${
                                          index % 2 === 0
                                            ? 'bg-button-color text-black'
                                            : ''
                                        } border-b dark:border-blue`}
                                      >
                                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                                          {getSupplierName(order.supplier)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                                          {order.number}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                                          {formattedDateTime(
                                            order.date,
                                            order.updatedAt,
                                          )}
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center">
            {showMaterialModal && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50  ${
                  showMaterialModal ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div
                  className="inset-0 flex items-center justify-center  z-50 "
                  ref={modalRef}
                >
                  <div className="w-full max-w-screen-xl bg-gray p-4 rounded-lg shadow-lg modal-overlay">
                    <div className="modal-container bg-white w-full max-w-screen rounded shadow-lg z-50 overflow-x-auto">
                      <div className="modal-content w-full py-4 text-left px-6">
                        {/* Close button */}
                        <div className="flex justify-end items-center w-full">
                          <button
                            className="modal-close cursor-pointer z-50"
                            onClick={() => setShowMaterialModal(false)}
                          >
                            <svg
                              className="fill-current text-black"
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                            >
                              <path d="M5.293 5.293a1 1 0 011.414 0L9 7.586l2.293-2.293a1 1 0 111.414 1.414L10.414 9l2.293 2.293a1 1 0 11-1.414 1.414L9 10.414l-2.293 2.293a1 1 0 01-1.414-1.414L7.586 9 5.293 6.707a1 1 0 010-1.414z"></path>
                            </svg>
                          </button>
                        </div>
                        {/* Modal content */}
                        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                              Add a new material
                            </h3>
                          </div>
                          <form onSubmit={handleMaterialFormSubmission}>
                            <div className="grid grid-cols-2 gap-3 ml-4 mt-4">
                              <div className="mb-4.5">
                                <label className="mb-2.5 block text-black dark:text-white">
                                  Name
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-form-input">
                                  <input
                                    type="text"
                                    placeholder="name"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    name="name"
                                    onChange={handleMaterialFormChange}
                                  />
                                </div>
                              </div>

                              <div className="mb-4.5">
                                <label className="mb-2.5 block text-black dark:text-white">
                                  Selling price
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-form-input">
                                  <input
                                    type="text"
                                    placeholder="selling price"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    name="sellingPrize"
                                    onChange={handleMaterialFormChange}
                                  />
                                </div>
                              </div>
                              <div className="mb-4.5">
                                <label className="mb-2.5 block text-black dark:text-white">
                                  Rental price
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-form-input">
                                  <input
                                    type="text"
                                    placeholder="rental price"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    name="rentalPrize"
                                    onChange={handleMaterialFormChange}
                                  />
                                </div>
                              </div>
                              <div className="mb-4.5">
                                <label className="mb-2.5 block text-black dark:text-white">
                                  Length
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-form-input">
                                  <input
                                    type="text"
                                    placeholder="length"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    name="length"
                                    onChange={handleMaterialFormChange}
                                  />
                                </div>
                              </div>
                              <div className="mb-4.5">
                                <label className="mb-2.5 block text-black dark:text-white">
                                  Width
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-form-input">
                                  <input
                                    type="text"
                                    placeholder="width"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    name="width"
                                    onChange={handleMaterialFormChange}
                                  />
                                </div>
                              </div>
                              <div className="mb-4.5">
                                <label className="mb-2.5 block text-black dark:text-white">
                                  Height
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-form-input">
                                  <input
                                    type="text"
                                    placeholder="height"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    name="height"
                                    onChange={handleMaterialFormChange}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end pt-2">
                              <button
                                className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-10 focus:outline-none focus:border-blue-500"
                                onClick={() => setShowMaterialModal(false)}
                                type="button"
                              >
                                Cancel
                              </button>
                              <button
                                className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-10 focus:outline-none focus:border-blue-500"
                                type="submit"
                              >
                                Create
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* throw away modal */}
          <div className="max-h-screen flex items-center justify-center">
            {selectedOption === 'Throw away' && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  isRemoveModalOpen ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div className="inset-0 w-full flex items-center justify-center z-50">
                  <div
                    className="bg-white p-4 rounded-lg shadow-lg"
                    ref={modalRef}
                  >
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <h1 className="font-extrabold text-danger ml-2">
                        {' '}
                        Throwing away stuff
                      </h1>
                      <form onSubmit={handleReportWornOut}>
                        <div className="flex mt-5">
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Suppiler
                              </label>
                              <select
                                className="relative z-20  appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="supplier"
                                onChange={handleReceivedInventoryFormFormChange}
                              >
                                <option value="">select supplier</option>
                              </select>
                            </div>
                            <div className="mb-4.5 ml-10">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Date
                              </label>
                              <input
                                type="date"
                                placeholder="File name"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="date"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-4.5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Number
                              </label>
                              <input
                                type="number"
                                placeholder="number"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="number"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <button
                              className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                              type="button"
                              onClick={() => setSelectedOption(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-black bg-danger active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                              type="submit"
                            >
                              To confirm
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* others modal */}
          <div className="max-h-screen flex items-center justify-center">
            {(selectedOption === 'To sell' ||
              selectedOption === 'Rent out' ||
              selectedOption === 'Received return') && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  isRemoveModalOpen ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div className="inset-0 flex items-center justify-center z-50 h-80">
                  <div
                    className=" bg-white p-4 rounded-lg shadow-lg"
                    ref={modalRef}
                  >
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <h1 className="font-extrabold text-danger ml-2">
                        {' '}
                        {selectedOption === 'Rent out'
                          ? 'Rent out stuff'
                          : selectedOption === 'Received return'
                          ? 'Received return stuff'
                          : 'Sell stuff'}
                      </h1>
                      <form onSubmit={handleSold}>
                        <div className="flex mt-5">
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Customer
                              </label>
                              <select
                                className="relative z-20  appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="customer"
                                onChange={handleOtherformsChange}
                              >
                                <option value="">select customer</option>
                                {customers.map((customer: any) => (
                                  <option
                                    key={customer._id}
                                    value={customer.firstName}
                                  >
                                    {customer.firstName}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Job
                              </label>
                              <select
                                className="relative z-20  appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="communicationType"
                                onChange={handleOtherformsChange}
                              >
                                <option value="">select job</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <div className="mb-4.5 ml-10">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Date
                              </label>
                              <input
                                type="date"
                                placeholder="File name"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="date"
                                onChange={handleOtherformsChange}
                              />
                            </div>
                            <div className="mb-4.5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Number
                              </label>
                              <input
                                type="number"
                                placeholder="sender"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="number"
                                onChange={handleOtherformsChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <button
                              className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                              type="button"
                              onClick={() => setSelectedOption(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-black bg-danger active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                              type="submit"
                            >
                              To sell
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* to order modal */}
          <div className="max-h-screen flex items-center justify-center">
            {isOrderModalOpen && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  isOrderModalOpen ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div
                  className="inset-0 flex items-center justify-center z-50 h-80"
                  ref={modalRef}
                >
                  <div
                    className=" bg-white p-4 rounded-lg shadow-lg
            "
                  >
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <h1 className="font-extrabold text-danger ml-2">
                        {' '}
                        Submit order
                      </h1>
                      <form onSubmit={handleOrders}>
                        <div className="flex mt-5">
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Supiler
                              </label>
                              <select
                                className="relative z-20  appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="supplier"
                                onChange={handleReceivedInventoryFormFormChange}
                              >
                                <option value="">select supplier</option>
                                {supplierList &&
                                  supplierList.map((supplier: any) => (
                                    <option
                                      key={supplier._id}
                                      value={supplier._id}
                                    >
                                      {supplier.companyName}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Order date
                              </label>
                              <input
                                type="date"
                                placeholder="File name"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="date"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-4.5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Number
                              </label>
                              <input
                                type="number"
                                placeholder="sender"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="number"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <button
                              className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                              type="button"
                              onClick={() => {
                                setIsOrderModalOpen(false);
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-black bg-danger active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                              type="submit"
                            >
                              To order
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Login modal */}
          <div className="max-h-screen flex items-center justify-center">
            {isLoginModalOpen && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                  isOrderModalOpen ? '' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black opacity-80"></div>
                <div
                  className="inset-0 flex items-center justify-center z-50 h-80"
                  ref={modalRef}
                >
                  <div
                    className=" bg-white p-4 rounded-lg shadow-lg
            "
                  >
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <h1 className="font-extrabold text-danger ml-2">
                        {' '}
                        Submit order
                      </h1>
                      <form onSubmit={handleReceivedInventory}>
                        <div className="flex mt-5">
                          <div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Supiler
                              </label>
                              <select
                                className="relative z-20  appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="supplier"
                                onChange={handleReceivedInventoryFormFormChange}
                              >
                                <option value="">select supplier</option>
                                {supplierList &&
                                  supplierList.map((supplier: any) => (
                                    <option
                                      key={supplier._id}
                                      value={supplier._id}
                                    >
                                      {supplier.companyName}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="mb-4.5 ml-5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Received on
                              </label>
                              <input
                                type="date"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="date"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-4.5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Number
                              </label>
                              <input
                                type="number"
                                placeholder="number"
                                className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="number"
                                onChange={handleReceivedInventoryFormFormChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <button
                              className="text-red bg-gray font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                              type="button"
                              onClick={() => {
                                setIsLoginModalOpen(false);
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-black bg-danger active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                              type="submit"
                            >
                              Log in
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Resources;
