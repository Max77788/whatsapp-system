"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { buttonBigStyle, buttonSmallStyle } from "@/lib/classNames"

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
    onSelectSet?: (selectedSet: InstructionSet) => void; // <-- add this callback
    onAddRow?: (newRow: any) => void;
    onRemoveRow?: (rowIndex: number) => void
};



const ChatbotTableCopy: React.FC<TablePopupProps> = ({
    initialTactics = [],
    onSelectSet,
    onAddRow,
    onRemoveRow
}) => {
    const { data: session } = useSession();
    const [instructionSets, setInstructionSets] = useState<InstructionSet[]>([]);
    const [isLoadingInstructionSets, setIsLoadingInstructionSets] = useState(true);
    const [groups, setGroups] = useState<string[]>([]);

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

    useEffect(() => {
        onSelectSet?.(instructionSets[0]);
    }, [isLoadingInstructionSets]);

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


    const handleUseWithInstagramChange = (setIndex: number, value: boolean) => {
        const updatedSets = [...instructionSets];
        
        console.log(updatedSets[setIndex]);
        
        updatedSets[setIndex].useWithInstagram = value;
        setInstructionSets(updatedSets);
    };

    const addRow = (setIndex: number) => {
        const newRow = {
            type: "includes",
            search_term: "",
            message_to_send: "",
            delay: 5,
            platforms: ["wpforms"],
            groups: ["other"],
            selectedGroups: ["other"],
        };
        
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
        onSelectSet?.(updatedSets[setIndex]);


        onAddRow?.(newRow);
    };

    const removeRow = (setIndex: number, rowIndex: number) => {
        
        if (!confirm(t("areYouSureYouWantToDeleteThisRule"))) {
            return;
        }

        
        if (rowIndex === 0) {
            toast.error(t("cannotDeleteFirstRow"));
            return;
        }
        
        const updatedSets = [...instructionSets];
        updatedSets[setIndex].rows = updatedSets[setIndex].rows.filter((_, i) => i !== rowIndex);
        
        setInstructionSets(updatedSets);

        onRemoveRow?.(rowIndex)
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
                toast.success(t("savedSuccessfully"));
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
        <div className="p-4 h-screen flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            { /* {!isLoadingInstructionSets && <h3 className="text-lg font-medium leading-6 text-gray-900">{t("messageConfiguration")}</h3>} */}
            
            {!isLoadingInstructionSets && <div className="mt-1">
                <button onClick={addSet} className={buttonSmallStyle("green")}>
                    {t("addNewSet")} ➕
                </button>
                <button onClick={saveData} className={buttonSmallStyle("green", "mx-7")}>
                    {t("save")} 👆
                </button>
                <p className="mb-4 mt-4 font-bold italic">*{t("scrollDownToSeeNewlyAddedSet")}</p>
            </div>
            }

            {isLoadingInstructionSets && <div className="animate-pulse flex justify-center">
                <div className="h-20 bg-gray-300 rounded w-80"></div>
            </div>}
            {!isLoadingInstructionSets && instructionSets.map((set, setIndex: number) => (
                <div key={setIndex} 
                    className="border border-gray-300 rounded-lg shadow p-6 mb-6 bg-white"
                onClick={() => onSelectSet?.(set)} >
                    <div className="flex flex-col mb-2">
                        <div className="mb-2">
                            <input
                                value={set.name}
                                onChange={(e) => handleSetNameChange(setIndex, e.target.value)}
                                className="text-lg font-medium w-full text-black"
                                placeholder={`${t("customSetName")} ${setIndex + 1}`}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="flex items-center gap-1">
                                <input 
                                    type="checkbox"
                                    checked={set?.useWithInstagram || false}
                                    onChange={(e) => handleUseWithInstagramChange(setIndex, e.target.checked)}
                                /> 
                                {t("useWithInstagram")} <img src="/instagram_logo.png" alt="Insta Logo" className="w-5 h-5" />
                            </label>
                        </div>
                        <div>
                            <button
                                onClick={() => deleteSet(setIndex)}
                                className={buttonSmallStyle("red")}
                            >
                                {t("deleteSet")}❌
                            </button>
                        </div>
                    </div>
                    <div className="border border-gray-300 mb-2 p-4">
                        <p className="text-lg font-semibold text-green-600 mb-2">{`${t("set")}: ${set.name}`}</p>
                        {set.rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="mb-4 border-b-4 pb-2">
                                <h5 className="text-lg font-medium mb-4">{`${t("rule")} #${rowIndex + 1}`}</h5>
                                {/* Type Field */}
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t("type")} 💬
                                    </label>
                                    <select
                                        value={row.type}
                                        onChange={(e) =>
                                            handleInputChange(
                                                setIndex,
                                                rowIndex,
                                                "type",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    >
                                        <option value="includes">{t("includes")}</option>
                                        <option value="starts with">{t("startsWith")}</option>
                                        {/* Add more options as needed */}
                                    </select>
                                </div>

                                {/* Search Term Field */}
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t("searchTerm")} 
                                    </label>
                                    <input
                                        type="text"
                                        value={row.search_term}
                                        onChange={(e) =>
                                            handleInputChange(
                                                setIndex,
                                                rowIndex,
                                                "search_term",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        placeholder={t("enterSearchTerm")}
                                    />
                                </div>

                                {/* Message to Send Field */}
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t("messageToSend")}✍️
                                    </label>
                                    <textarea
                                        value={row.message_to_send}
                                        onChange={(e) =>
                                            handleInputChange(
                                                setIndex,
                                                rowIndex,
                                                "message_to_send",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        placeholder={`${t("enterMessageToSend")}✍️`} 
                                    />
                                </div>

                                {/* Delay Field */}
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t("delayInSeconds")} ⏲️
                                    </label>
                                    <input
                                        type="number"
                                        value={row.delay}
                                        onChange={(e) =>
                                            handleInputChange(
                                                setIndex,
                                                rowIndex,
                                                "delay",
                                                Number(e.target.value)
                                            )
                                        }
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        min={5}
                                    />
                                </div>

                                {/* Platforms Field */}
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t("platforms")}
                                    </label>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {["wpforms", "instagram", "facebook"].map((platform) => (
                                            <label key={platform} className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={row.platforms?.includes(platform)}
                                                    onChange={() =>
                                                        handlePlatformChange(
                                                            setIndex,
                                                            rowIndex,
                                                            platform
                                                        )
                                                    }
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                                <span className="mx-2 capitalize flex items-center gap-2">
                                                    {platform}
                                                    <img
                                                        src={`/${platform}_logo.png`}
                                                        alt={`${platform} Logo`}
                                                        className="w-5 h-5"
                                                    />
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Remove Row Button */}
                                <button
                                    onClick={() => removeRow(setIndex, rowIndex)}
                                    className={buttonSmallStyle("red")}
                                >
                                    {t("removeRule")} ➖
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => addRow(setIndex)}
                            className={buttonSmallStyle()}
                        >
                            {t("addRule")} ➕
                        </button>
                    </div>
                </div>
            ))}

            {!isLoadingInstructionSets && <div className="mt-1">
                <button onClick={addSet} className={buttonSmallStyle("green")}>
                    {t("addNewSet")} ➕
                </button>
                <button onClick={saveData} className={buttonSmallStyle("green", "mx-7")}>
                    {t("save")} 👆
                </button>
            </div>
            }
        </div>
    );
};

export default ChatbotTableCopy;
