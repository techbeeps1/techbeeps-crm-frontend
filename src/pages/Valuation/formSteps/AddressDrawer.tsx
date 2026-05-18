import React, { Dispatch, ReactNode, SetStateAction } from "react";
import useMeasure from "react-use-measure";
import {
    useDragControls,
    useMotionValue,
    useAnimate,
    motion,
} from "framer-motion";
import {
    Button,
} from '@mui/material';
import AddressForm from "./AddressFrom";
import { useFormContext } from "react-hook-form";


export const AddressDrawer: React.FC<any> = ({selectItem, setSelectItem, countries, type }) => {

    const {handleSubmit } = useFormContext() as any;

    const handleNext = () => {
        handleSubmit(() => {
            setSelectItem(false);
            console.log(type)
        })();
    };

    return (
        <div className="grid place-content-center">
            <DragCloseDrawer open={selectItem} setOpen={setSelectItem}>
                <div className="flex justify-center align-center flex-col h-full space-y-4 text-neutral-400" style={{ minWidth: '650px' }}>
                    <div className="h-full overflow-auto" style={{ scrollbarWidth: 'none' }}>
                        <AddressForm countries={countries} type={type} />
                    </div>
                    <div className="bg-sky-900 flex justify-between">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setSelectItem(false)}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </DragCloseDrawer>
        </div>
    );
};

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    children?: ReactNode;
}

const DragCloseDrawer = ({ open, setOpen, children }: Props) => {
    const [scope, animate] = useAnimate();
    const [drawerRef, { height }] = useMeasure();

    const y = useMotionValue(0);
    const controls = useDragControls();

    const handleClose = async () => {
        animate(scope.current, {
            opacity: [1, 0],
        });

        const yStart = typeof y.get() === "number" ? y.get() : 0;

        await animate("#drawer", {
            y: [yStart, height],
        });

        setOpen(false);
    };

    return (
        <>
            {open && (
                <motion.div
                    ref={scope}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleClose}
                    className="fixed inset-0 z-50 bg-neutral-950/30 flex justify-center "
                >
                    <motion.div
                        id="drawer"
                        ref={drawerRef}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        transition={{
                            ease: "easeInOut",
                        }}
                        className="absolute bottom-0 h-[95vh] min-w-xl overflow-hidden rounded-t-3xl"
                        style={{ y }}
                        drag="y"
                        dragControls={controls}
                        onDragEnd={() => {
                            if (y.get() >= 100) {
                                handleClose();
                            }
                        }}
                        dragListener={false}
                        dragConstraints={{
                            top: 0,
                            bottom: 0,
                        }}
                        dragElastic={{
                            top: 0,
                            bottom: 0.5,
                        }}
                    >
                        <div className="absolute left-0 right-0 top-0 z-10 flex justify-center bg-sky-900 py-4">
                            <button
                                onPointerDown={(e) => {
                                    controls.start(e);
                                }}
                                className="h-2 w-30 cursor-grab touch-none rounded-full bg-neutral-500 active:cursor-grabbing"
                            ></button>
                        </div>
                        <div className="relative z-0 h-full p-4 px-7 pt-10 bg-sky-900">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
};