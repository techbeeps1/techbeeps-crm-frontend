import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  Close as CloseIcon,
} from '@mui/icons-material';

interface IconPickerProps {
    control: any; // From React Hook Form
    errors: any;
    icons: any; // From React Hook Form
    register: any; // From React Hook Form
    setValue: any; // From React Hook Form
    selectedSalesGroup?: any;
    onFileNameChange?: (fileName: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ register, errors, setValue,selectedSalesGroup,onFileNameChange }) => {
    const [svgCode, setSvgCode] = useState<string | null>(null);
    const [svgStyle, setSvgStyle] = useState<boolean>(false);
    const [iconFileName, setIconFileName] = useState<string | null>(null);


    const openDialog = () => setIsDialogOpen(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const closeDialog = () => {
    setIsDialogOpen(false);
  };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Get the first file
        if (file && file.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setSvgCode(result); // Set the SVG code to state
                    setValue('icon', result); // Register the SVG code with React Hook Form
                     setIconFileName(file.name);
                if (onFileNameChange) {
                    onFileNameChange(file.name); // 👈 Send file name to parent
                }
                }
            };
            reader.readAsText(file); // Read the file as text
        } else {
            alert('Please upload a valid SVG file.');
        }
    };

    useEffect(() => {
    if (selectedSalesGroup?.icon) {
        setSvgCode(selectedSalesGroup.icon);
        setValue('icon', selectedSalesGroup.icon);
    }

    if (selectedSalesGroup?.iconFileName) {
        setIconFileName(selectedSalesGroup.iconFileName);
    }
}, [selectedSalesGroup, setValue]);

// console.log("iconFileName",iconFileName);


    return (
        <>
            <div className="flex flex-col mt-4">
                <label onClick={() => setSvgStyle(!svgStyle)} htmlFor="svg" className="flex gap-3 font-medium mb-2">
                   {!selectedSalesGroup?.icon && <span className='cursor-pointer hover:text-primary'>{!svgStyle ? 'Upload SVG*' : 'Svg Code'}</span> }
                    {selectedSalesGroup?.icon && <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={openDialog}
                            className="mb-4"
                          >
                            Update Icon
                          </Button>}
                    {svgCode && (
                        <div>
                            <div
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                    padding: '3px',
                                }}
                                dangerouslySetInnerHTML={{ __html: svgCode }}
                            />
                        </div>
                    )}
                    {!svgCode && selectedSalesGroup?.icon && (
                        <div className='flex flex-row px-2 mb-2'>
                            <div
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                    padding: '3px',
                                }}
                                dangerouslySetInnerHTML={{ __html: selectedSalesGroup?.icon }}
                            />
                        </div>
                    )}
                    <span className="text-gray-600 mb-1">
                          {iconFileName || 'No file chosen'}
                          </span>
                </label>
                {!svgStyle && !selectedSalesGroup?.icon && <input
                    id="iconSvg"
                    type="file"
                    accept=".svg"
                    className={`border rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.icon ? 'border-red-500' : 'border-gray'}`}
                    onChange={handleFileChange}
                />}
                <input
                    type={svgStyle ? "text" : "hidden"}
                    name="icon"
                    placeholder='Svg Icon'
                    className={`border border-gray p-3 rounded focus:outline-none focus:ring focus:ring-blue-300`}
                    {...register('icon', { required: 'SVG file is required' })}
                    value={svgCode || ''}
                    onChange={(e) => setSvgCode(e.target.value)}
                />
                {errors.icon && (
                    <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>
                )}
            </div>

            {/* Upload Dialog */}
                  <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
                    <DialogTitle
                      className="flex justify-between items-center"
                      sx={{ marginY: 2 }}
                    >
                      <span className="text-xl font-semibold">Upload Document</span>
                      <IconButton
                        onClick={closeDialog}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>
                    <DialogContent>
                      <div className="space-y-6">
                        <div
                          className="border-dashed border-2 border-gray-300 p-6 text-center cursor-pointer"
                        >
                          <input
                          id="iconSvg"
                          type="file"
                          accept=".svg"
                          className={`border rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.icon ? 'border-red-500' : 'border-gray'}`}
                          onChange={handleFileChange}
                       />
                          
                        </div>
                      </div>
                    </DialogContent>
            
                    <DialogActions>
                      <div className="p-5">
                        {/* <Button
                          onClick={closeDialog}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </Button> */}
                        <Button onClick={closeDialog} variant="contained" color="primary">
                          Save
                        </Button>
                      </div>
                    </DialogActions>
                  </Dialog>

            {/* <div className="flex flex-col mt-4">
            <label
                onClick={() => setSvgStyle(!svgStyle)}
                htmlFor="svg"
                className="flex gap-3 font-medium mb-2"
            >
                {!svgStyle ? 'Upload SVG*' : 'SVG Code'}
                {svgCode && (
                    <div>
                        <div
                            style={{
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                padding: '3px',
                            }}
                            dangerouslySetInnerHTML={{ __html: svgCode }}
                        />
                    </div>
                )}
                {!svgCode && selectedSalesGroup?.icon && (
                    <div>
                        <div
                            style={{
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                padding: '3px',
                            }}
                            dangerouslySetInnerHTML={{ __html: selectedSalesGroup.icon }}
                        />
                    </div>
                )}
            </label>

            {!svgStyle && (
                <>
                    <input
                        id="iconSvg"
                        type="file"
                        accept=".svg"
                        className={`border rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.icon ? 'border-red-500' : 'border-gray'}`}
                        onChange={handleFileChange}
                    />
                    <span className="text-gray-600 mt-1">
                        {iconFileName || 'No file chosen'}
                    </span>
                </>
            )}

            <input
                type={svgStyle ? 'text' : 'hidden'}
                name="icon"
                placeholder="SVG Icon"
                className={`border border-gray p-3 rounded focus:outline-none focus:ring focus:ring-blue-300`}
                {...register('icon', { required: 'SVG file is required' })}
                value={svgCode || ''}
                onChange={(e) => setSvgCode(e.target.value)}
            />

            {errors.icon && (
                <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>
            )}
        </div> */}
        </>
    );
};

export default IconPicker;






{/* <FormControl
                fullWidth
                error={!!errors.icon}
                variant="outlined"
                className=""
            >
                <InputLabel id="icon-label">Icon</InputLabel>
                <Controller
                    name="icon"
                    control={control}
                    rules={{ required: 'Icon is required' }}
                    render={({ field }) => (
                        <Select
                            {...field}
                            labelId="icon-label"
                            label="Icon"
                            value={field.value || ''}
                        >
                            <MenuItem value="">
                                <em>Select an Icon</em>
                            </MenuItem>
                            {icons.map((icon: any) => (
                                <MenuItem key={icon._id} value={icon._id}>
                                    <div className="flex items-center space-x-2">
                                        <div
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                overflow: 'hidden',
                                                padding: '3px'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: icon.svg }}
                                        />
                                        <span>{icon.name}</span>
                                    </div>
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                />
                {errors.icon && (
                    <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>
                )}
            </FormControl> */}
