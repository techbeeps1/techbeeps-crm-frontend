import { Dispatch, ReactNode, SetStateAction } from "react";
import useMeasure from "react-use-measure";
import {
  useDragControls,
  useMotionValue,
  useAnimate,
  motion,
} from "framer-motion";

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
  
      setOpen(null);
    };
  
    return (
      <>
        {open && (
          <motion.div
            ref={scope}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-neutral-950/40 flex justify-center"
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
              className="absolute max-h-[1000px] bottom-0 h-[97vh] min-w-xl overflow-hidden rounded-t-3xl"
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
              <div className="absolute left-0 right-0 top-0 z-10 flex justify-center bg-sky-900 pt-3">
                <button
                  onPointerDown={(e) => {
                    controls.start(e);
                  }}
                  className="h-2 w-20 cursor-grab touch-none rounded-full bg-neutral-300 active:cursor-grabbing"
                ></button>
              </div>
              <div className="relative z-0 h-full p-4 pt-9 bg-sky-900">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </>
    );
  };

  export default DragCloseDrawer;