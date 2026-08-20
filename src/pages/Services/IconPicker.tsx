import React, { useEffect, useState } from 'react';
import { MdCloudUpload, MdCode, MdCheckCircle } from 'react-icons/md';

interface IconPickerProps {
  control?: any;
  errors?: any;
  register: any;
  setValue: any;
  selectedSalesGroup?: any;
  onFileNameChange?: (fileName: string) => void;
  icons?: any[];
}

const IconPicker: React.FC<IconPickerProps> = ({
  register,
  errors,
  setValue,
  selectedSalesGroup,
  onFileNameChange,
}) => {
  const [svgCode, setSvgCode] = useState<string | null>(null);
  const [svgMode, setSvgMode] = useState<'upload' | 'code'>('upload');
  const [iconFileName, setIconFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/svg+xml' || file.name.endsWith('.svg'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setSvgCode(result);
          setValue('icon', result);
          setIconFileName(file.name);
          if (onFileNameChange) {
            onFileNameChange(file.name);
          }
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .svg vector file.');
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

  return (
    <div className="space-y-3">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-black dark:text-white">
          Vector SVG Emblem
        </span>
        <button
          type="button"
          onClick={() => setSvgMode(svgMode === 'upload' ? 'code' : 'upload')}
          className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <MdCode className="text-sm" />
          {svgMode === 'upload' ? 'Paste SVG Code' : 'Upload SVG File'}
        </button>
      </div>

      {svgMode === 'upload' ? (
        <div className="relative border-2 border-dashed border-stroke dark:border-strokedark hover:border-primary dark:hover:border-primary bg-gray-2/40 dark:bg-meta-4/10 rounded-2xl p-4 transition-all text-center group">
          <input
            id="iconSvg"
            type="file"
            accept=".svg"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center pointer-events-none">
            {svgCode ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark p-2 text-primary flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: svgCode }}
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-black dark:text-white flex items-center gap-1">
                    <MdCheckCircle className="text-meta-3 text-sm" />
                    {iconFileName || 'Custom SVG Loaded'}
                  </p>
                  <p className="text-[11px] text-slate-400">Click or drop to replace</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-1.5 group-hover:scale-110 transition-transform">
                  <MdCloudUpload />
                </div>
                <p className="text-xs font-bold text-black dark:text-white">
                  Click or drag SVG file here
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Scalable vector graphics (.svg)
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          <textarea
            rows={3}
            placeholder="<svg ...>...</svg>"
            className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark p-3 text-xs font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={svgCode || ''}
            onChange={(e) => {
              setSvgCode(e.target.value);
              setValue('icon', e.target.value);
            }}
          />
        </div>
      )}

      {/* Hidden input for react-hook-form registration */}
      <input
        type="hidden"
        {...register('icon')}
        value={svgCode || ''}
      />

      {errors?.icon && (
        <p className="text-meta-1 text-xs mt-1">{errors.icon.message as string}</p>
      )}
    </div>
  );
};

export default IconPicker;

