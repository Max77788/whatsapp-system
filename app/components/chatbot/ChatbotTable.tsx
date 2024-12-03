"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

type RowData = {
    type: string;
    search_term: string;
    message_to_send: string;
    delay: number;
    platforms: string[];
    groups: string[];
    selectedGroups: string[];
};

type InstructionSet = {
    name: string;
    rows: RowData[];
};

type TablePopupProps = {
    initialTactics?: InstructionSet[];
};



const ChatbotTable: React.FC<TablePopupProps> = ({ initialTactics = [] }) => {
    const { data: session } = useSession();
    const [instructionSets, setInstructionSets] = useState<InstructionSet[]>([]);
    const [isLoadingInstructionSets, setIsLoadingInstructionSets] = useState(true);
    const [groups, setGroups] = useState<string[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

    const fetchGroups = async () => {
        const response = await fetch("/api/user/find_user");
        const data = await response.json();
        const leadGroups = data.leadGroups || ["other"];
    
        setGroups(leadGroups);
    
        return leadGroups;
    };

    useEffect(() => {
        fetchGroups();
    }, []);
    
    useEffect(() => {
        const initializedTactics = (initialTactics || []).map((set) => ({
            ...set,
            rows: (set.rows || []).map((row) => ({
                ...row,
                platforms: Array.isArray(row.platforms) ? row.platforms : ["wpforms"], // Ensure it's always an array
            })),
        }));
    
        setInstructionSets(
            initializedTactics.length > 0
                ? initializedTactics
                : [
                      {
                          name: "Custom Set Name 1",
                          rows: [
                              {
                                  type: "includes",
                                  search_term: "dda",
                                  message_to_send: "dda",
                                  delay: 5,
                                  platforms: ["wpforms"],
                                  groups: ["other"],
                                  selectedGroups: ["other"],
                              },
                          ],
                      },
                  ]
        );

        setIsLoadingInstructionSets(false);
    }, [initialTactics]);
    

    const handleSetNameChange = (index: number, name: string) => {
        const updatedSets = [...instructionSets];
        updatedSets[index].name = name;
        setInstructionSets(updatedSets);
    };

    const addSet = () => {
        setInstructionSets([
            ...instructionSets,
            {
                name: `Set ${instructionSets.length + 1}`,
                rows: [
                    {
                        type: "includes",
                        search_term: "",
                        message_to_send: "",
                        delay: 5,
                        platforms: ["wpforms"],
                        groups: ["other"],
                        selectedGroups: ["other"],
                    },
                ],
            },
        ]);
    };

    const deleteSet = (index: number) => {
        setInstructionSets(instructionSets.filter((_, i) => i !== index));
    };

    const handleInputChange = <T extends keyof RowData>(
        setIndex: number,
        rowIndex: number,
        field: T,
        value: RowData[T]
    ) => {
        const updatedSets = [...instructionSets];
        updatedSets[setIndex].rows[rowIndex][field] = value;
        setInstructionSets(updatedSets);
    };

    const handlePlatformChange = (setIndex: number, rowIndex: number, platform: string) => {
        const updatedSets = [...instructionSets];
        const row = updatedSets[setIndex].rows[rowIndex];

        if (!Array.isArray(row.platforms)) row.platforms = ["wpforms"];

        if (!row.platforms.includes(platform)) {
            row.platforms.push(platform);
        } else if (row.platforms.length > 1) {
            row.platforms = row.platforms.filter((p) => p !== platform);
        } else {
            alert("At least one platform must be selected.");
        }

        setInstructionSets(updatedSets);
    };

    const handleGroupChange = (setIndex: number, rowIndex: number, group: string) => {
        const updatedSets = [...instructionSets];
        if (!Array.isArray(updatedSets[setIndex].rows[rowIndex].selectedGroups)) {
            updatedSets[setIndex].rows[rowIndex].selectedGroups = [];
        }
        updatedSets[setIndex].rows[rowIndex].selectedGroups.push(group);
        setSelectedGroups(updatedSets[setIndex].rows[rowIndex].selectedGroups);
        
        if (updatedSets[setIndex].rows[rowIndex].selectedGroups.length === 0) {
            updatedSets[setIndex].rows[rowIndex].selectedGroups = ["other"];
        }
        
        console.log(`updatedSets: ${JSON.stringify(updatedSets)}`);

        setInstructionSets(updatedSets);
    };

    const addRow = (setIndex: number) => {
        const updatedSets = [...instructionSets];
        updatedSets[setIndex].rows.push({
            type: "includes",
            search_term: "",
            message_to_send: "",
            delay: 5,
            platforms: ["wpforms"],
            groups: ["other"],
            selectedGroups: ["other"],
        });
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
            const response = await fetch("/api/whatsapp-part/save-message-logic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userEmail,
                    messageLogicList: instructionSets,
                }),
            });

            if (response.ok) {
                toast.success("Data saved successfully!");
                await new Promise(resolve => setTimeout(resolve, 1000));
                location.reload();
            } else {
                alert("Failed to save data.");
            }
        } catch (error) {
            console.error("Error saving data:", error);
            alert("An error occurred while saving data.");
        }
    };

    return (
        <div className="p-4">
            {!isLoadingInstructionSets && <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Message Configuration</h3>}
            {isLoadingInstructionSets && <div className="animate-pulse flex justify-center">
                <div className="h-20 bg-gray-300 rounded w-80"></div>
            </div>}
            {!isLoadingInstructionSets && instructionSets.map((set, setIndex) => (
                <div key={setIndex} className="mb-6">
                    <div className="flex items-center justify-between">
                        <input
                            value={set.name}
                            onChange={(e) => handleSetNameChange(setIndex, e.target.value)}
                            className="text-lg font-medium mb-2 w-full text-black"
                            placeholder={`Custom Set Name ${setIndex + 1}`}
                        />
                        <button
                            onClick={() => deleteSet(setIndex)}
                            className="ml-2 px-4 py-2 bg-red-600 text-white rounded mb-2 flex items-center justify-center whitespace-nowrap"
                        >
                            Delete Set
                        </button>
                    </div>
                    <table className="w-full border border-gray-300 mb-2">
                        <thead>
                            <tr className="bg-blue-700">
                                <th className="border border-gray-300 p-2 text-white">If received message</th>
                                <th className="border border-gray-300 p-2 text-white">Custom Match</th>
                                <th className="border border-gray-300 p-2 text-white">Send this message</th>
                                <th className="border border-gray-300 p-2 text-white">In X seconds</th>
                                <th className="border border-gray-300 p-2 text-white">Platforms</th>
                                <th className="border border-gray-300 p-2 text-white">Groups</th>
                                <th className="border border-gray-300 p-2 text-white"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {set.rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="text-center text-black">
                                    <td className="border border-gray-300 p-2">
                                        <select
                                            value={row.type}
                                            onChange={(e) =>
                                                handleInputChange(setIndex, rowIndex, "type", e.target.value)
                                            }
                                            className="w-full"
                                        >
                                            <option value="includes">Includes</option>
                                            <option value="starts with">Starts With</option>
                                        </select>
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <textarea
                                            value={row.search_term}
                                            onChange={(e) =>
                                                handleInputChange(setIndex, rowIndex, "search_term", e.target.value)
                                            }
                                            className="w-full"
                                            placeholder="Hi"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <textarea
                                            value={row.message_to_send}
                                            onChange={(e) =>
                                                handleInputChange(setIndex, rowIndex, "message_to_send", e.target.value)
                                            }
                                            className="w-full"
                                            placeholder="Hi, how can we help you today?"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <input
                                            type="number"
                                            value={row.delay}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    setIndex,
                                                    rowIndex,
                                                    "delay",
                                                    Math.max(5, parseInt(e.target.value))
                                                )
                                            }
                                            className="w-full"
                                            placeholder="15"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <div className="flex flex-col">
                                            {["wpforms", "facebook", "contact-forms7", "other"].map((platform) => (
                                                <label key={platform} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2"
                                                        checked={row.platforms.includes(platform)}
                                                        onChange={() =>
                                                            handlePlatformChange(setIndex, rowIndex, platform)
                                                        }
                                                    />
                                                    {platform}
                                                </label>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <div className="flex flex-col">
                                            {groups.map((group) => (
                                                <label key={group} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2"
                                                        checked={row.selectedGroups?.includes(group)}
                                                        onChange={() =>
                                                            handleGroupChange(setIndex, rowIndex, group)
                                                        }
                                                    />
                                                    {group}
                                                </label>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <button
                                            onClick={() => removeRow(setIndex, rowIndex)}
                                            className="px-2 py-1 bg-red-600 text-white rounded"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        onClick={() => addRow(setIndex)}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                        Add Row
                    </button>
                </div>
            ))}
            {!isLoadingInstructionSets && <div className="mt-4">
                <button onClick={addSet} className="px-4 py-2 bg-blue-700 text-white rounded">
                    Add New Set
                </button>
                <button onClick={saveData} className="ml-4 px-4 py-2 bg-blue-700 text-white rounded">
                    Save
                    </button>
                    </div>
            }
        </div>
    );
};

export default ChatbotTable;
