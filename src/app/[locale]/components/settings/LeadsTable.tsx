"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { saveAs } from 'file-saver'; // Import file-saver for exporting files
import { useTranslations } from "next-intl";

import { buttonSmallStyle } from "@styles";

interface Lead {
  name: string;
  phone_number: string;
  source: string;
  groups: string[]; // New group attribute
  sent_messages?: number; // Optional in case it's not always present
  handled?: boolean;
  extra_notes?: string;
}

interface Props {
  leads?: Lead[]; // Prop to accept initial leads data
  groups_list?: string[]; // Prop to accept initial groups data
}

const LeadsTable: React.FC<Props> = ({ leads = [] }: Props) => {
  const t = useTranslations("leads");
  
  const fetchGroups = async () => {
    const response = await fetch("/api/user/find-user");
    const data = await response.json();
    const leadGroups = data.leadGroups || ["other"];

    setGroups(leadGroups);

    return leadGroups;
  };
  
  const [leadData, setLeadData] = useState<Lead[]>(leads);
  const [loading, setLoading] = useState(leads.length === 0);
  const [newLead, setNewLead] = useState<Lead>({
    name: "",
    phone_number: "",
    source: "",
    groups: ["other"], // Default group is 'other'
    sent_messages: 0,
  });
  const [bulkPhoneNumbers, setBulkPhoneNumbers] = useState<string>("");
  const [groups, setGroups] = useState<string[]>([]); // Default group list with 'other'
  const [newGroup, setNewGroup] = useState<string>("");

  const { data: session } = useSession();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (leads.length === 0) {
      const fetchData = async () => {
        try {
          const response = await fetch("/api/leads");
          const data: Lead[] = await response.json();
          setLeadData(
            data.map((lead) => ({
              ...lead,
              sent_messages: lead.sent_messages || 0,
              group: lead.groups || ["other"], // Ensure `group` defaults to 'other'
            }))
          );
        } catch (error) {
          console.error("Failed to fetch leads:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [leads]);

  const handleAddLead = () => {
    if (!newLead.name || !newLead.phone_number || !newLead.source) {
      alert(t("please_fill_in_all_fields_before_adding_a_lead"));
      return;
    }

    setLeadData((prevData) => [...prevData, newLead]);
    setNewLead({ name: "", phone_number: "", source: "", groups: ["other"], sent_messages: 0 });
  };

  const sourcesList = ["facebook", "wpforms", "contactform", "other"];

  const handleDeleteGroup = async (group: string) => {
    setGroups((prevGroups) => prevGroups.filter((g) => g !== group));
    const updatedGroups = groups.filter((g) => g !== group);
    const response = await fetch("/api/leads/add-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groups: updatedGroups }),
    });
  };

  const handleBulkAdd = () => {
    if (!bulkPhoneNumbers.trim()) {
      alert(t("please_paste_some_phone_numbers"));
      return;
    }

    const phoneNumbers = bulkPhoneNumbers
      .split(/[\n,]+/) // Split by new lines or commas
      .map((number) => number.trim()) // Remove whitespace
      .filter((number) => number && Number.isInteger(Number(number))); // Remove empty entries

    if (phoneNumbers.length === 0) {
      alert(t("no_valid_phone_numbers_found"));
      return;
    }

    const newLeads = phoneNumbers.map((phone_number) => ({
      name: "", // Default name
      phone_number,
      source: "", // Default source
      groups: ["other"], // Default group
      sent_messages: 0, // Default sent messages
    }));

    setLeadData((prevData) => [...prevData, ...newLeads]);
    setBulkPhoneNumbers(""); // Clear the text area
    alert(`${newLeads.length} ${t("phone_numbers_added_successfully")}`);
  };

  const handleAddGroup = async () => {
    if (!newGroup.trim()) {
      alert(t("please_enter_a_group_name"));
      return;
    }

    if (groups.includes(newGroup)) {
      alert(t("this_group_already_exists"));
      return;
    }

    setGroups((prevGroups) => [...prevGroups, newGroup]);
    setNewGroup("");

    // Create the updated groups array manually
    const updatedGroups = [...groups, newGroup];

    const response = await fetch("/api/leads/add-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groups: updatedGroups }),
    });
  };

  const handleDeleteLead = async (index: number) => {
    if (leadData.length === 1) {
      toast.error(t("cant_delete_the_last_lead"))
      return;
    }
    
    setLeadData((prevData) => prevData.filter((_, i) => i !== index));

    const userEmail = session?.user?.email;
    if (!userEmail) {
      alert(t("user_email_not_found"));
      return;
    }
    
    const updatedLeads = leadData.map(({ name, phone_number, source, groups, sent_messages }) => ({
      name,
      phone_number,
      source,
      groups,
      sent_messages,
    }));

    const response = await fetch("/api/leads/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail,
        leadsList: updatedLeads,
      }),
    });
  };

  const saveData = async () => {
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        alert(t("user_email_not_found"));
        return;
      }

      const leadsToSave = leadData.map(({ name, phone_number, source, groups, sent_messages, handled, extra_notes }) => ({
        name,
        phone_number,
        source,
        groups,
        sent_messages,
        handled,
        extra_notes,
      }));

      const response = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          leadsList: leadsToSave,
        }),
      });

      if (response.ok) {
        toast.success(t("leads_data_saved_successfully"));
        await new Promise(resolve => setTimeout(resolve, 1000));
        location.reload();
      } else {
        alert(t("failed_to_save_leads_data"));
      }
    } catch (error) {
      console.error("Error saving leads data:", error);
      alert(t("an_error_occurred_while_saving_leads_data"));
    }
  };

  const exportToCSV = () => {
    const enrichedLeadData = leadData.map((lead) => ({
      name: lead.name || "", // Ensure the name is not null
      phone_number: lead.phone_number || "", // Ensure phone_number is not null
      source: lead.source || "", // Default to an empty string if no source
      group: lead.groups || ["other"], // Default group is 'other'
      sent_messages: lead.sent_messages || 0, // Default sent_messages to 0
      handled: lead.handled ? "Yes" : "No", // Convert boolean to string for clarity
      extra_notes: lead.extra_notes || "", // Default extra_notes to an empty string
    }));
  
    const csv = Papa.unparse(enrichedLeadData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "leads.csv");
  };
  

  if (loading) {
    return <p>{t("loading")}</p>;
  }

  return (
    <div className="mt-8 p-4">
      {leadData.length === 0 ? (
        <p>{t("no_leads_available_add_some_data")}</p>
      ) : (
        <>
          <button
            onClick={exportToCSV}
            className={buttonSmallStyle("yellow", "mb-4")}
          >
            {t("export_as_csv")}
          </button>
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="border border-gray-300 p-2 text-left">{t("name")}</th>
                <th className="border border-gray-300 p-2 text-left">{t("phone_number")}</th>
                <th className="border border-gray-300 p-2 text-left">{t("source")}</th>
                <th className="border border-gray-300 p-2 text-left">{t("label")}</th>
                <th className="border border-gray-300 p-2 text-left">{t("sent_messages")}</th>
                <th className="border border-gray-300 p-2 text-left">{t("handled")}</th>
                <th className="border border-gray-300 p-2 text-left">{t("extra_notes")}</th>
                <th className="border border-gray-300 p-2 text-left">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {leadData.map((lead, index) => (
                <tr key={`${lead.phone_number}-${index}`}>
                  <td
                    className="border border-gray-300 p-2"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const updatedName = e.currentTarget.textContent || "";
                      setLeadData((prevData) =>
                        prevData.map((item, i) =>
                          i === index ? { ...item, name: updatedName } : item
                        )
                      );
                    }}
                  >
                    {lead.name}
                  </td>
                  <td
                    className="border border-gray-300 p-2"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const updatedPhoneNumber = e.currentTarget.textContent || "";
                      setLeadData((prevData) =>
                        prevData.map((item, i) =>
                          i === index ? { ...item, phone_number: updatedPhoneNumber } : item
                        )
                      );
                    }}
                  >
                    {lead.phone_number}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <select
                      value={lead.source}
                      onChange={(e) => {
                        const updatedGroup = e.target.value;
                        setLeadData((prevData) =>
                          prevData.map((item, i) =>
                            i === index ? { ...item, group: updatedGroup } : item
                          )
                        );
                      }}
                      className="border border-gray-300 rounded p-1"
                    >
                      {sourcesList.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <div className="border border-gray-300 rounded p-1 min-h-[100px]">
                      {groups.map((group) => (
                        <label key={group} className="block flex items-center space-x-2 gap-1">
                          <input
                            type="checkbox"
                            checked={lead.groups?.includes(group) || false}
                            onChange={(e) => {
                              const updatedGroups = e.target.checked
                                ? [...(lead.groups || []), group] // Add group if checked
                                : (lead.groups || []).filter((g) => g !== group); // Remove group if unchecked
                              setLeadData((prevData) =>
                                prevData.map((item, i) =>
                                  i === index ? { ...item, groups: updatedGroups } : item
                                )
                              );
                            }}
                          />
                          {group}
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="border border-gray-300 p-2">{lead.sent_messages || 0}</td>
                  <td className="border border-gray-300 p-2">
                    <select
                      value={lead.handled ? t("yes") : t("no")}
                      onChange={(e) => {
                        const updatedHandled = e.target.value === t("yes");
                        setLeadData((prevData) =>
                          prevData.map((item, i) =>
                            i === index ? { ...item, handled: updatedHandled } : item
                          )
                        );
                      }}
                      className="border border-gray-300 rounded p-1"
                    >
                      <option value={t("yes")}>{t("yes")}</option>
                      <option value={t("no")}>{t("no")}</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <textarea
                      value={lead.extra_notes || ""}
                      onChange={(e) => setLeadData((prevData) => prevData.map((item, i) => i === index ? { ...item, extra_notes: e.target.value } : item))}
                      className="border border-gray-300 rounded p-1 w-full h-10 resize-none"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => handleDeleteLead(index)}
                      className={buttonSmallStyle("red")}
                    >
                      {t("delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={saveData}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full mx-auto"
          >
            {t("save_data")}
          </button>
        </>
      )}

      {/* Add New Lead */}
      <div className="mt-6 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-4">{t("add_new_lead")}</h2>
        <div className="grid grid-cols-4 gap-4">
          <input
            type="text"
            value={newLead.name}
            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            placeholder={t("name")}
            className="border text-black border-gray-300 p-2 rounded"
          />
          <input
            type="number"
            value={newLead.phone_number}
            onChange={(e) =>
              setNewLead({ ...newLead, phone_number: e.target.value })
            }
            placeholder={t("phone_number")}
            className="border text-black border-gray-300 p-2 rounded"
          />
          <select
            value={newLead.source}
            onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
            className="border text-black border-gray-300 p-2 rounded"
          >
            <option value="" disabled hidden>{t("choose_source")}</option>
            {sourcesList.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
            {/* Replace your <select multiple> with something like this */}
            <div className="border text-black border-gray-300 p-2 rounded min-h-[65px]" style={{ maxHeight: "65px", overflowY: "auto" }}>
              <p>{t("choose_label")}</p>

              {groups.map((group) => {
                // Check if this group is already in newLead.groups
                const isChecked = newLead.groups.includes(group);

                return (
                  <label key={group} className="flex items-center mt-1 gap-1">
                    <input
                      type="checkbox"
                      value={group}
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Add the selected group
                          setNewLead({
                            ...newLead,
                            groups: [...newLead.groups, group],
                          });
                        } else {
                          // Remove the unselected group
                          setNewLead({
                            ...newLead,
                            groups: newLead.groups.filter((g) => g !== group),
                          });
                        }
                      }}
                    />
                    <span className="ml-2">{group}</span>
                  </label>
                );
              })}
            </div>


        </div>
        <button
          onClick={handleAddLead}
          className={buttonSmallStyle()}
        >
          {t("add_lead")}
        </button>
      </div>

      {/* Bulk Add Phone Numbers */}
     <div className="mt-6 p-4 border border-gray-300 rounded">
  <h2 className="text-xl font-semibold mb-4">{t("bulk_add_phone_numbers")}</h2>
  <textarea
    value={bulkPhoneNumbers}
    onChange={(e) => setBulkPhoneNumbers(e.target.value)}
    placeholder={t("paste_phone_numbers_here_separated_by_commas_or_new_lines")}
    className="w-full border text-black border-gray-300 p-2 rounded h-32 resize-none"
  />
  <button
    onClick={handleBulkAdd}
          className={buttonSmallStyle()}
  >
    {t("add_bulk_phone_numbers")}
        </button>
      </div>

      {/* Import CSV */}
<div className="mt-6 p-4 border border-gray-300 rounded">
  <h2 className="text-xl font-semibold mb-4">{t("import_leads_from_csv")}</h2>
  <input
    type="file"
    accept=".csv"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        Papa.parse(file, {
          header: true, // Assumes the first row contains column headers
          skipEmptyLines: true,
          complete: (result) => {
            const parsedData = result.data as Lead[];
            const newLeads = parsedData.map((lead) => ({
              ...lead,
              groups: lead.groups || ["other"], // Default group
              sent_messages: lead.sent_messages || 0, // Default sent messages
            }));
            setLeadData((prevData) => [...prevData, ...newLeads]);
            alert(`${newLeads.length} ${t("leads_imported_successfully")}`);
          },
          error: (error) => {
            alert(t("failed_to_parse_the_csv_file_please_check_the_format"));
            console.error(error);
          },
        });
      }
    }}
    className="w-full border text-black border-gray-300 p-2 rounded"
  />
      </div>  

      {/*
      <div className="mt-6 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-4">{t("add_new_group")}</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            placeholder={t("new_group_name")}
            className="border text-black border-gray-300 p-2 rounded"
          />
          <button
            onClick={handleAddGroup}
            className={buttonSmallStyle("yellow")}
          >
            ➕
          </button>
          <div className="mt-4 flex flex-wrap gap-2">
          {groups.map((group) => (
            group !== 'other' && (
              <div
                key={group}
                className="bg-gray-200 text-black px-3 py-1 rounded-full flex items-center"
              >
                <span>{group}</span>
                <button
                  onClick={() => handleDeleteGroup(group)}
                  className="ml-2 text-red-500 font-bold"
                >
                  ×
                </button>
              </div>
            )
          ))}
          </div>
        </div>
      </div>
      */}
    </div>
  );
};

export default LeadsTable;
