// components/TablePopup.tsx
"use client";

import { useState } from 'react';
import { Dialog } from '@headlessui/react';

type RowData = {
    message: string;
    options: string;
    manualInput1: string;
    send: string;
    manualInput2: string;
    seconds: string;
    x: boolean;
};

const TablePopup: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [rows, setRows] = useState<RowData[]>([
        { message: "", options: "", manualInput1: "", send: "", manualInput2: "", seconds: "", x: false },
    ]);

    const togglePopup = () => setIsOpen(!isOpen);

    const handleInputChange = <T extends keyof RowData>(index: number, field: T, value: RowData[T]) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    const addRow = () => {
        setRows([...rows, { message: "", options: "", manualInput1: "", send: "", manualInput2: "", seconds: "", x: false }]);
    };

    const removeRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const saveData = async () => {
        try {
            const response = await fetch('/api/saveTableData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rows }),
            });
            if (response.ok) {
                alert("Data saved successfully!");
            } else {
                alert("Failed to save data.");
            }
        } catch (error) {
            console.error("Error saving data:", error);
            alert("An error occurred while saving data.");
        }
    };

    return (
        <div>
            {/* Button to open the popup */}
            <button
                onClick={togglePopup}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Modify Bot Logic
            </button>

            {/* Modal Popup */}
            <Dialog open={isOpen} onClose={togglePopup} className="fixed inset-0 z-10 overflow-y-auto">
                <div className="min-h-screen px-4 text-center">
                    {/* Background Overlay */}
                    <div className="fixed inset-0 bg-black opacity-30" onClick={togglePopup} />

                    <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

                    <div className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Message Configuration Table
                        </Dialog.Title>

                        {/* Table Structure */}
                        <div className="overflow-x-auto mt-4">
                            <table className="w-full border border-gray-300">
                                <thead>
                                    <tr className="bg-blue-700">
                                        <th className="border border-gray-300 p-2 text-white">Message</th>
                                        <th className="border border-gray-300 p-2 text-white">Options</th>
                                        <th className="border border-gray-300 p-2 text-white">Manual Input 1</th>
                                        <th className="border border-gray-300 p-2 text-white">Send</th>
                                        <th className="border border-gray-300 p-2 text-white">Manual Input 2</th>
                                        <th className="border border-gray-300 p-2 text-white">Seconds</th>
                                        <th className="border border-gray-300 p-2 text-white">X</th>
                                        <th className="border border-gray-300 p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={index} className="text-center text-black">
                                            <td className="border border-gray-300 p-2">
                                                <input
                                                    type="text"
                                                    value={row.message}
                                                    onChange={(e) => handleInputChange(index, 'message', e.target.value)}
                                                    className="w-full"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <select
                                                    value={row.options}
                                                    onChange={(e) => handleInputChange(index, 'options', e.target.value)}
                                                    className="w-full"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="includes">Includes</option>
                                                    <option value="starts with">Starts With</option>
                                                </select>
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <input
                                                    type="text"
                                                    value={row.manualInput1}
                                                    onChange={(e) => handleInputChange(index, 'manualInput1', e.target.value)}
                                                    className="w-full"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <input
                                                    type="text"
                                                    value={row.send}
                                                    onChange={(e) => handleInputChange(index, 'send', e.target.value)}
                                                    className="w-full"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <input
                                                    type="text"
                                                    value={row.manualInput2}
                                                    onChange={(e) => handleInputChange(index, 'manualInput2', e.target.value)}
                                                    className="w-full"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <input
                                                    type="number"
                                                    value={row.seconds}
                                                    onChange={(e) => handleInputChange(index, 'seconds', e.target.value)}
                                                    className="w-full"
                                                    placeholder="Seconds"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <input
                                                    type="checkbox"
                                                    checked={row.x}
                                                    onChange={(e) => handleInputChange(index, 'x', e.target.checked)}
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <button
                                                    onClick={() => removeRow(index)}
                                                    className="px-2 py-1 bg-red-500 text-white rounded"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Row and Save Buttons */}
                        <div className="mt-4">
                            <button
                                onClick={addRow}
                                className="px-4 py-2 bg-green-500 text-white rounded"
                            >
                                Add Row
                            </button>
                            <button
                                onClick={saveData}
                                className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Save
                            </button>
                            <button
                                onClick={togglePopup}
                                className="ml-4 px-4 py-2 bg-red-500 text-white rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default TablePopup;
