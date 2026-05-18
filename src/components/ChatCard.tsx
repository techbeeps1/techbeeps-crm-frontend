import NotificationPage from '../Notification/NotificationPage';

const ChatCard = () => {
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Notificaions
      </h4>
      <div className='px-3'>
        <NotificationPage display={'none'} />
      </div>
    </div>
  );
};

export default ChatCard;
