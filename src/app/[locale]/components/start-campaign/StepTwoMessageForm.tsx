"use client";

import axios from "axios";
import { set } from "lodash";
import { UseSessionOptions } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { use, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';


interface Props {
  leads: { name: string; phone_number: string }[]; // Leads passed from state as recipients
  goBack: () => void; // Function to go back to the previous step
  goForwardStartCampaign: () => void; // Function to go forward to the next step
  goForwardScheduleCampaign: () => void; // Function to go forward to the next step
  fromNumbers: string[];
  waGroupNumber: string;
}

const StepTwoMessageForm: React.FC<Props> = ({ leads, goBack, goForwardStartCampaign, goForwardScheduleCampaign, fromNumbers, waGroupNumber }) => {
  const [fromNumber, setFromNumber] = useState(waGroupNumber);
  const [message, setMessage] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [mediaAttachment, setMediaAttachment] = useState<File | null>(null);
  const [isMediaPreviewVisible, setIsMediaPreviewVisible] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [isBatchingEnabled, setIsBatchingEnabled] = useState(false);
  const [batchSize, setBatchSize] = useState(1);
  const [batchInterval, setBatchInterval] = useState("");
  const [batchIntervalUnit, setBatchIntervalUnit] = useState("minutes");
  const [batchIntervalValue, setBatchIntervalValue] = useState(0);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<{ template_name: string; message: string }[]>([]);
  const [leadsWithReadStatuses, setLeadsWithReadStatuses] = useState<{ name: string; phone_number: string; wasLastMessageRead: boolean }[]>([]);
  const [checkedFinalLeads, setCheckedFinalLeads] = useState<{ name: string; phone_number: string }[]>([]);

  const [doNotDistributeToWhoHaveNotReadLastMessage, setDoNotDistributeToWhoHaveNotReadLastMessage] = useState(false);
  const [doNotDistributeForRecent, setDoNotDistributeForRecent] = useState(false);
  const [doNotDistributeForRecentUnit, setDoNotDistributeForRecentUnit] = useState("hours");
  const [doNotDistributeForRecentSize, setDoNotDistributeForRecentSize] = useState(0);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"start" | "schedule">("start");

  console.log("leads:", JSON.stringify(leads));
  console.log("leadsWithReadStatuses:", JSON.stringify(leadsWithReadStatuses));

  useEffect(() => {
    console.log(JSON.stringify(leadsWithReadStatuses));
  }, [leadsWithReadStatuses]);


  useEffect(() => {
      async function fetchLeadsStatusesComplete() {
      
        
        const phone_numbers = [];

        if (waGroupNumber) {
          phone_numbers.push(waGroupNumber)
        } else {
          for (let fromNumber of fromNumbers) {
            phone_numbers.push(fromNumber)
          }
        }

        const statusLeadsLists: any[] = [];
        
        await Promise.all(
          phone_numbers.map(async (phone_number) => {
              const results = await Promise.all(
                  leads.map(async (lead) => {

                    const response = await fetch("/api/whatsapp-part/get-particular-chat", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        phoneNumber: phone_number,
                        chatId: lead.phone_number,
                      }),
                    });
                    const { wasLastMessageRead } = await response.json();

                      return { ...lead, wasLastMessageRead };
                  
                  
                    })
              );
  
              statusLeadsLists.push(...results);
          })
      );

      // Merge and deduplicate the list
      const mergedList = statusLeadsLists.reduce((acc, current) => {
        const existingEntry = acc.find((item: any) => item.phone_number === current.phone_number);

        if (existingEntry) {
          // Update wasLastMessageRead to true if any entry has it as true
          existingEntry.wasLastMessageRead = existingEntry.wasLastMessageRead || current.wasLastMessageRead;
        } else {
          // Add new entry if not already present
          acc.push(current);
        }

        return acc;
      }, [] as any[]);
        
      setLeadsWithReadStatuses(mergedList);
    
    }
    fetchLeadsStatusesComplete();
    console.log("leadsWithReadStatuses:", JSON.stringify(leadsWithReadStatuses));
  }, []);
  
  
  const batchIntervalUnits = ["minutes", "hours", "days", "weeks"];

  const timeZones = [
    "GMT-12:00",
    "GMT-11:00",
    "GMT-10:00",
    "GMT-09:00",
    "GMT-08:00",
    "GMT-07:00",
    "GMT-06:00",
    "GMT-05:00",
    "GMT-04:00",
    "GMT-03:00",
    "GMT-02:00",
    "GMT-01:00",
    "GMT+00:00",
    "GMT+01:00",
    "GMT+02:00",
    "GMT+03:00",
    "GMT+04:00",
    "GMT+05:00",
    "GMT+06:00",
    "GMT+07:00",
    "GMT+08:00",
    "GMT+09:00",
    "GMT+10:00",
    "GMT+11:00",
    "GMT+12:00",
  ];

  const t = useTranslations("startCampaign");

  useEffect(() => {
    console.log("Checked final leads:", JSON.stringify(checkedFinalLeads));
  }, [checkedFinalLeads]);

  const openConfirmationModal = (action: "start" | "schedule") => {
    setIsScheduleModalOpen(false);

    if (!doNotDistributeToWhoHaveNotReadLastMessage) {
      setCheckedFinalLeads(
          leadsWithReadStatuses.map((lead) => ({
              name: lead.name,
              phone_number: lead.phone_number,
          }))
      );
  } else {
      setCheckedFinalLeads(
          leadsWithReadStatuses
              .filter(
                  (lead) =>
                      lead.wasLastMessageRead !== false &&
                      lead.wasLastMessageRead !== undefined
              )
              .map((lead) => ({
                  name: lead.name,
                  phone_number: lead.phone_number,
              }))
      );
  }
  
    
    if (campaignName && fromNumber && message && leads.length > 0) {
      setConfirmAction(action);
      setIsConfirmModalOpen(true);
    } else {
      toast.error(t("pleaseFillInAllFields"));
    }
  };

  // Handle checkbox change
  const handleFinalScreenCheckboxChange = (lead: any, isChecked: any) => {
    console.log("Lead in handle checkbox change final:", lead, "and isChecked:", isChecked);
    
    setCheckedFinalLeads((prev: any) => {
      if (isChecked) {
        // Add lead to the list
        return [...prev, { name: lead.name, phone_number: lead.phone_number }];
      } else {
        // Remove lead from the list
        return prev.filter((l: any) => l.phone_number !== lead.phone_number);
      }
    });
  };

  const handleOpenScheduleConfirmModal = () => {
    if (campaignName && fromNumber && message && leads.length > 0 && scheduleTime && timeZone) {
      setIsScheduleModalOpen(false);
      setConfirmAction("schedule");
      setIsConfirmModalOpen(true);
    } else {
      toast.error(t("pleaseFillInAllFields"));
    }
  }

  const handleStartCampaign = async () => {
    if (campaignName && fromNumber && message && leads.length > 0) {
      const formData = new FormData();
      formData.append("campaignName", campaignName);
      formData.append("fromNumber", fromNumber);
      formData.append("message", message);
      
      formData.append("leads", JSON.stringify(checkedFinalLeads));
          
      formData.append("batchSize", batchSize.toString());
      formData.append("batchIntervalValue", batchIntervalValue.toString());
      formData.append("batchIntervalUnit", batchIntervalUnit);
      
      formData.append("doNotDistributeToWhoHaveNotReadLastMessage", doNotDistributeToWhoHaveNotReadLastMessage.toString());
      formData.append("doNotDistributeForRecent", doNotDistributeForRecent.toString());
      formData.append("doNotDistributeForRecentUnit", doNotDistributeForRecentUnit.toString());
      formData.append("doNotDistributeForRecentSize", doNotDistributeForRecentSize.toString());

      
      const campaignId = campaignName.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().slice(-4);
      
      formData.append("campaignId", campaignId);

      if (mediaAttachment) {
        formData.append("media", mediaAttachment);
      }

      try {
        const response = await fetch("/api/campaign/create", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          toast.success(t("campaignStartedSuccessfully"));
          axios.post("/api/campaign/execute", {
            campaignId: campaignId
          });
          goForwardStartCampaign();
        } else {
          toast.error(t("failedToStartCampaign"));
        }
      } catch (error) {
        console.error("Error starting campaign:", error);
        toast.error(t("anErrorOccurredWhileStartingTheCampaign"));
      }
    } else {
      toast.error(t("pleaseFillInAllFields"));
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/message/get-templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.messageTemplates);
      } else {
        // toast.error(t("failedToFetchMessageTemplates"));
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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const saveMessageToTemplate = async () => {
    if (!templateName || !message) {
      toast.error(t("pleaseProvideATemplateNameAndMessage"));
      return;
    }
  
    const payload = {
      messageTemplates: [
        {
          id: templateName+"-"+uuidv4().slice(-4),
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

  const handleScheduleCampaign = async () => {
    if (campaignName && fromNumber && message && leads.length > 0 && scheduleTime && timeZone) {
      const formData = new FormData();
      formData.append("campaignName", campaignName);
      formData.append("fromNumber", fromNumber);
      formData.append("message", message);
      
      formData.append("leads", JSON.stringify(checkedFinalLeads));

      formData.append("scheduleTime", scheduleTime);
      formData.append("timeZone", timeZone);
      formData.append("batchSize", batchSize.toString());
      formData.append("batchIntervalValue", batchIntervalValue.toString());
      formData.append("batchIntervalUnit", batchIntervalUnit);

      formData.append("doNotDistributeToWhoHaveNotReadLastMessage", doNotDistributeToWhoHaveNotReadLastMessage.toString());
      formData.append("doNotDistributeForRecent", doNotDistributeForRecent.toString());
      formData.append("doNotDistributeForRecentUnit", doNotDistributeForRecentUnit.toString());
      formData.append("doNotDistributeForRecentValue", doNotDistributeForRecentSize.toString());
      
      const campaignId = campaignName.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().slice(-4);
      formData.append("campaignId", campaignId);

      if (mediaAttachment) {
        formData.append("media", mediaAttachment);
      }

      try {
        const response = await fetch("/api/campaign/schedule", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          toast.success(t("campaignScheduledSuccessfully"));
          setIsScheduleModalOpen(false);
          goForwardScheduleCampaign();
        } else {
          toast.error(t("failedToScheduleCampaign"));
        }
      } catch (error) {
        console.error("Error scheduling campaign:", error);
        toast.error(t("anErrorOccurredWhileSchedulingTheCampaign"));
      }
    } else {
      toast.error(t("pleaseFillInAllFields"));
    }
  };

  return (
    <div className="flex gap-8 mt-8 p-4 rounded-lg">
      {/* Phone Frame on the Left */}
      <div className="relative flex flex-col justify-center items-center w-72" style={{ height: '48vh' }}>
        <img
          src="/static/phone-frame.png" // Replace with the actual path to your phone frame image
          alt="Phone Frame"
          className="w-full object-contain flex-shrink-0"
        />
        {/* Phone Content */}
        <div className="absolute w-56 h-[48vh] bg-white rounded-2xl shadow-lg p-4">
          {isMediaPreviewVisible && mediaAttachment ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-40 h-24 bg-blue-100 border border-blue-300 rounded-lg flex items-center justify-center text-blue-800 text-sm">
                {t("mediaPreview")}
              </div>
              <div className="mt-4 bg-green-700 text-white rounded-lg p-2 w-full break-words">
                {message || "Type a caption for your media..."}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs p-3">
                U
              </div>
              <div className="bg-green-700 text-white rounded-lg p-2 w-full max-w-[10rem] break-words">
                {message || t("typeAMessageToSeeItHere")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Fields on the Right */}
      <div className="flex-1">
        <div className="mb-4">

          {/* Campaign Name */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">{t("campaignName")}</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder={t("enterCampaignName")}
            />
          </div>

          <div className="mb-4">
  <label className="block font-semibold mb-2">{t("from")}</label>
  <select
    value={fromNumber}
    onChange={(e) => setFromNumber(e.target.value)}
    className="w-full border border-gray-300 p-2 rounded"
  >
    {waGroupNumber && waGroupNumber.trim() !== "" ? (
      // Single option with waGroupNumber
      <option value={waGroupNumber}>
        {waGroupNumber}
      </option>
    ) : (
      // List of all phone numbers if waGroupNumber is not provided
      <>
        <option value="" disabled>
          {t("selectAPhoneNumber")}
        </option>
        {fromNumbers.map((number) => (
          <option key={number} value={number}>
            {number}
          </option>
        ))}
      </>
    )}
  </select>
</div>

        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">{t("message")}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-40 border border-gray-300 rounded p-2"
            placeholder={t("enterYourMessageHere")}
          />
          <i className="text-gray-500">
            {`*${t("includeNameToPersonalizeMessages")}`}<br/>
            {t("exampleMessage")}
          </i>
        </div>

        <label className="block font-semibold mb-2">{t("doNotDistributeToWhoHaveNotReadLastMessage")}</label>
        <input
        type="checkbox"
        onChange={(e) => setDoNotDistributeToWhoHaveNotReadLastMessage(e.target.checked)}
        >
        </input>

        <label className="block font-semibold mb-2">{t("doNotDistributeToRecentSends")}</label>
        <input
        type="checkbox"
        onChange={(e) => setDoNotDistributeForRecent(e.target.checked)}
        >
        </input>

        <label className="block font-semibold mb-2">{t("timeLimit")}</label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            onChange={(e) => setDoNotDistributeForRecentSize(Number(e.target.value))} 
            className="border border-gray-300 p-2 rounded"
            disabled={!doNotDistributeForRecent}
          />
          <select 
            value={doNotDistributeForRecentUnit} 
            onChange={(e) => setDoNotDistributeForRecentUnit(e.target.value)} 
            className="w-full border border-gray-300 p-2 rounded"
            disabled={!doNotDistributeForRecent}
          >
            <option value="hours">{t("hours")}</option>
            <option value="days">{t("days")}</option>
            <option value="weeks">{t("weeks")}</option>
            <option value="months">{t("months")}</option>
          </select>
        </div>


        <div className="flex gap-2 my-4">
        <button
          onClick={openTemplateModal}
          className="px-5 py-3 mx-auto bg-purple-700 hover:bg-purple-800 text-white rounded-full"
        >
          {t("loadTemplate")}
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
          {t("saveAsTemplate")}
        </button>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">{t("mediaAttachment")}</label>
          <input
            type="file"
            accept="image/*,.pdf"
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
            <p className="text-gray-500 italic">*{t("supportedFileTypes")}</p>
        </div>
        
        {/* Add this section inside the return statement */}
<div className="mb-4">
  <div
    className="cursor-pointer text-purple-600 hover:underline mb-2 font-semibold"
    onClick={() => setIsBatchingEnabled((prev) => !prev)}
  >
    {isBatchingEnabled ? t("hideBatchingOptions") : t("showBatchingOptions")}
  </div>
  {isBatchingEnabled && (
    <div className="mt-4 p-4 border border-gray-300 rounded">
      <label className="block mb-2 font-semibold">{t("batchSize")}</label>
      <input
        type="number"
        min="1"
        value={batchSize}
        onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
        className="w-full mb-4 border border-gray-300 p-2 rounded"
        placeholder={t("enterNumberOfMessagesPerBatch")}
      />
      <label className="block mb-2 font-semibold">{t("batchInterval")}</label>
      <div className="flex gap-4">
        <input
          type="number"
          min="1"
          value={batchIntervalValue}
          onChange={(e) => setBatchIntervalValue(parseInt(e.target.value, 10))}
          className="flex-1 border border-gray-300 p-2 rounded"
          placeholder={t("enterIntervalValue")}
        />
        <select
          value={batchIntervalUnit}
          onChange={(e) => setBatchIntervalUnit(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded"
        >
          <option value="" disabled>
            {t("selectIntervalUnit")}
          </option>
          {batchIntervalUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>
      <p className="text-gray-500 mt-2">
        {t("example")}: "5 minutes", "2 hours", "1 day", etc.
      </p>
    </div>
  )}
</div>
        <div className="flex justify-between gap-4">
          <button
            onClick={goBack}
            className="px-5 py-3 bg-gray-300 text-black rounded-full mx-auto"
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline-block ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          </button>
          <button
            onClick={() => openConfirmationModal("start")}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full mx-auto"
          >
            {t("startCampaign")}
          </button>
          <button
            onClick={() => {
              if (campaignName && fromNumber && message && leads.length > 0) {
                setIsScheduleModalOpen(true)
              } else {
                toast.error(t("pleaseFillInAllFields"));
              }
            }}
            className="px-5 py-3 bg-blue-600 hover:bg-purple-700 text-white rounded-full mx-auto"
          >
            {t("scheduleCampaign")}
          </button>
        </div>
      </div>

{isTemplateModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
      <h2 className="text-xl font-semibold mb-4">{t("selectAMessageTemplate")}</h2>

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
          <option value="">{t("selectATemplate")}</option>
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
          {t("cancel")}
        </button>
      </div>
    </div>
  </div>
)}

{isSaveModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
      <h2 className="text-xl font-semibold mb-4">Save Message as Template</h2>

      <p className="italic mb-4">{t("messageToSave")}: {message}</p>
      
      <label className="block mb-2 font-semibold">{t("templateName")}</label>
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
          {t("cancel")}
        </button>
        <button
          onClick={saveMessageToTemplate}
          className="px-4 py-2 bg-yellow-600 text-white rounded-full"
        >
          {t("save")}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">{t("scheduleCampaign")}</h3>
            <label className="block mb-2 font-semibold">{t("scheduleTime")}</label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full mb-4 border border-gray-300 p-2 rounded"
              step="300"
            />
            <label className="block mb-2 font-semibold">{t("timeZone")}</label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full mb-4 border border-gray-300 p-2 rounded"
            >
              <option value="" disabled>
                {t("selectTimeZone")}
              </option>
              {timeZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-5 py-3 bg-gray-300 text-black rounded-full"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleOpenScheduleConfirmModal}
                className="px-5 py-3 bg-purple-500 text-white rounded-full"
              >
                {t("schedule")}
              </button>
            </div>
          </div>
        </div>
      )}

{/* Confirmation Modal */}
{isConfirmModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[100%] max-w-[977px]">
      <h2 className="text-xl font-semibold mb-4">
        {confirmAction === "start" ? t("confirmStartCampaign") : t("confirmScheduleCampaign")}
      </h2>
      
      <p className="mb-4">{t("leadsSelected")}:</p>
      <div className="mb-4 max-h-32 overflow-y-auto border p-2 rounded">
        <table className="w-full">
          <thead>
        <tr className="border-b">
          <th className="text-left p-2 w-1/3">Name</th>
          <th className="text-left p-2 w-1/3">Phone</th>
          <th className="text-left p-2 w-1/3">Message Preview</th>
        </tr>
          </thead>
          
          <tbody>
        {doNotDistributeToWhoHaveNotReadLastMessage ? ( leadsWithReadStatuses.map((lead, index) => (
          <tr key={index} className={`border-b ${lead.wasLastMessageRead === false || lead.wasLastMessageRead === undefined ? 'bg-gray-200' : ''}`}>
            <td className="p-2">
              <input 
                type="checkbox"
                checked={lead.wasLastMessageRead === false || lead.wasLastMessageRead === undefined ? false : checkedFinalLeads.some((l: any) => l.phone_number === lead.phone_number)}
                disabled={lead.wasLastMessageRead === false || lead.wasLastMessageRead === undefined}
                className="mr-2"
                onChange={(e) => handleFinalScreenCheckboxChange(lead, e.target.checked)}
                    />
              {lead.name}
            </td>
            <td className="p-2">{lead.phone_number.split("@")[0].length < 14 ? lead.phone_number : "group"}</td>
            <td className="p-2">{lead.phone_number.split("@")[0].length < 14 ? message.replace("{{name}}", lead.name) : message.replace("{{name}}", "")}</td>
          </tr>
        ))
      ) : (
          leadsWithReadStatuses.map((lead, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">
                <input 
                  type="checkbox"
                  checked={checkedFinalLeads.some((l: any) => l.phone_number === lead.phone_number)}
                  className="mr-2"
                  onChange={(e) => handleFinalScreenCheckboxChange(lead, e.target.checked)}
                      />
                {lead.name}
              </td>
              <td className="p-2">{lead.phone_number.split("@")[0].length < 14 ? lead.phone_number : "group"}</td>
              <td className="p-2">{lead.phone_number.split("@")[0].length < 14 ? message.replace("{{name}}", lead.name) : message.replace("{{name}}", "")}</td>
            </tr>
          )
        ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-4">
      {doNotDistributeToWhoHaveNotReadLastMessage && <p>*{t("greyLeadsHaveNotReadTheLastMessage")}</p>}
        
        <button
          onClick={() => setIsConfirmModalOpen(false)}
          className="px-4 py-2 bg-gray-300 rounded-full"
        >
          {t("cancel")}
        </button>
        <button
          onClick={() => {
            if (checkedFinalLeads.length !== 0) {
            setIsConfirmModalOpen(false);
            toast.info(t("settingUpCampaign"), {
              autoClose: 5000, // Toast will display for 5 seconds
            });
            confirmAction === "start" ? handleStartCampaign() : handleScheduleCampaign();
            } else {
              toast.error(t("pleaseSelectAtLeastOneLead"));
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-full"
        >
          {t("confirm")}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default StepTwoMessageForm;
