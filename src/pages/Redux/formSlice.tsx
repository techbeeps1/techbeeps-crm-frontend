import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState: any = {
  scheduleJob: {
    // addresses: [{
    // postCode: '',
    // houseNumber: '',
    // addition: '',
    // street: '',
    // city: '',
    // selectedCountry: '',
    // typeWoning: '',
    // }],
    date: null,
    // postCode: '',
    // houseNumber: '',
    firstName: '',
    // addition: '',
    // street: '',
    // city: '',
    // selectedCountry: '',
    selectedRadio: '',
    selectedCustomer: '',
    typeOfCustomer: '',
    salutation: '',
    lastName: '',
    gender: '',
    email: '',
    contact: '',
    language: '',
    plateform: '',
    package: '',
  },

  sendQuoteToCustomer: {
    address: {},
    discount: '',
    employeeId: '',
    expiresAt: '',
    finishQuote: '',
    movingHours: '',
    refference: '',
    jobId: '',
    templateId: '',
    totalIncludingVat:{}, //calculation
    relationId : '',
  },

  //financial process
  jobAcceptance: {
    package: '',
    financialTemplate: '',
    discountDescription: '',
    percentage: '',
  },

  startJob: {
    financialTemplate: '',
    discountDescription: '',
    percentage: '',
  },

  storageLoaded: {
    financialTemplate: '',
    discountDescription: '',
    percentage: '',
  },

  lastAppointment: {
    financialTemplate: '',
    discountDescription: '',
    percentage: '',
  },

  Notes: {
    genralNotes: '',
    employeeNotes: '',
    customerNotes: '',
  },

  bulletins: {
    storageNumber: '',
    type: '',
    contents: '',
    postCode: '',
    houseNumber: '',
    street: '',
    city: '',
    selectedCountry: '',
  },

  loadStorage: {
    percentage: '',
    notes: '',
    what: '',
    employee: '',
    addCost: '',
    description: '',
    amount: '',
    number: '',
    actionDate: '',
    invoiceSelected: '',
    date: null,
    postCode: '',
    houseNumber: '',
    firstName: '',
    addition: '',
    street: '',
    city: '',
    selectedCountry: '',
    typeWoning: '',
    selectedRadio: '',
    selectedCustomer: '',
    typeOfCustomer: '',
    salutation: '',
    lastName: '',
    gender: '',
    email: '',
    contact: '',
    language: '',
    plateform: '',
    package: '',
    billingPeriod: '',
    vat: '',
    invoiceStorage: '',
    btw: '',
    price: '',
    salesGroup: '',
    job: '',
    invoice: '',
    startDate: '',
    lastDate: '',
  },

  boxes: {
    type: '',
    rentalPrize: '',
    sellingPrize: '',
    length: '',
    width: '',
    height: '',
  },

  receivedInventory: {
    supplier: '',
    date: '',
    number: null,
    boxId: '',
    materialId: '',
  },

  otherForms: {
    customer: '',
    date: '',
    number: null,
    job: '',
    boxId: '',
  },

  supplier: {
    companyName: '',
    website: '',
    purchase: null,
    fname: '',
    infix: '',
    lname: '',
    email: '',
    telephone: '',
    mobile: '',
    postCode: '',
    houseNumber: '',
    addition: '',
    street: '',
    city: '',
    selectedCountry: '',
    boxId: '',
    materialId: '',
    editedData: {},
  },

  existingSupplier: {
    boxId: '',
    materialId: '',
    selectedSupplier: '',
    purchase: null,
  },

  staff: {
    gender: '',
    firstName: '',
    middleName: '',
    lastName: '',
    language: '',
    dob: '',
    email: '',
    contact: '',
    address: '',
    street: '',
    houseNumber: '',
    addition: '',
    postCode: '',
    city: '',
    country: '',
    inService: '',
    outService: '',
    probation: '',
    startDate: '',
    endDate: '',
    type: '',
    hourlyWage: '',
    hoursWeek: '',
    days: '',
    driverLicense: '',
    skills: '',
  },

  teams: {
    teamName: '',
  },

  vehicle: {
    vehicleType: '',
    vehicleName: '',
    priceKm: '',
    priceHr: '',
    licensePlate: '',
    vin: '',
    modal: '',
    fuel: '',
    transmission: '',
    constructionYear: '',
    purchase: '',
    isTowBarExist: '',
    length: '',
    width: '',
    height: '',
    contents: '',
    tgLength: '',
    floor: '',
    elHeight: '',
    driverLicense: '',
    dealer: '',
    leasing: '',
    inspection: '',
    maintenance: '',
    suppiler: '',
    cardNumber: '',
    cvc: '',
    pinCode: '',
  },

  materials: {
    name: '',
    rentalPrize: '',
    sellingPrize: '',
    length: '',
    width: '',
    height: '',
  },

  reportingForm: {
    name: '',
    basedOn: '',
  },

  //invoice finance forms...
  logCommunication: {
    communicationType: '',
    sender: '',
    date: null,
    message: '',
  },

  sendQuote: {
    expirationDate: null,
    additionalEmail: '',
  },

  rejectquote: {
    reason: '',
    cancelProject: false,
  },

  invoiceQuote: {
    financialTemplate: '',
  },

  newsItems: {
    title: '',
    body:'',
    publishAt: '',
    publisherName: '',
    employeeId : ''
  }
};

const formSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    setSupplierEditedData: (state, action: PayloadAction<any>) => {
      state.supplier.editedData = action.payload;
    },
    setNewsItemsEditedData: (state, action: PayloadAction<any>) => {
      state.newsItems.editedData = action.payload;
    },
    setFormField: (state, action) => {
      const { formName, field, value } = action.payload;

      if (!state[formName]) {
        state[formName] = {};
      }

      // Check if the field is nested (contains dots)
      if (field.includes('.')) {
        const [nestedField, subField] = field.split('.');
        state[formName][nestedField] = {
          ...state[formName][nestedField],
          [subField]: value,
        };
      } else {
        state[formName][field] = value;
      }
    },
    resetForm: (state, action) => {
      const { formName } = action.payload;

      if (state[formName]) {
        state[formName] = { ...initialState[formName] };
      }
    },
  },
});

export const { setFormField, resetForm, setSupplierEditedData,setNewsItemsEditedData } =
  formSlice.actions;
export default formSlice.reducer;
