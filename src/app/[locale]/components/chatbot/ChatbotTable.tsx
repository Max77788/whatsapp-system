"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
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
    useWithInstagram: boolean;
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

    const t = useTranslations("chatbotSetup");

    const fetchGroups = async () => {
        const response = await fetch("/api/user/find-user");
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
                          name: t("customSetName1"),
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
                          useWithInstagram: false,
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
                useWithInstagram: false,
            },
        ]);
    };

    const deleteSet = (index: number) => {
        if (instructionSets.length === 1) {
            toast.error(t("cannotDeleteFirstSet"));
            return;
        }
        
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
            toast.error(t("atLeastOnePlatformMustBeSelected"));
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

        setInstructionSets(updatedSets);
    };

    const handleUseWithInstagramChange = (setIndex: number, value: boolean) => {
        const updatedSets = [...instructionSets];
        
        console.log(updatedSets[setIndex]);
        
        updatedSets[setIndex].useWithInstagram = value;
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
        
        if (rowIndex === 0) {
            toast.error(t("cannotDeleteFirstRow"));
            return;
        }
        
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
                toast.error(t("failedToSaveData"));
            }
        } catch (error) {
            console.error("Error saving data:", error);
            toast.error(t("failedToSaveData"));
        }
    };

    return (
        <div className="p-4">
            {!isLoadingInstructionSets && <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{t("messageConfiguration")}</h3>}
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
                            placeholder={`${t("customSetName")} ${setIndex + 1}`}
                        />
                        <label className="flex items-center gap-1 whitespace-nowrap mr-2 ml-2">
                            <input 
                            type="checkbox"
                            checked={set?.useWithInstagram || false}
                            onChange={(e) => handleUseWithInstagramChange(setIndex, e.target.checked)}
                            /> {t("useWithInstagram")}
                        </label>
                        <button
                            onClick={() => deleteSet(setIndex)}
                            className="ml-2 px-5 py-3 bg-red-600 text-white rounded-full mb-2 flex items-center justify-center whitespace-nowrap"
                        >
                            {t("deleteSet")}
                        </button>
                    </div>
                    <table className="w-full border border-gray-300 mb-2">
                        <thead>
                            <tr className="bg-green-600">
                                <th className="border border-gray-300 p-2 text-white">{t("ifReceivedMessage")}</th>
                                <th className="border border-gray-300 p-2 text-white">{t("customMatch")}</th>
                                <th className="border border-gray-300 p-2 text-white">{t("sendThisMessage")}</th>
                                <th className="border border-gray-300 p-2 text-white">{t("inXSeconds")}</th>
                                <th className="border border-gray-300 p-2 text-white">{t("platforms")}</th>
                                <th className="border border-gray-300 p-2 text-white">{t("groups")}</th>
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
                                            <option value="includes">{t("includes")}</option>
                                            <option value="starts with">{t("startsWith")}</option>
                                        </select>
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <textarea
                                            value={row.search_term}
                                            onChange={(e) =>
                                                handleInputChange(setIndex, rowIndex, "search_term", e.target.value)
                                            }
                                            className="w-full"
                                            placeholder={t("hi")}
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <textarea
                                            value={row.message_to_send}
                                            onChange={(e) =>
                                                handleInputChange(setIndex, rowIndex, "message_to_send", e.target.value)
                                            }
                                            className="w-full"
                                            placeholder={t("hiHowCanWeHelpYouToday")}
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
                                            className="px-3 py-2 bg-red-600 text-white rounded-full"
                                        >
                                            {t("remove")}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        onClick={() => addRow(setIndex)}
                        className="px-5 py-3 bg-green-600 text-white rounded-full"
                    >
                        {t("addRow")}
                    </button>
                </div>
            ))}
            {!isLoadingInstructionSets && <div className="mt-4">
                <button onClick={addSet} className="px-5 py-3 bg-green-600 text-white rounded-full">
                    {t("addNewSet")}
                </button>
                <button onClick={saveData} className="ml-4 px-5 py-3 bg-green-600 text-white rounded-full">
                    {t("save")}
                    </button>
                    </div>
            }
        </div>
    );
};

export default ChatbotTable;
