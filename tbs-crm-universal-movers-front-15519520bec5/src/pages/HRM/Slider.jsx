import React, { useState } from 'react';
import { IconButton, Tabs, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EditEmployee from '../../agents/EditEmployee';
import AvailabilityComponent from '../../agents/Available';



const StaffSlider = ({ handler, selectedStaff, onClose, Ondelete, skills, licenses, countries }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  function formatDate(isoDateString) {
    const date = new Date(isoDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();  // Get full year
    return `${day}-${month}-${year}`;  // Return the formatted date
  }

  if (!selectedStaff) return <div className="flex h-full items-center justify-center bg-white">
    <img className="h-30 w-30 rounded-full" src="https://cdn.dribbble.com/users/1238723/screenshots/4794365/loading.gif" alt="" />
  </div>;

  return (
    // <div className="absolute top-0 right-0 left-0 h-full bg-white p-3 overflow-y-auto transition-transform">
      <div className={`${
          selectedStaff
            ? 'z-10 transition-all delay-400 ease-in-out top-0 right-0 left-full bottom-0'
            : 'w-full  h-full shadow border-l border-gray'
        } ${selectedStaff && '!left-0'} bg-white h-full overflow-auto `}
      >
      <IconButton onClick={onClose} className="absolute top-0 left-0">
        <CloseIcon />
      </IconButton>
      <div className="flex justify-between">
        <div style={{ textTransform: "uppercase" }} className="text-2xl font-bold mb-4">{selectedStaff.username}</div>
        <DeleteIcon onClick={() => Ondelete(selectedStaff)} />
      </div>
      {/* Navigation Bar */}
      <Tabs value={tabIndex} onChange={handleChange}>
        <Tab label="Colleague" />
        <Tab label="Availability" />
        <Tab label="Declarations" />
        <Tab label="Leave" />
        <Tab label="Billing" />
      </Tabs>

      {/* Slider Content */}
      <div className="p-4">
        {tabIndex === 0 && (
          <div className="">
            {/* Employee Information */}
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Employee Information</h2>
                <p>{selectedStaff?.username}</p>
                <p>{formatDate(selectedStaff?.dob)}</p>
                <p>{selectedStaff?.gender}</p>
                <p>{selectedStaff?.language}</p>
              </div>
              <div>
                <EditEmployee skills={skills} licenses={licenses} countries={countries} handler={handler} userData={selectedStaff} />
                <p>{selectedStaff?.houseNumber} {selectedStaff?.street} </p>
                <p>{selectedStaff?.postCode} {selectedStaff?.city} {selectedStaff?.country}</p>
                <a href={selectedStaff?.telephone} className="text-blue">
                  +{selectedStaff?.telephone}
                </a>
                <br />
                <a href={`mailto:${selectedStaff?.email}`} className="text-blue">
                  {selectedStaff?.email}
                </a>
              </div>
            </div>

            {/* Driving License */}
            <div>
              <h3 className="text-lg font-bold mb-3 mt-2">Driving License</h3>
              <div className="flex items-center space-x-4">
                {selectedStaff?.drivingLicense?.map((license, index) =>
                  <div key={index} className="bg-pink rounded-sm shadow-lg  outline px-3 py-1 ">
                    <p className='font-bold text-xl'>{license}</p>
                  </div>)}
              </div>
            </div>

            {/* Contracts */}

            {selectedStaff?.contract &&
              <div>
                <h3 className="text-lg font-bold mt-3 mb-2">Contracts</h3>
                <div className="flex justify-between">
                  <div>
                    <p>In service</p>
                    <p>Trial period</p>
                  </div>
                  <div>
                    <p>{formatDate(selectedStaff?.inservice)}</p>
                    <p>No probationary period</p>
                  </div>
                </div>
                <div className="mt-4 p-4 border rounded-lg shadow-sm">
                  <p className="font-bold">{formatDate(selectedStaff?.contract?.startDate)}</p>
                  <div className="mt-2 space-y-2">
                    <p>End: {formatDate(selectedStaff?.contract?.startDate) || "Indefinite"}</p>
                    <p>Type: {selectedStaff?.contract?.type}</p>
                    <p>Loon: € {selectedStaff?.contract?.hourlyWage}</p>
                    <p>Hours: {selectedStaff?.contract?.hoursWeek}</p>
                    <p>The day: {selectedStaff?.contract?.daysWeek} </p>
                  </div>
                </div>
              </div>
            }
            {/* Skills */}
            <div>
              <h3 className="text-lg font-bold mt-2 mb-2">Skills</h3>
              <div className="space-y-1">
                {selectedStaff?.skills?.map((skill, index) => <p key={index}>{skill}</p>)}
              </div>
            </div>
          </div>
        )}
        {tabIndex === 1 && (<AvailabilityComponent />)}
        {tabIndex === 2 && (<div>there is No yet Declarations</div>)}
        {tabIndex === 3 && (<div>there is No yet Leave</div>)}
      </div>
    </div>
  );
};

export default StaffSlider;
