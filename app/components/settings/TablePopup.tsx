"use client";

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useSession } from 'next-auth/react';

type RowData = {
    name: string;
    type: string;
    search_term: string;
    message_to_send: string;
    delay: number;
};

type TablePopupProps = {
    initialRows: RowData[];
};

const TablePopup: React.FC<TablePopupProps> = ({ initialRows }) => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [rows, setRows] = useState<RowData[]>([]);

    useEffect(() => {
        // Initialize rows with initialRows from props
        setRows(initialRows);
    }, [initialRows]);

    const togglePopup = () => setIsOpen(!isOpen);

    const handleInputChange = <T extends keyof RowData>(index: number, field: T, value: RowData[T]) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    const addRow = () => {
        setRows([...rows, { name: "", type: "includes", search_term: "", message_to_send: "", delay: 5 }]);
    };

    const removeRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const saveData = async () => {
        const userEmail = session?.user?.email;
        if (!userEmail) {
            alert("User email not found.");
            return;
        }

        try {
            const response = await fetch('/api/whatsapp-part/save-message-logic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: userEmail,
                    messageLogicList: rows,
                }),
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
            <button onClick={togglePopup} className="px-4 py-2 bg-blue-500 text-white rounded">
                Modify Bot Logic
            </button>

            <Dialog open={isOpen} onClose={togglePopup} className="fixed inset-0 z-10 overflow-y-auto">
                <div className="min-h-screen px-4 text-center">
                    <div className="fixed inset-0 bg-black opacity-30" onClick={togglePopup} />

                    <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

                    <div className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Message Configuration Table
                        </Dialog.Title>

                        <div className="overflow-x-auto mt-4">
                            <table className="w-full border border-gray-300">
                                <thead>
                                    <tr className="bg-blue-700">
                                        <th className="border border-gray-300 p-2 text-white">Name</th>
                                        <th className="border border-gray-300 p-2 text-white">If received message</th>
                                        <th className="border border-gray-300 p-2 text-white">Custom Match</th>
                                        <th className="border border-gray-300 p-2 text-white">Send this message</th>
                                        <th className="border border-gray-300 p-2 text-white">In X seconds (min 5)</th>
                                        <th className="border border-gray-300 p-2 text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={index} className="text-center text-black">
                                            <td className="border border-gray-300 p-2">
                                                <input
                                                    value={row.name || ""}
                                                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                                    className="w-full"
                                                    placeholder={`Tactic ${index + 1}`}
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <select
                                                    value={row.type || "includes"}
                                                    onChange={(e) => handleInputChange(index, 'type', e.target.value)}
                                                    className="w-full"
                                                >
                                                    <option value="includes">Includes</option>
                                                    <option value="starts with">Starts With</option>
                                                </select>
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <textarea
                                                    value={row.search_term || ""}
                                                    onChange={(e) => handleInputChange(index, 'search_term', e.target.value)}
                                                    className="w-full"
                                                    placeholder="Hi"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <textarea
                                                    value={row.message_to_send || ""}
                                                    onChange={(e) => handleInputChange(index, 'message_to_send', e.target.value)}
                                                    className="w-full"
                                                    placeholder="Hi, how can we help you today?"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                <input
                                                    type="number"
                                                    value={row.delay || ""}
                                                    onChange={(e) => handleInputChange(index, 'delay', Math.max(5, parseInt(e.target.value)))}
                                                    className="w-full"
                                                    placeholder="15"
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

                        <div className="mt-4">
                            <button onClick={addRow} className="px-4 py-2 bg-green-500 text-white rounded">
                                Add Row
                            </button>
                            <button onClick={saveData} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded">
                                Save
                            </button>
                            <button onClick={togglePopup} className="ml-4 px-4 py-2 bg-red-500 text-white rounded">
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
