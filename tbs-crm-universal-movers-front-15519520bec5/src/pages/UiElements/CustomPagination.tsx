import PropTypes from 'prop-types';

function CustomPagination({ currentPage, totalPages, onPageChange }:any) {
  const range = (start:number, end:number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  return (
    <nav className="flex justify-center">
      {totalPages !==0 && (<pre>Pages -- </pre>)} 
      <ul className="flex space-x-2">
        {range(1, totalPages).map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-full ${
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'hover:bg-primary'
              }`}
            >
            {page}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

CustomPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default CustomPagination;
