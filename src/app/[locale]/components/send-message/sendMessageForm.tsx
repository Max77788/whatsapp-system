"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect, JSX } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { v4 } from "uuid";
interface Props {
  fromPhones: string[]; // List of available phone numbers for "from" field
  toPhones: string[]; // List of available phone numbers for "to" field
}

const SendMessageForm: React.FC<Props> = ({ fromPhones, toPhones }) => {
  const { data: session } = useSession();
  const [fromNumber, setFromNumber] = useState("");
  const [toNumbers, setToNumbers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<{ template_name: string; message: string }[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [mediaAttachment, setMediaAttachment] = useState<File | null>(null);
  const [isMediaPreviewVisible, setIsMediaPreviewVisible] = useState(false);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const t = useTranslations("sendMessage");

const handleScheduleMessage = async () => {
  console.log(`selectedGroups: ${JSON.stringify(selectedGroups)}`);
  console.log(`toNumbers: ${JSON.stringify(toNumbers)}`);

  if (fromNumber && (toNumbers.length > 0 || selectedGroups.length > 0) && message && scheduleTime && timeZone) {
    const formData = new FormData();
    formData.append("fromNumber", fromNumber);
    formData.append("toNumbers", JSON.stringify(toNumbers));
    formData.append("message", message);
    formData.append("groups", JSON.stringify(selectedGroups));
    formData.append("scheduleTime", scheduleTime);
    formData.append("timeZone", timeZone);

    if (mediaAttachment) {
      formData.append("media", mediaAttachment);
    }

    try {
      const response = await fetch("/api/whatsapp-part/schedule-message", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success(t("messageScheduled"));
        await new Promise((resolve) => setTimeout(resolve, 2000));
        location.reload();
        setIsScheduleModalOpen(false);
      } else {
        toast.error(t("failedToScheduleMessage"));
      }
    } catch (error) {
      console.error("Error scheduling message:", error);
      toast.error(t("anErrorOccurredWhileSchedulingTheMessage"));
    }
  } else {
    toast.error(t("pleaseFillInAllFields"));
  }
};



  const fetchGroups = async () => {
    try {
      const response = await axios.get("/api/user/find-user");
      const user = response.data;
      setGroups(user.leadGroups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error(t("failedToLoadGroups"));
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const toggleGroupSelection = (group: string) => {
    setSelectedGroups((prevSelectedGroups) => {
      let updatedSelectedGroups;

      if (prevSelectedGroups.includes(group)) {
        // If already selected, remove the group
        updatedSelectedGroups = prevSelectedGroups.filter((g) => g !== group);
      } else {
        // Otherwise, add the group
        updatedSelectedGroups = [...prevSelectedGroups, group];
      }

      // Automatically clear toNumbers if any group is selected
      if (updatedSelectedGroups.length > 0) {
        setToNumbers([]); // Clear toNumbers if groups are chosen
      }

      return updatedSelectedGroups;
    });
  };

  const handleSelectAllToggle = () => {
    if (selectedGroups.length > 0) {
      toast.error(t("cannotUseSelectAllWhenGroupsAreSelected"));
      return;
    }
    if (selectAll) {
      setToNumbers([]); // Clear all selections
    } else {
      setToNumbers(toPhones); // Select all phone numbers
    }
    setSelectAll(!selectAll);
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/message/get-templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.messageTemplates);
      } else {
        // toast.error("Failed to fetch message templates.");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error(t("anErrorOccurredWhileFetchingTemplates"));
    }
  };

  const openTemplateModal = () => {
    fetchTemplates();
    setIsTemplateModalOpen(true);
  };
  
  const handleLoadTemplate = (templateMessage: string) => {
    setMessage(templateMessage);
  };

  const saveMessageToTemplate = async () => {
    if (!templateName || !message) {
      toast.error(t("pleaseProvideATemplateNameAndMessage"));
      return;
    }
  
    const payload = {
      messageTemplates: [
        {
          id: templateName+"-"+v4().slice(-4),
          template_name: templateName,
          message,
        },
      ],
    };
  
    try {
      const response = await fetch("/api/message/save-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        toast.success(t("messageSavedAsTemplate"));
        fetchTemplates(); // Refresh the template list
        setIsSaveModalOpen(false);
      } else {
        toast.error(t("failedToSaveMessageAsTemplate"));
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error(t("anErrorOccurredWhileSavingTheTemplate"));
    }
  };
  
  

  const handleSendMessage = async () => {
    if (fromNumber && (toNumbers.length > 0 || selectedGroups.length > 0) && message) {
      const formData = new FormData();
      formData.append("fromNumber", fromNumber);
      formData.append("toNumbers", JSON.stringify(toNumbers));
      formData.append("message", message);
      formData.append("groups", JSON.stringify(selectedGroups));

      if (mediaAttachment) {
        formData.append("media", mediaAttachment);
      }

      try {
        const response = await fetch("/api/whatsapp-part/send-message", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          toast.success(t("messageSent"));
          await new Promise((resolve) => setTimeout(resolve, 2000));
          location.reload();
        } else {
          toast.error(t("failedToSendMessage"));
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error(t("anErrorOccurredWhileSendingTheMessage"));
      }
    } else {
      toast.error(t("pleaseFillInAllFields"));
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchTemplates();
  }, []);
  

  return (
    <div className="bg-white shadow-2xl rounded-lg mb-16 p-4">
      <p className="text-center animate-pulse text-2xl mb-4 font-semibold text-gray-700 tracking-wide italic relative">
        {t("sendMessage")}
      </p>
    <div className="mt-8 p-4 border border-gray-300 rounded-lg">
      <div className="flex justify-between mb-4">
        <div className="flex-1 mr-2">
          <label className="block mb-2 font-semibold">{t("from")}</label>
          <select
            value={fromNumber}
            onChange={(e) => setFromNumber(e.target.value)}
            className="w-full text-black border border-gray-300 p-2 rounded"
          >
            <option value="" disabled>
              {fromPhones.length ? t("selectPhoneNumber") : t("noPhones")}
            </option>
            {fromPhones.map((phone) => (
              <option key={phone} value={phone}>
                {phone}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 mx-2">
          <label className="block mb-2 font-semibold">{t("to")}</label>
          <select
            multiple
            size={toPhones?.length || 5}
            value={toNumbers}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, (option) => option.value);
              setToNumbers(values);
            }}
            className="w-full text-black border border-gray-300 p-2 rounded"
            disabled={selectedGroups.length > 0} // Disable dropdown if groups are selected
          >
            <option value="ALL" onClick={handleSelectAllToggle}>
              {selectAll ? t("unselectAll") : t("selectAll")}
            </option>
            {toPhones?.length ? (
              toPhones.map((phone) => (
                <option key={phone} value={phone}>
                  {phone}
                </option>
              ))
            ) : (
              <option disabled>{t("noPhones")}</option>
            )}
          </select>
          <div className="mt-1 text-gray-400 italic">{`${toNumbers?.length || 0} ${t("numbersSelected")}`}</div>
        </div>
      </div>

      <div className="mb-6">
        {groups.length > 0 && <h3 className="text-lg font-semibold">{t("sendToTheseGroups")}</h3>}
        <div className="flex flex-wrap gap-4 mt-2">
          {groups.map((group) => (
            <label key={group} className="flex items-center space-x-2 gap-1">
              <input
                type="checkbox"
                checked={selectedGroups.includes(group)}
                onChange={() => toggleGroupSelection(group)}
                className="form-checkbox"
              />
              {group}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
          <label className="block font-semibold mb-2">{t("mediaAttachment")}</label>
          <input
            type="file"
            accept="image/*,video/*,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                setMediaAttachment(file);
                setIsMediaPreviewVisible(true);
              } else {
                setMediaAttachment(null);
                setIsMediaPreviewVisible(false);
              }
            }}
            className="w-full border border-gray-300 p-2 rounded"
          />
          <p className="text-gray-500 italic">{t("supportedFileTypes")}</p>
        </div>

      <div className="mb-2">
        <label className="block mb-2 font-semibold">{t("message")}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-40 text-black border border-gray-300 rounded"
          placeholder={t("enterYourMessageHere")}
        />
        <i className="text-black">{`*${t("includeNameToPersonalizeMessages")} ${t("exampleMessage")}`}</i>
        <div className="flex gap-2 my-4">
        <button
          onClick={openTemplateModal}
          className="px-5 py-3 mx-auto bg-purple-700 hover:bg-purple-800 text-white rounded-full"
        >
          {t("loadTemplate")}⬆️
        </button>

        <button
  onClick={() => {
    if (message) {
      setIsSaveModalOpen(true);
    } else {
      toast.error(t("pleaseWriteAMessageToSaveAsATemplate"));
    }
  }}
  className="px-5 py-3 mx-auto bg-yellow-600 hover:bg-yellow-700 text-white rounded-full"
>
            {t("saveAsTemplate")}💾
        </button>
        </div>
      </div>

      <div className="relative w-72 mx-auto">
        {/* Phone Frame Image */}
        <img
          src="/static/phone-frame.png"
          alt="Phone Frame"
          className="w-full h-auto object-contain"
        />

        {/* Phone Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 
          For example, make the phone 'screen' occupy 
          80% width and 70% height of the phone frame 
        */}
          <div className="relative w-[75%] h-[80%] bg-white rounded-2xl shadow-lg p-4 overflow-auto">
            {isMediaPreviewVisible && mediaAttachment ? (
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs p-3">
                    U
                  </div>
                  <div className="w-40 h-24 bg-blue-100 border border-blue-300 rounded-lg flex items-center justify-center text-blue-800 text-sm">
                    {t("mediaPreview")}
                  </div>
                </div>
                <div className="mt-4 bg-green-700 text-white rounded-lg p-2 w-full break-words">
                  {message || t("typeACaptionForYourMedia")}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs p-3">
                  U
                </div>
                <div className="bg-green-800 text-white rounded-lg p-2 w-full max-w-[10rem] break-words">
                  {message || t("typeAMessageToSeeItHere")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        {isScheduleModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
      <h2 className="text-xl font-semibold mb-4">{t("scheduleMessage")}</h2>
      
      <label className="block mb-2 font-semibold">{t("selectTime")}</label>
      <input
        type="datetime-local"
        value={scheduleTime}
        onChange={(e) => setScheduleTime(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-4"
      />

      <label className="block mb-2 font-semibold">{t("selectTimeZone")}</label>
      <select
        value={timeZone}
        onChange={(e) => setTimeZone(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-4"
      >
        <option key={'choose'} value={'choose'}>
            {t("chooseTimeZone")}
            </option>
        {Array.from({ length: 23 }, (_, i) => {
          const offset = -11 + i; // Calculate GMT offset
          const label = `GMT${offset >= 0 ? `+${offset < 10 ? '0' : ''}${offset}` : `${offset > -10 ? '-0' : ''}${Math.abs(offset)}`}:00`;
          return (
            <option key={offset} value={label}>
              {label}
            </option>
          );
        })}
      </select>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setIsScheduleModalOpen(false)}
          className="px-4 py-2 bg-gray-300 rounded-full"
        >
          {t("cancel")}
        </button>
        <button
          onClick={handleScheduleMessage}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full"
        >
          {t("schedule")}
        </button>

      </div>
    </div>
  </div>
)}

{isTemplateModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
      <h2 className="text-xl font-semibold mb-4">Select a Message Template</h2>

      <div className="mb-4">
        <select
          onChange={(e) => {
            const selectedTemplate = templates.find(
              (template) => template.template_name === e.target.value
            );
            if (selectedTemplate) {
              handleLoadTemplate(selectedTemplate.message);
              setIsTemplateModalOpen(false); // Close modal after selecting
            }
          }}
          className="w-full text-black border border-gray-300 p-2 rounded"
        >
          <option value="">Select a template</option>
          {templates.map((template) => (
            <option key={template.template_name} value={template.template_name}>
              {template.template_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setIsTemplateModalOpen(false)}
          className="px-4 py-2 bg-gray-300 rounded-full"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{isSaveModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
      <h2 className="text-xl font-semibold mb-4">Save Message as Template</h2>

      <p className="italic mb-4">Message to save: {message}</p>
      
      <label className="block mb-2 font-semibold">Template Name</label>
      <input
        type="text"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-4"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setIsSaveModalOpen(false)}
          className="px-4 py-2 bg-gray-300 rounded-full"
        >
          Cancel
        </button>
        <button
          onClick={saveMessageToTemplate}
          className="px-4 py-2 bg-yellow-600 text-white rounded-full"
        >
          Save
        </button>
      </div>
    </div>
    
  </div>
)}





      <div className="flex justify-between gap-2">
        <button
          onClick={handleSendMessage}
          className="px-5 py-3 mx-auto bg-green-600 hover:bg-green-700 text-white rounded-full"
        >
          {t("sendMessage")}📩
        </button>
        <button
          onClick={() => {
            if (fromNumber && (toNumbers.length > 0 || selectedGroups.length > 0) && message) {
              setIsScheduleModalOpen(true)
            } else {
              toast.error("Please fill in all fields.");
            }
          }}
          className="px-5 py-3 mx-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full"
        >
          {t("scheduleMessage")}⏱️
        </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageForm;
