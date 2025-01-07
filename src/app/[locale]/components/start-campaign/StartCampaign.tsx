"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import StepTwoMessageForm from "./StepTwoMessageForm";
import UserCampaigns from "./UserCampaigns";
import { useLocale, useTranslations } from "next-intl";
import { set } from "lodash";

type Lead = { name: string; 
  phone_number: string; 
  source: string; 
  sent_messages: number; 
  groups: string[] };

const StartCampaign = () => {
  const t = useTranslations("startCampaign");
  

  const [step, setStep] = useState<number>(1);
  const [importMethod, setImportMethod] = useState<"csv" | "googleSheets" | "existingLeads" | "waGroups" | null>(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [nameColumn, setNameColumn] = useState("");
  const [phoneNumberColumn, setPhoneNumberColumn] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<{ name: string; phone_number: string }[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [fromNumbers, setFromNumbers] = useState<string[]>([]);
  const [campaignType, setCampaignType] = useState<"scheduled" | "now" | null>(null);
  const [isLoadingFromNumbers, setIsLoadingFromNumbers] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [thereAreNoLeads, setThereAreNoLeads] = useState(false);
  const [waGroups, setWaGroups] = useState<Record<string, Array<{ name: string; id: string }>>>(() => ({}));

  const [waGroupsSelectedPhone, setWaGroupsSelectedPhone] = useState("");

  const sendCampaign = async () => {
    const response = await axios.post("/api/campaign/create", {
      leads: selectedLeads,
    });
  }

  const currentLocale = useLocale();

  const filteredLeads = selectedGroups.length === 0 
  ? leads // Show all leads if no group is selected
  : leads?.filter((lead) => {
    let leadGroups = lead.groups || ["other"];
    return leadGroups.some((group) => selectedGroups.includes(group))
}
);

  
  const goForwardStartCampaign = () => {
    setStep(3);
    setCampaignType("now");
  }

  const goForwardScheduleCampaign = () => {
    setStep(3);
    setCampaignType("scheduled");
  }

  const resetStates = () => {
    setLeads([]);
    setHeaders([]);
    setNameColumn("");
    setPhoneNumberColumn("");
    setSelectedLeads([]);
    setSelectAll(false);
    setCsvFile(null);
    setSelectedGroups([]);
  };

  const toggleGroupSelection = (group: string) => {
    setSelectedGroups((prevSelectedGroups) => {
      // Determine the updated selected groups
      const updatedSelectedGroups = prevSelectedGroups.includes(group)
        ? prevSelectedGroups?.filter((g) => g !== group) // Remove if already selected
        : [...prevSelectedGroups, group]; // Add if not selected

      console.log("updatedSelectedGroups: ", updatedSelectedGroups);
      
        // Filter leads based on updated selected groups
      const filteredLeads =
        updatedSelectedGroups.length === 0
          ? leads // Show all leads if no group is selected
          : leads?.filter((lead) =>
            (lead.groups || ["other"]).some((group) =>
              updatedSelectedGroups.includes(group)
            )
          );

        console.log("filteredLeads: ", filteredLeads);

      // Update the selected leads with filtered data
      setSelectedLeads(
        filteredLeads.map((lead) => ({
          name: lead.name,
          phone_number: lead.phone_number,
        }))
      );

      // Return the updated selected groups for state update
      return updatedSelectedGroups;
    });
  };

  
  

  const fetchFromNumbersAndGroups = async () => {
    const response = await axios.get("/api/phone-numbers");
    const fromNumbersList = response.data?.filter((number: { active: boolean }) => number.active).map((number: { phoneNumber: string }) => number.phoneNumber);
    
    console.log(`fromNumbersList: ${JSON.stringify(fromNumbersList)}`);

    const response_ = await axios.get("/api/user/find-user");
    const user = await response_.data;

    setGroups(user.leadGroups || []);

    setFromNumbers(fromNumbersList || []);
    setIsLoadingFromNumbers(false);
    setWaGroupsSelectedPhone(fromNumbersList[0]);
    console.log("Set isLoadingFromNumbers to false");
  };

  useEffect(() => {
    fetchFromNumbersAndGroups();
  }, []);

  const handleImportMethodChange = (method: "csv" | "googleSheets" | "existingLeads" | "waGroups") => {
    resetStates();
    setImportMethod(method);
    if (method === "existingLeads") {
      fetchExistingLeads();
    }
    if (method === "waGroups") {
      fetchWaGroups();
    } else {
      setWaGroupsSelectedPhone("");
    }
  };

  const fetchHeaders = async () => {
    try {
      const response = await axios.post("/api/gsheets/get-headers", { url: googleSheetUrl });
      setHeaders(response.data.headers);
      toast.success(t("headersFetchedSuccessfully"));
    } catch (error) {
      console.error("Error fetching headers:", error);
      toast.error(t("failedToFetchHeadersFromGoogleSheets"));
    }
  };

  const fetchCsvHeaders = async () => {
    if (!csvFile) {
      toast.error(t("pleaseUploadACSVFile"));
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await axios.post("/api/leads/csv-file-upload/get-headers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setHeaders(response.data.headers);
      toast.success(t("headersFetchedSuccessfully"));
    } catch (error) {
      console.error("Error fetching CSV headers:", error);
      toast.error(t("failedToFetchHeadersFromCSVFile"));
    }
  };

  const fetchRows = async () => {
    try {
      if (!nameColumn || !phoneNumberColumn) {
        toast.error(t("pleaseSelectBothNameAndPhoneNumberColumns"));
        return;
      }

      if (importMethod === "googleSheets") {
        const response = await axios.post("/api/gsheets/get-leads", {
          url: googleSheetUrl,
          nameColumn,
          phoneNumberColumn,
        });
        setLeads(response.data.rows.map((row: any) => ({ ...row, source: "Google Sheets", sent_messages: 0 })));
      } else if (importMethod === "csv") {
        const formData = new FormData();
        formData.append("file", csvFile as File);
        formData.append("nameColumn", nameColumn);
        formData.append("phoneNumberColumn", phoneNumberColumn);

        const response = await axios.post("/api/leads/csv-file-upload/get-leads", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log(`response.data.rows: ${JSON.stringify(response.data.rows)}`);
        setLeads(response.data.rows.slice(0,100).map((row: any) => ({ ...row, source: "CSV", sent_messages: 0 })));
      }

      toast.success(t("leadsFetchedSuccessfully"));
    } catch (error) {
      console.error("Error fetching rows:", error);
      toast.error(t("failedToFetchRows"));
    }
  };

  const fetchExistingLeads = async () => {
    try {
      const response = await axios.get("/api/leads/retrieve");
      setLeads(response.data.leads);
      setThereAreNoLeads(response.data.leads.length === 0 || typeof response.data.leads === "undefined");
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error(t("failedToLoadLeads"));
    }
  };

  const fetchWaGroups = async () => {

    const group_contacts_total: { [key: string]: Array<{ name: string; id: string }> } = {};

    for (const fromNumber of fromNumbers) {

    console.log(`fromNumber: ${fromNumber}`);
    const { group_contacts } = await fetch("/api/whatsapp-part/get-chats-of-number", {
      method: "POST",
      body: JSON.stringify({ phoneNumber: fromNumber }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    const group_contacts_minimized = group_contacts
    .map((group: any) => { return { name: group?.name, id: group?.id } })
    ?.filter((group: any) => 
      group.name !== "All Contacts" && 
      !(group.name.length > 14 && /^\d+$/.test(group.name))
  );
    
     group_contacts_total[fromNumber] = group_contacts_minimized;

     
    }

    console.log(`group_contacts_total: ${JSON.stringify(group_contacts_total)}`);

    setWaGroups(group_contacts_total);

    console.log(`waGroups: ${JSON.stringify(waGroups)}`);
  }

  useEffect(() => {
      fetchWaGroups();
  }, []);

  useEffect(() => {
    fetchWaGroups();
}, [importMethod]);

  useEffect(() => {
    if (selectedGroups.length === 0) {
      setSelectedLeads([]); // Clear all selected leads
      setSelectAll(false);  // Uncheck "Select All"
    }
  }, [selectedGroups]);

  /*
  useEffect(() => {
    if (importMethod === "waGroups") {
      fetchWaGroups();
    }
  }, [importMethod]);
  */

  // Handle checkbox change
  const handleWaGroupCheckboxChange = (groupName: string, groupId: string) => {
    const groupToAdd = { name: groupName, phone_number: groupId };
    
    console.log(`groupToAdd: ${JSON.stringify(groupToAdd)}`);
    
    setSelectedLeads((prevSelectedLeads) => {
      // Check if the lead is already selected
      const isSelected = prevSelectedLeads.some((lead) => lead.phone_number === groupId);
      
      if (isSelected) {
        console.log(leads);
        // Remove the lead if already selected
        return prevSelectedLeads?.filter((lead) => lead.phone_number !== groupId);
      } else {
        console.log(leads);
        // Add the lead to the selectedLeads array
        return [...prevSelectedLeads, groupToAdd];
      }
      });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads([]); // Clear selection
    } else {
      if (importMethod !== "waGroups") {
        setSelectedLeads(filteredLeads.map((lead) => ({ name: lead.name, phone_number: lead.phone_number }))); // Select all leads
      } else {
        setSelectedLeads(waGroups[waGroupsSelectedPhone]?.map((group) => ({ name: group.name, phone_number: group.id })) || []); // Select all leads
      }
    }
    setSelectAll(!selectAll);
  };

  const toggleLeadSelection = (phoneNumber: string) => {
    setSelectedLeads((prevSelectedLeads) => {
      // Check if the lead is already selected
      const isSelected = prevSelectedLeads.some((lead) => lead.phone_number === phoneNumber);
      
      if (isSelected) {
        // Remove the lead if already selected
        return prevSelectedLeads?.filter((lead) => lead.phone_number !== phoneNumber);
      } else {
        // Find the lead in the original leads array
        const leadToAdd = leads.find((lead) => lead.phone_number === phoneNumber);
        if (leadToAdd) {
          // Add the lead to the selectedLeads array
          return [...prevSelectedLeads, leadToAdd];
        }
        return prevSelectedLeads; // Return previous state if lead is not found
      }
    });
  };

  const handleWaGroupsPhoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    resetStates();
    setWaGroupsSelectedPhone(e.target.value);
  }
  

  const renderStep = () => {
    if (step === 1) {
      return (
        <div>
          <h2 className="text-2xl font-semibold text-center">{t("step1")}: {t("importLeads")}</h2>
          <p className="text-center text-gray-600 mt-2">
            {t("chooseHowYouWantToImportYourLeadsForTheCampaign")}
          </p>
          <div className="grid grid-cols-2 gap-8 mt-8">
  <div
    className={`cursor-pointer text-center border rounded-lg p-4 w-48 ${
      importMethod === "csv" ? "bg-blue-100 border-blue-500" : "bg-gray-50"
    } hover:shadow-lg transition`}
    onClick={() => handleImportMethodChange("csv")}
  >
    <img
      src="/static/excel-logo.png"
      alt="CSV/Excel Icon"
      className="w-16 h-20 mx-auto mb-4"
    />
    <p className="font-medium text-black">{t("uploadCSVExcel")}</p>
  </div>

  <div
    onClick={() => handleImportMethodChange("googleSheets")}
    className={`cursor-pointer text-center border rounded-lg p-4 w-48 ${
      importMethod === "googleSheets" ? "bg-blue-100 border-blue-500" : "bg-gray-50"
    } hover:shadow-lg transition`}
  >
    <img
      src="/static/Google_Sheets_Logo.png"
      alt="Google Sheets Icon"
      className="w-16 h-20 mx-auto mb-4"
    />
    <p className="font-medium text-black">{t("googleSheetsLink")}</p>
  </div>

  <div
    onClick={() => handleImportMethodChange("existingLeads")}
    className={`cursor-pointer text-center border rounded-lg p-4 w-48 ${
      importMethod === "existingLeads" ? "bg-blue-100 border-blue-500" : "bg-gray-50"
    } hover:shadow-lg transition`}
  >
    <img
      src="/static/leads-icon.png"
      alt="Existing Leads Icon"
      className="w-20 h-20 mx-auto mb-4"
    />
    <p className="font-medium text-black">{t("existingLeads")}</p>
  </div>

  <div
    onClick={() => handleImportMethodChange("waGroups")}
    className={`cursor-pointer text-center border rounded-lg p-4 w-48 ${
      importMethod === "waGroups" ? "bg-blue-100 border-blue-500" : "bg-gray-50"
    } hover:shadow-lg transition`}
  >
    <img
      src="/WhatsAppLogo.png"
      alt="WhatsApp Groups Icon"
      className="w-20 h-20 mx-auto mb-4"
    />
    <p className="font-medium text-black">{t("waGroups")}</p>
  </div>
</div>

          {importMethod === "csv" && (
            <div className="mt-6">
              <label className="block text-gray-700 font-medium mb-2">{t("uploadCSVFile")}:</label>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full border p-2 rounded"
              />
              <button
                onClick={fetchCsvHeaders}
                className="mt-4 px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition mx-auto"
              >
                {t("fetchHeaders")}
              </button>
            </div>
          )}

          {importMethod === "googleSheets" && (
            <div className="mt-6">
              <label className="block text-gray-700 font-medium mb-2">{t("googleSheetsURL")}:</label>
              <input
                type="text"
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder={t("enterGoogleSheetsURL")}
              />
              <button
                onClick={fetchHeaders}
                className="mt-4 px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition mx-auto"
              >
                {t("fetchHeaders")}
              </button>
            </div>
          )}

          {(importMethod === "csv" || importMethod === "googleSheets") && headers.length > 0 && (
            <div className="mt-4">
              <label className="block text-gray-700 font-medium mb-2">{t("selectNameColumn")}:</label>
              <select
                value={nameColumn}
                onChange={(e) => setNameColumn(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">{t("selectAColumn")}</option>
                {headers.map((header, index) => (
                  <option key={index} value={header}>
                    {header}
                  </option>
                ))}
              </select>
              <label className="block text-gray-700 font-medium mt-4 mb-2">{t("selectPhoneNumberColumn")}:</label>
              <select
                value={phoneNumberColumn}
                onChange={(e) => setPhoneNumberColumn(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">{t("selectAColumn")}</option>
                {headers.map((header, index) => (
                  <option key={index} value={header}>
                    {header}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchRows}
                className="mt-4 px-5 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition mx-auto"
              >
                {t("fetchRows")}
              </button>
            </div>
          )}

        {importMethod === "waGroups" && (
            <div className="mt-6 gap-4">
              
            


            <div>
      {/* Dropdown for Selecting Phone Number */}
      <div className="mb-4">
        <label htmlFor="phone-number-select" className="text-gray-500 font-medium mb-2 block">
          {t("selectPhoneNumber")}:
        </label>
        <select
          id="phone-number-select"
          className="w-full border border-gray-300 p-2 rounded"
          value={waGroupsSelectedPhone || ""}
          onChange={handleWaGroupsPhoneChange}
        >
          {fromNumbers.map((phoneNumber, index) => {
            return (
              <option key={index} value={phoneNumber}>
                {phoneNumber}
              </option>
            );
          })}
        </select>
      </div>

      {/* Render Groups for Selected Phone Number */}
      <div>
        <h3 className="text-gray-500 text-xl font-semibold mb-4">
          {waGroupsSelectedPhone} Groups
        </h3>
        <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
              />
              <p className="ml-2">{t("selectAll")}</p>
            </div>
        {waGroups ? (waGroups[waGroupsSelectedPhone]?.map((group: any, groupIndex) => (
          
          
          
          <div
            key={groupIndex}
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md mb-2 transition"
          >
            {/* Left Section with Checkbox and Profile Icon */}
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedLeads.some(
                  (selectedLead) => selectedLead.phone_number === group.id
                )}
                className="form-checkbox w-5 h-5 text-blue-500 bg-gray-600 rounded"
                onChange={() =>
                  handleWaGroupCheckboxChange(group.name, group.id)
                }
              />
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white text-xl">
                <span>{group.name[0]}</span>
              </div>

              {/* Group Name */}
              <p className="text-white text-lg font-medium">{group.name}</p>
            </div>
          </div>
        ))) : (
          <p className="text-gray-500">{t("waitABitGroupsWillPopUpIfTheyExist")}</p>
        )
      }
      </div>
    </div>



            </div>
          )}

{leads?.length > 0 && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold mb-4">{t("importedLeads")}</h3>
    <div className="flex items-center mb-2">
      <input
        type="checkbox"
        checked={selectAll}
        onChange={toggleSelectAll}
      />
      <p className="ml-2">{t("selectAll")}</p>
    </div>
    
    <div className="mt-4">
    <h3 className="text-lg font-semibold mb-2">{t("filterByGroups")}:</h3>
<div className="flex flex-wrap gap-4 mb-4">
  {groups.map((group, index) => (
    <label key={index} className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={selectedGroups.includes(group)}
        onChange={() => toggleGroupSelection(group)}
        className="form-checkbox"
      />
      <span>{group === "all" ? "All Groups" : group}</span>
    </label>
  ))}
</div>

<table className="w-full text-left border">
  <thead>
    <tr className="bg-gray-100">
      <th className="p-2 border"></th>
      <th className="p-2 border">{t("name")}</th>
      <th className="p-2 border">{t("phoneNumber")}</th>
      {importMethod === "existingLeads" && (
        <>
          <th className="p-2 border">{t("source")}</th>
          <th className="p-2 border">{t("group")}</th>
          <th className="p-2 border">{t("sentMessages")}</th>
        </>
      )}
    </tr>
  </thead>
  <tbody>
    {filteredLeads.map((lead, index) => (
      <tr
        key={index}
        className="cursor-pointer hover:bg-gray-100"
        onClick={() => toggleLeadSelection(lead.phone_number)}
      >
        <td className="p-2 border">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedLeads.some(
                (selectedLead) => selectedLead.phone_number === lead.phone_number
              )}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                toggleLeadSelection(lead.phone_number);
              }}
            />
          </label>
        </td>
        <td className="p-2 border">{lead.name}</td>
        <td className="p-2 border">{lead.phone_number}</td>
        {importMethod === "existingLeads" && (
          <>
            <td className="p-2 border">{lead.source}</td>
            <td className="p-2 border">{lead.groups?.filter((group) => group != "other").join(", ") || "other"}</td>
            <td className="p-2 border">{lead.sent_messages}</td>
          </>
        )}
      </tr>
    ))}
  </tbody>
</table>

</div>
</div>
)}


          <div className="text-center mt-8">
            {isLoadingFromNumbers ? (
              <div className="animate-pulse flex justify-center mb-4">
              <div className="h-10 bg-gray-300 rounded w-20"></div>
            </div>
            ) : fromNumbers.length > 0 ? (
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 mb-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition mx-auto"
                disabled={selectedLeads?.length === 0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 inline-block ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 15.707a1 1 0 010-1.414L13.586 11H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <p className="text-red-500 mb-4"><a className="text-red-500 underline hover:text-red-700" href={`/${currentLocale}/accounts`}>
                {t("pleaseConnectYourAccountToProceed")}
                </a></p>
            )}
          </div>
          <div className="mt-15">
          <UserCampaigns />
          </div>
        </div>
      );
    } else if (step === 2) {
      return <StepTwoMessageForm leads={selectedLeads} goBack={() => setStep(1)} fromNumbers={fromNumbers} goForwardStartCampaign={goForwardStartCampaign} goForwardScheduleCampaign={goForwardScheduleCampaign} waGroupNumber={waGroupsSelectedPhone} />;
    } else if (step === 3) {
      if (campaignType === "scheduled") {
        return (
          <>
            <img src="/static/check-icon.png" alt="Check Icon" className="w-16 h-16 mx-auto mb-4" />
            <p className="text-center text-lg font-semibold">{t("congratulationsYourCampaignHasBeenSuccessfullyScheduled")}</p>
            <button onClick={() => location.reload()} className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition mx-auto block text-center">{t("startAgain")}</button>
          </>
        );
      } else if (campaignType === "now") {
        return (
          <>
            <img src="/static/check-icon.png" alt="Check Icon" className="w-16 h-16 mx-auto mb-4" />
            <p className="text-center text-lg font-semibold">{t("congratulationsYourCampaignHasBeenSuccessfullyStarted")}</p>
            <button onClick={() => location.reload()} className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition mx-auto block text-center">{t("startAgain")}</button>
          </>
        );
      }
    }
  };

  return (
    <div className="p-6 border border-gray-300 rounded shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-center gap-4 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-4 h-4 rounded-full ${s === step ? "bg-blue-500" : "bg-gray-300"}`}
          ></div>
        ))}
      </div>
      {renderStep()}
    </div>
  );
};

export default StartCampaign;
