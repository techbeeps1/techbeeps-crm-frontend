import React, { useEffect, useState } from 'react';
import { DragDrawer } from './DragDrawer';
import DragCloseDrawer from '../DragCloseDrawer';

const SelectedRooms: React.FC<any> = ({
  rooms,
  selectedRoom,
  services,
  setSelectedRoom,
}) => {
  const [selectItem, setSelectItem] = useState<any>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const updateSelectedRoom = (updatedItem: any) => {
    setSelectedRoom((prevRooms: any[]) =>
      prevRooms.map((room, index) =>
        index === updatedItem.index ? updatedItem : room,
      ),
    );
  };

  useEffect(() => {
    if (selectItem) {
      updateSelectedRoom(selectItem);
    }
  }, [selectItem]);

  return (
    <div className="px-10 py-5">
      <div className="space-y-2">
        {selectedRoom &&
          selectedRoom.map((room: any, index: any) => (
            <div
              key={index}
              onClick={() => {
                setSelectItem({ ...room, index: index });
              }}
              className={`flex bg-white items-center justify-between shadow p-4 border border-gray rounded-md`}
            >
              <div className="flex items-center gap-4">
                <div
                  style={{
                    width: '45px',
                    height: '45px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '3px',
                  }}
                  dangerouslySetInnerHTML={{ __html: room?.icon }}
                />
                <span className="font-bold text-lg">
                  {room?.name || room?.roomTypeName}
                </span>
              </div>
              <div className="flex font-bold px-3 text-3xl">
                {room.finished && '✓'}
              </div>
            </div>
          ))}
        <div
          onClick={() => setModalOpen(true)}
          className="p-4 border-dashed border-2 border-primary rounded-md flex items-center space-x-2"
        >
          <span className="text-lg">➕</span>
          <span className="font-bold text-lg">Add room</span>
        </div>
      </div>
      <DragCloseDrawer open={isModalOpen} setOpen={setModalOpen}>
        <div
          className="flex justify-center align-center flex-col h-full space-y-4 text-neutral-400"
          style={{ minWidth: '700px' }}
        >
          <h3 className="text-white text-center font-bold text-xl">Add Room</h3>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full px-4 py-2 overflow-y-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {rooms &&
              rooms.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center h-45 w-full rounded shadow-md cursor-pointer bg-gray text-black`}
                  onClick={() => {
                    setModalOpen(false),
                      setSelectedRoom([...selectedRoom, item]);
                  }}
                >
                  <div
                    style={{
                      width: '65px',
                      height: '65px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden',
                      padding: '10px',
                      marginBottom: '10px',
                    }}
                    dangerouslySetInnerHTML={{ __html: item?.icon }}
                  />
                  <p className="text-center text-lg font-medium">
                    {item?.roomTypeName}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </DragCloseDrawer>
      <DragDrawer
        services={services}
        selectItem={selectItem}
        setSelectItem={setSelectItem}
      />
    </div>
  );
};

export default SelectedRooms;
