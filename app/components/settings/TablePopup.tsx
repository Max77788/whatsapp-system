"use client";

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useSession } from 'next-auth/react';

type RowData = {
    type: string;
    search_term: string;
    message_to_send: string;
    delay: number;
};

type InstructionSet = {
    name: string;
    rows: RowData[];
};

const TablePopup: React.FC = () => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [instructionSets, setInstructionSets] = useState<InstructionSet[]>([{ name: "Set 1", rows: [] }]);

    const togglePopup = () => setIsOpen(!isOpen);

    const handleSetNameChange = (index: number, name: string) => {
        const updatedSets = [...instructionSets];
        updatedSets[index].name = name;
        setInstructionSets(updatedSets);
    };

    const addSet = () => {
        setInstructionSets([
            ...instructionSets,
            { name: `Set ${instructionSets.length + 1}`, rows: [{ type: "includes", search_term: "", message_to_send: "", delay: 5 }] }
        ]);
    };

    const handleInputChange = <T extends keyof RowData>(setIndex: number, rowIndex: number, field: T, value: RowData[T]) => {
        const updatedSets = [...instructionSets];
        updatedSets[setIndex].rows[rowIndex][field] = value;
        setInstructionSets(updatedSets);
    };

    const addRow = (setIndex: number) => {
        const updatedSets = [...instructionSets];
        updatedSets[setIndex].rows.push({ type: "includes", search_term: "", message_to_send: "", delay: 5 });
        setInstructionSets(updatedSets);
    };

    const removeRow = (setIndex: number, rowIndex: number) => {
        const updatedSets = [...instructionSets];
        updatedSets[setIndex].rows = updatedSets[setIndex].rows.filter((_, i) => i !== rowIndex);
        setInstructionSets(updatedSets);
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
                    instructionSets,
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

                    <div className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded overflow-y-auto max-h-[80vh]">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Message Configuration
                        </Dialog.Title>

                        <div className="overflow-y-auto mt-4 max-h-96">
                            {instructionSets.map((set, setIndex) => (
                                <div key={setIndex} className="mb-6">
                                    <div className="flex items-center justify-between">
                                        <input
                                            value={set.name}
                                            onChange={(e) => handleSetNameChange(setIndex, e.target.value)}
                                            className="text-lg font-medium mb-2 w-full"
                                            placeholder={`Set ${setIndex + 1}`}
                                        />
                                    </div>
                                    
                                    <table className="w-full border border-gray-300 mb-2">
                                        <thead>
                                            <tr className="bg-blue-700">
                                                <th className="border border-gray-300 p-2 text-white">If received message</th>
                                                <th className="border border-gray-300 p-2 text-white">Custom Match</th>
                                                <th className="border border-gray-300 p-2 text-white">Send this message</th>
                                                <th className="border border-gray-300 p-2 text-white">In X seconds (min 5)</th>
                                                <th className="border border-gray-300 p-2 text-white">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {set.rows.map((row, rowIndex) => (
                                                <tr key={rowIndex} className="text-center text-black">
                                                    <td className="border border-gray-300 p-2">
                                                        <select
                                                            value={row.type}
                                                            onChange={(e) => handleInputChange(setIndex, rowIndex, 'type', e.target.value)}
                                                            className="w-full"
                                                        >
                                                            <option value="includes">Includes</option>
                                                            <option value="starts with">Starts With</option>
                                                        </select>
                                                    </td>
                                                    <td className="border border-gray-300 p-2">
                                                        <textarea
                                                            value={row.search_term}
                                                            onChange={(e) => handleInputChange(setIndex, rowIndex, 'search_term', e.target.value)}
                                                            className="w-full"
                                                            placeholder="Hi"
                                                        />
                                                    </td>
                                                    <td className="border border-gray-300 p-2">
                                                        <textarea
                                                            value={row.message_to_send}
                                                            onChange={(e) => handleInputChange(setIndex, rowIndex, 'message_to_send', e.target.value)}
                                                            className="w-full"
                                                            placeholder="Hi, how can we help you today?"
                                                        />
                                                    </td>
                                                    <td className="border border-gray-300 p-2">
                                                        <input
                                                            type="number"
                                                            value={row.delay}
                                                            onChange={(e) => handleInputChange(setIndex, rowIndex, 'delay', Math.max(5, parseInt(e.target.value)))}
                                                            className="w-full"
                                                            placeholder="15"
                                                        />
                                                    </td>
                                                    <td className="border border-gray-300 p-2">
                                                        <button
                                                            onClick={() => removeRow(setIndex, rowIndex)}
                                                            className="px-2 py-1 bg-red-500 text-white rounded"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <button onClick={() => addRow(setIndex)} className="px-4 py-2 bg-green-500 text-white rounded">
                                        Add Row
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <button onClick={addSet} className="px-4 py-2 bg-blue-500 text-white rounded">
                                Add New Set
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
