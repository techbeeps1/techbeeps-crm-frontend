// src/components/CountryDropdown.js

function CountryDropdown({ countries, value, onChange,name }:any) {
  return (
    <select value={value} onChange={onChange} name={name}
    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-1 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
      <option value="">Select Country</option>
      {countries.map((country:any, index:any) => (
        <option key={index} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
}

export default CountryDropdown;
