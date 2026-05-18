const CardOne = ({name}) => {
  return (
    <div className="rounded-md border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
       <h2 className="text-title-sm font-bold text-black">{name}</h2>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-grey dark:text-white">
          $3.456K
          </h4>
          <span className="text-sm font-medium">{name}</span>
        </div>

        <span className="flex items-center text-sm font-medium text-meta-3">
          This Month
        </span>
      </div>
    </div>
  );
};

export default CardOne;
