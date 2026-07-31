import React from "react";

const ServiceSelector: React.FC<any> = ({ services, setItem, item }) => {



  const toggleService = (service: any) => {

    const isSelected = item.some((selectedService: any) => selectedService._id === service._id);

    if (isSelected) {
      setItem(item.filter((selectedService: any) => selectedService._id !== service._id));
    } else {
      setItem([...item, {...service,name:"",inventoryItems:[],finished:false}]);
    }
  };

  return (
    <div className="p-8 ms-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {services &&
          services.map((service: any) => {
            const isSelected = item.some((selectedService: any) => selectedService._id === service._id);
            return (
              <div
                key={service?._id}
                className={`m-auto relative w-60 h-60 flex flex-col items-center justify-center p-6 rounded-lg shadow-lg cursor-pointer transition-transform transform ${
                  isSelected ? "bg-primary scale-105 text-white" : "bg-white"
                }`}
                onClick={() => toggleService(service)}
              >
                {isSelected && (
                  <span className="absolute top-2 left-3 text-white text-2xl">✓</span>
                )}
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    padding: "5px",
                  }}
                  dangerouslySetInnerHTML={{ __html: service?.icon }}
                />
                <div className="text-lg mt-3 font-semibold">
                  {service?.serviceName || service?.roomTypeName}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isSelected}
                  onChange={() => toggleService(service)}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ServiceSelector;
