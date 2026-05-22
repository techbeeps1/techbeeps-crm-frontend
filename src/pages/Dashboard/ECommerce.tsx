import CardOne from '../../components/CardOne.tsx';
import ChatCard from '../../components/ChatCard.tsx';
import TableOne from '../../components/TableOne.tsx';
import Shortcuts from './Shortcuts.tsx';

const ECommerce = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        {/* <div className="col-span-12 md:col-span-10 xl:col-span-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-2 xl:grid-cols-4 2xl:gap-3">
            <CardOne name="Invoices" />
            <CardOne name="Proforma Invoices" />
            <CardOne name="Offers" />
            <CardOne name="Unpaid" />
          </div>

          <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-2 2xl:mt-4 2xl:gap-3">
            <div className="col-span-12 xl:col-span-8">
              <TableOne />
            </div>
            <div className="col-span-12 md:col-span-4 xl:col-span-4 2xl:col-span-4">
              <ChatCard />
            </div>
          </div>
        </div> */}

        <div className="col-span-12 ">
          <Shortcuts />
        </div>
      </div>

    </>
  );
};

export default ECommerce;
