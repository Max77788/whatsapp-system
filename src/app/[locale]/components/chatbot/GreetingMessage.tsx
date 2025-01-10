"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { buttonSmallStyle } from "@/lib/classNames";

type GreetingMessageProps = {
    onMessageChange: (message: string) => void;
}

const GreetingMessage: React.FC<GreetingMessageProps> = ({
    onMessageChange
}) => {
    const [isGreetingEnabled, setIsGreetingEnabled] = useState(false);
    const [header, setHeader] = useState("");
    const [footer, setFooter] = useState("");
    const [bodyOptions, setBodyOptions] = useState([
        { option: "", response: "" },
    ]);
    const [triggerWord, setTriggerWord] = useState("");
    const [triggerWordMessage, setTriggerWordMessage] = useState("");
    const [useWithInstagram, setUseWithInstagram] = useState(false);
    const t = useTranslations("chatbotSetup");

    const addBodyOption = () => {
        if (bodyOptions.length >= 7) {
            toast.error(t("maxOptions"));
            return;
        }
        setBodyOptions([...bodyOptions, { option: "", response: "" }]);
    };

    const removeBodyOption = (index: number) => {
        if (bodyOptions.length <= 1) {
            return;
        }
        setBodyOptions(bodyOptions.filter((_, i) => i !== index));
    };

    const updateBodyOption = (index: number, key: 'option' | 'response', value: string) => {
        const updatedOptions = [...bodyOptions];
        updatedOptions[index][key] = value;
        setBodyOptions(updatedOptions);
    };

    const handleGreetingMessageEnabledChange = async (value: boolean) => {
        const response = await fetch("/api/text-tactics/greeting-message/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                isGreetingEnabled: value,
                header,
                footer,
                bodyOptions,
            }),
        });
        setIsGreetingEnabled(value);
    };

    useEffect(() => {
        onMessageChange(
            `${header}\n${bodyOptions.map((option, index) => `${index + 1}. ${option.option}\n(${t("response")}: ${option.response})`).join("\n")}\n${footer}\n${triggerWordMessage}: ${triggerWord}`
        );
    }, [header, bodyOptions, footer, triggerWordMessage, triggerWord, onMessageChange]);


    const getGreetingMessage = async () => {
        const response = await fetch("/api/user/find-user");
        const user = await response.json();

        const greetingMessageArray = user?.greetingMessage;

        if (greetingMessageArray) {
            setIsGreetingEnabled(greetingMessageArray.isGreetingEnabled);
            setHeader(greetingMessageArray.header);
            setFooter(greetingMessageArray.footer);
            setBodyOptions(greetingMessageArray.bodyOptions);
            setTriggerWord(greetingMessageArray.triggerWord);
            setTriggerWordMessage(greetingMessageArray.triggerWordMessage);
            setUseWithInstagram(greetingMessageArray.useWithInstagram || false);
        }
    }

    useEffect(() => {
        getGreetingMessage();
    }, []); 

    const saveGreetingMessage = async () => {
        try {
            const response = await fetch("/api/text-tactics/greeting-message/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isGreetingEnabled,
                    header,
                    footer,
                    bodyOptions,
                    triggerWord,
                    triggerWordMessage,
                    useWithInstagram
                }),
            });

            if (response.ok) {
                toast.success(t("greetingMessageSaved"));
                location.reload();
            } else {
                toast.error(t("failedToSaveGreetingMessage"));
            }
            
        } catch (error) {
            console.error("Error saving greeting message:", error);
            toast.error(t("failedToSaveGreetingMessage"));
        }
    };

    return (
        <div className="p-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{t("greetingMessageConfiguration")}</h3>
            <p className="text-sm text-gray-600 mb-4">{t("noteGreetingMessagePriority")}</p>

            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={isGreetingEnabled}
                        className="cursor-pointer"
                        onChange={() => handleGreetingMessageEnabledChange(!isGreetingEnabled)}
                    />
                    <p className="mx-1">{t("enableGreetingMessage")}</p>
                </label>
            </div>

        
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isGreetingEnabled ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                    }`}
                style={{
                    transitionProperty: "max-height, opacity", // Ensure both properties transition
                }}
            >
                    <div className="mb-4">
                        <label className="flex items-center gap-1 whitespace-nowrap">
                            <input type="checkbox" 
                            checked={useWithInstagram || false} 
                            className="cursor-pointer"
                            onChange={() => setUseWithInstagram(!useWithInstagram)} /> 
                            {t("useWithInstagram")}
                        </label>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("header")}
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={header}
                            onChange={(e) => setHeader(e.target.value)}
                            placeholder={t("greetingHeaderPlaceholder")}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("bodyOptions")}
                        </label>

                        {bodyOptions.map((option, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <textarea
                                    className="flex-1 border border-gray-300 rounded-md p-2 mr-2"
                                    value={option.option}
                                    onChange={(e) =>
                                        updateBodyOption(index, "option", e.target.value)
                                    }
                                    placeholder={t("optionPlaceholder", { number: index + 1 })}
                                />
                                <textarea
                                    className="flex-1 border border-gray-300 rounded-md p-2 mr-2"
                                    value={option.response}
                                    onChange={(e) =>
                                        updateBodyOption(index, "response", e.target.value)
                                    }
                                    placeholder={t("responsePlaceholder", { number: index + 1 })}
                                />
                                <button
                                    onClick={() => removeBodyOption(index)}
                                    className={buttonSmallStyle("red", "mx-3")}
                                >
                                    {t("remove")}
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={addBodyOption}
                            className="px-5 py-3 bg-green-600 text-white rounded-full mt-2"
                        >
                            {t("addOption")}
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("footer")}
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={footer}
                            onChange={(e) => setFooter(e.target.value)}
                            placeholder={t("greetingFooterPlaceholder")}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("triggerWordMessage")}
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={triggerWordMessage}
                            onChange={(e) => setTriggerWordMessage(e.target.value)}
                            placeholder={t("greetingTriggerWordMessagePlaceholder")}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("triggerWord")}
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={triggerWord}
                            onChange={(e) => setTriggerWord(e.target.value)}
                            placeholder={t("greetingTriggerWordPlaceholder")}
                        />
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={saveGreetingMessage}
                            className="px-5 py-3 bg-green-600 text-white rounded-full"
                        >
                            {t("saveGreetingMessage")}
                        </button>
                    </div>

                    {/*}
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-4">{t("thatsHowYourMessageWillLook")}</p>
                        <div className="flex flex-col gap-2 bg-color-red-100 p-2 rounded-md">
                            <div className="bg-gray-100 p-4 rounded-md">
                                <p className="text-sm text-gray-600 mb-2">{header}</p>
                                {bodyOptions.map((option, index) => (
                                    <div key={index} className="flex items-center mb-">
                                        <p className="text-sm text-gray-600">{`${index + 1}. ${option.option}`}</p>
                                    </div>
                                ))}
                                <p className="text-sm text-gray-600 mb-1 mt-2">{footer}</p>
                                <p className="text-sm text-gray-600">{triggerWordMessage}: {triggerWord}</p>
                            </div>
                        </div>
                    </div>
                    */}
                </div>
        </div>
    );
};

export default GreetingMessage;
