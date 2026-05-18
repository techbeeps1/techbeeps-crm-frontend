import React, { useState } from 'react'
import DragCloseDrawer from '../DragCloseDrawer'
import {
    Button
} from '@mui/material';

const CustomFurniture: React.FC<any> = ({ open, setModelOpen, addCustomFurniture }) => {
    const [customFurniture, setCustomFurniture] = useState<any>({ furnitureTypeName: '', cubicMeter: 0, icon: '<svg xmlns="http://www.w3.org/2000/svg" height="32" width="20" viewBox="0 0 320 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M80 160c0-35.3 28.7-64 64-64l32 0c35.3 0 64 28.7 64 64l0 3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74l0 1.4c0 17.7 14.3 32 32 32s32-14.3 32-32l0-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7l0-3.6c0-70.7-57.3-128-128-128l-32 0C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/></svg>' });

    const handleAdd = () => {
        addCustomFurniture(customFurniture);
        setModelOpen(false);
        setCustomFurniture({ furnitureTypeName: '', cubicMeter: 0, icon: '<svg xmlns="http://www.w3.org/2000/svg" height="32" width="20" viewBox="0 0 320 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M80 160c0-35.3 28.7-64 64-64l32 0c35.3 0 64 28.7 64 64l0 3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74l0 1.4c0 17.7 14.3 32 32 32s32-14.3 32-32l0-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7l0-3.6c0-70.7-57.3-128-128-128l-32 0C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/></svg>' });
    };

    return (
        <>
            <DragCloseDrawer open={open} setOpen={setModelOpen}>
                <div className="flex justify-start flex-col h-full space-y-4 text-neutral-400" style={{ minWidth: '700px' }}>
                    <h3 className="text-white text-center font-bold text-xl">
                        Add Furniture
                    </h3>
                    <div className='h-full'>
                        <div className="mb-4">
                            <label htmlFor="name" className="block mb-3 text-white text-lg font-medium">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={customFurniture.furnitureTypeName}
                                onChange={(e) => setCustomFurniture({ ...customFurniture, furnitureTypeName: e.target.value })}
                                className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="contents" className="block mb-3 text-white text-lg font-medium">
                                Contents
                            </label>
                            <input
                                type="number"
                                id="contents"
                                min={0}
                                value={customFurniture.cubicMeter}
                                onChange={(e) => setCustomFurniture({ ...customFurniture, cubicMeter: e.target.value })}
                                className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                            />
                        </div>
                    </div>
                    <div className="bg-sky-900 flex justify-between">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setModelOpen(false)}
                        >
                            close
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAdd}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </DragCloseDrawer>
        </>
    )
}

export default CustomFurniture