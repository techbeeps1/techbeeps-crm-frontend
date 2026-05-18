import React from "react";
import { useFormContext } from "react-hook-form";

const NotesForm: React.FC<any> = ({
    type,
}) => {
    const { register } = useFormContext() as any;

    return (
        <div className="p-10 w-full">
            <div className="mb-4">
                <label htmlFor="notes" className="block text-lg font-medium">
                    Notes
                </label>
                <textarea
                    {...register(`${type}.genralNotes`)}
                    type="text"
                    id="notes"
                    placeholder="Notes"
                    className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                ></textarea>
            </div>
            <div className="mb-4">
                <label htmlFor="employee_notes" className="block text-lg font-medium">
                    Employee Notes
                </label>
                <textarea
                    {...register(`${type}.employeeNotes`)}
                    type="text"
                    id="employee_notes"
                    placeholder="Employee Notes"
                    className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                ></textarea>
            </div>
            <div className="mb-4">
                <label htmlFor="customer_notes" className="block text-lg font-medium">
                    Customer Notes
                </label>
                <textarea
                    {...register(`${type}.customerNotes`)}
                    type="text"
                    id="customer_notes"
                    placeholder="Notes for the customer"
                    className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                ></textarea>
            </div>
        </div>
    );
};

export default NotesForm;
