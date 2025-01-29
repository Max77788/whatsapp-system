"use client";
import { NextPage } from 'next';
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useLocale, useTranslations } from 'next-intl';
// If you're using CSV files, install 'papaparse' (npm install papaparse).
// For Excel, consider using 'xlsx' or a similar library.

interface Lead {
  name: string;
  phone_number: string;
  groups: string[];
  // You could have more fields, but these are the required two per your request
}

interface LabelManagerProps {
  userEmail: string | null;
}



// Simple helper to show a toast/alert (replace with your favorite toast library if you wish)
const showToast = (message: string) => {
  alert(message);
};

const LabelManager: NextPage<LabelManagerProps> = ({ userEmail }) => {
  const [labelsList, setLabelsList] = useState<string[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  
  // "existingLeads" = all leads fetched from the backend (not necessarily assigned to a label yet)
  const [existingLeads, setExistingLeads] = useState<Lead[]>([]);
  // "labelLeads" = leads specifically for the currently selected label
  const [labelLeads, setLabelLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  const [newLabels, setNewLabels] = useState<string[]>([]);

  const labelRef = useRef<string>('');

  const [tempLabelName, setTempLabelName] = useState(selectedLabel);

  const t = useTranslations("labelManager");

  // Fetch existing labels & existing leads from the backend
  useEffect(() => {
    async function fetchLabelsAndLeads() {
      const response = await fetch('/api/user/find-user');
      const user = await response.json();

      const userLeads = user?.leads || [];
      const userLabels = user?.leadGroups || [];

      setLabelsList(userLabels);
      console.log(`User Leads: ${JSON.stringify(userLeads)}`);
      console.log(`User Labels ${JSON.stringify(userLabels)}`)

      const updatedLeads = userLeads.map((lead: Lead) => {
        if (!lead.groups) {
          return { ...lead, groups: ["other"] };
        }
        return lead;
      });

      setAllLeads(updatedLeads);

      const currentLabelLeads = userLeads.filter((lead: Lead) => lead?.groups.includes(userLabels[0])) || [];
      setLabelLeads(currentLabelLeads);

      let labelToSelect = "NewLabel";

      if (userLabels.length !== 0) {
      labelToSelect = userLabels[0] === "other" ? (!!userLabels[1] ? userLabels[1] : "NewLabel") : userLabels[0]
      }

      console.log(`Label to select ${labelToSelect}`)
      
      if (labelToSelect !== "NewLabel") {
      setSelectedLabel(labelToSelect);
      }
    }
    fetchLabelsAndLeads();
  }, []);

  useEffect(() => {
    const updatedExistingLeads = allLeads.filter(
      (lead) => !labelLeads.some(l => l.phone_number === lead.phone_number)
    );
    setExistingLeads(updatedExistingLeads);
  }, [allLeads, labelLeads]);



  useEffect(() => {
    const setAllLeadsBack = async () => {
     // Example API endpoint
     const response = await fetch('/api/user/find-user');
     const user = await response.json();

     // All leads from user (we store them in existingLeads)
     const userLeads = user?.leads || [];

     // Ensure each lead has a "groups" attribute
     const updatedLeads = userLeads.map((lead: Lead) => {
      if (!lead.groups) {
      return { ...lead, groups: ["other"] };
      }
      return lead;
    });

      setExistingLeads(updatedLeads)  
    }
    }, [selectedLabel]);


  // Placeholder function for the actual deleteLabel logic
  const deleteLabel = (label: string) => {
    console.log(`Label "${label}" will be deleted. Implement your logic here.`);
    const response = fetch('/api/leads/remove-group', {
      method: 'DELETE',
      body: JSON.stringify({ groupName: label }),
    });

    toast.success(t("labelDeleted")); // Use localization

    location.reload(); // Refresh the page after deletion
  };

  // When the user clicks on a label in the left column
  const handleLabelClick = async (label: string) => {
    setSelectedLabel(label);

    console.log(`Obtained argument: ${label}`)
    
    labelRef.current = label.replace("\u200B", "")

    console.log(`Selected Label ${label} of length ${label.length}`)

    // Example scenario if you store which leads belong to which label in your DB:
    // - You’d fetch from the server or filter from existingLeads.
    // For the sake of example, we’ll clear or reassign them here:

    console.log(`Existing Leads: ${JSON.stringify(existingLeads)}`)
    
    const leadsToParse = [...existingLeads, ...labelLeads]
    
    const currentLabelLeads = leadsToParse.filter((lead) => lead?.groups.includes(label.replace("\u200B", ""))) || []
    
    console.log(`Current Label Leads: ${JSON.stringify(currentLabelLeads)}`);
    
    setLabelLeads(currentLabelLeads);
  };

  // Add a new label
  const handleAddNewLabel = () => {
    const hiddenChar = "\u200B";
    const newLabel = `${hiddenChar}NewLabel${labelsList.filter((label) => label !== "other").length + 1}`;
    setLabelsList((prevList) => [...prevList, newLabel]);
    setNewLabels((prevNew) => [...prevNew, newLabel]);
    setSelectedLabel(newLabel);
    setLabelLeads([]);
  };

  const handleLabelNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.trim();

    labelRef.current = newName;

    if (newName.length > 20 || newName.length < 1) {
      toast.error(t("labelNameMustBeFrom1To20CharactersLong"));
      return;
    }


    if (newLabels.includes(selectedLabel)) {
      // Update labelsList by replacing the old label name with the new one
      setLabelsList((prevList) =>
        prevList.map((lbl) => (lbl === selectedLabel ? newName : lbl))
      );

      // Update newLabels by replacing the old label name with the new one
      setNewLabels((prevNew) =>
        prevNew.map((lbl) => (lbl === selectedLabel ? newName : lbl))
      );
    }

    setSelectedLabel(newName);
  };


  // Handle CSV/Excel file uploads
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const Papa = await import('papaparse').then((mod) => mod.default);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => {
        const fields = result?.meta?.fields || [];
        if (!fields.includes('name') || !fields.includes('phone_number')) {
          showToast(t("invalidCSVFormat"));
          return;
        }

        const parsedLeads: Lead[] = result.data.map((row: any) => ({
          name: row.name,
          phone_number: row.phone_number,
          groups: [], // Initialize groups if necessary
        }));

        // Filter duplicates by phone_number
        const uniqueLeads = parsedLeads.filter(
          (newLead) => !allLeads.some(existingLead => existingLead.phone_number === newLead.phone_number)
        );

        if (uniqueLeads.length === 0) {
          toast.info(t("noNewLeads"));
          return;
        }

        console.log(`Unique Leads: ${JSON.stringify(uniqueLeads)}`);

        setAllLeads((prevLeads) => [...prevLeads, ...uniqueLeads]);
        setLabelLeads((prevLeads) => [...prevLeads, ...uniqueLeads]);
        toast.success(t("leadsUploadedSuccessfully"));
      },
    });
  };

  

  // Add a single existing lead from the "Existing Leads" table into the label’s leads
  const handleAddExistingLeadToLabel = (lead: Lead) => {
    const alreadyInLabel = labelLeads.some(
      (l) => l.phone_number === lead.phone_number
    );
    if (alreadyInLabel) {
      showToast(t("leadAlreadyInLabel")); // Use localization
      return;
    }

    // Update the lead's groups to include the selected label
    const updatedAllLeads = allLeads.map((l) => {
      if (l.phone_number === lead.phone_number) {
        return { ...l, groups: [...l.groups, selectedLabel] };
      }
      return l;
    });
    setAllLeads(updatedAllLeads);
    setLabelLeads((prev) => [...prev, { ...lead, groups: [...lead.groups, selectedLabel] }]);
  };



  // Remove a single lead from the label’s leads
  const removeLead = (index: number) => {
    setLabelLeads((prevLeads) => {
      const updatedLeads = [...prevLeads];
      updatedLeads.splice(index, 1);
      return updatedLeads;
    });
  };

  // Delete the entire label’s data
  const handleDeleteLabel = async () => {
    if (selectedLabel) {
      const confirmed = window.confirm(`${t("areYouSureYouWantToDeleteLabel")} "${selectedLabel}"?`);
      if (confirmed) {
        // Remove label from the left column
        setLabelsList((prevLabels) => {
          const newLabelsList = prevLabels.filter((lbl) => lbl !== selectedLabel);

          // Also remove from newLabels if it exists
          setNewLabels((prevNew) => prevNew.filter(lbl => lbl !== selectedLabel));

          // If there's still at least one label left, select the first one
          if (newLabelsList.length > 0) {
            setSelectedLabel(newLabelsList[0]);
            const newLabelLeads = allLeads.filter((lead) => lead.groups.includes(newLabelsList[0]));
            setLabelLeads(newLabelLeads);
          } else {
            // No labels left
            setSelectedLabel('');
            setLabelLeads([]);
          }
          return newLabelsList;
        });

        // Call external function to handle deletion
        await deleteLabel(selectedLabel);
      }
    }
  };


  // Save label changes
  const handleSaveLabel = async () => {
    if (labelLeads.length === 0) {
      toast.error(t("noLeadsInLabel"));
      return;
    }

    if (selectedLabel === "\u200B") {
      toast.error(t("labelNameCantBeEmpty"));
      return;
    }

    try {
      const response = await fetch('/api/leads/label-aka-group/save-or-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labelName: selectedLabel.replace("\u200B", ""), leads: labelLeads }),
      });

      if (response.ok) {
        toast.success(t("labelSaved"));
        // Optionally, refetch leads or update allLeads based on response
        // For now, reload the page

        // If the label was new, remove it from newLabels to make it non-editable
        if (newLabels.includes(selectedLabel)) {
          setNewLabels((prevNew) => prevNew.filter(lbl => lbl !== selectedLabel));
        }

        location.reload();
      } else {
        toast.error(t("failedToSaveLabel"));
      }
    } catch (error) {
      console.error("Error saving label:", error);
      toast.error(t("errorSavingLabel"));
    }
  };


  // Columns for the label leads table (only name & phone_number in this example)
  const labelColumns = ['name', 'phone_number'];

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      {/* Left Column: Labels List (25% width) */}
      <div
        style={{
          width: '25%',
          borderRight: '1px solid #ccc',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          minWidth: "300px"
        }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t("allLabels")}</h3>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {labelsList
        .filter((label) => label !== "other")
        .map((label) => (
            <li key={label} style={{ marginBottom: '0.8rem' }}>

            <button
              aria-pressed={selectedLabel === label}
              className={`flex items-center w-full text-left border border-gray-300 rounded-lg p-3 text-base font-medium transition-all duration-200 ease-in-out cursor-pointer shadow-md 
    ${selectedLabel === label ? "bg-gray-300 text-gray hover:bg-gray-500" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
  `}
              onClick={() => handleLabelClick(label)}
              disabled={labelsList.filter((label) => label !== "other").length === 1}
            >
              <img src="/static/redLabel.png" alt="label" className="w-10 mr-2" />
              {label}
            </button>

            </li>
        ))}
        </ul>

        


        {/* Add New Label Button (at the bottom) */}
        <button
          onClick={handleAddNewLabel}
          className="bg-blue-600 text-white p-2 max-w-sm cursor-pointer rounded-full"
        >
          ➕ {t("addNewLabel")}
        </button>
      </div>

      {/* Right Column: Selected Label Management (75% width) */}
      {selectedLabel ? (
      <div style={{ width: '75%', padding: '1rem', overflowY: 'auto' }}>
        
        {/* Save or Delete Label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', marginBottom: '20px' }}>
          <button
            onClick={handleDeleteLabel}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
          >
            {t("deleteLabel")} ❌
          </button>
          <button
            onClick={handleSaveLabel}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full"
          >
            {t("saveLabel")} 💾
          </button>
        </div>


        {/* Label Name */}
        <input
          type="text"
          value={selectedLabel}
          onChange={handleLabelNameChange} // Use the custom handler
          placeholder="Label Name"
          disabled={!newLabels.includes(selectedLabel)}
          className={`w-full mb-4 font-bold p-2 border border-gray-300 rounded 
    ${newLabels.includes(selectedLabel) ? "bg-white" : "bg-gray-200 cursor-not-allowed"} 
    ${newLabels.includes(selectedLabel) ? "focus:border-blue-500" : ""}
  `}
          title={
            newLabels.includes(selectedLabel)
              ? "You can edit the label name."
              : "Label name is not editable."
          }
        />


        {/* File Upload */}
        <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white mb-4 rounded-full mx-auto block">
          <label style={{ cursor: 'pointer' }}>
            {t("uploadCSVOrExcel")} 📤
            <input
              type="file" 
              accept=".csv, .xlsx, .xls"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
        </button>
        

        {/* Label’s Leads Table */}
        <h4 className='font-bold text-2xl mb-2'>{t("leadsForLabel")}: {selectedLabel || 'None'}</h4>
        <div style={{ maxWidth: '100%', overflowX: 'auto', maxHeight: '50vh', overflowY: 'auto' }}>
          {labelLeads.length > 0 ? (
              <table className="w-full border-collapse mb-8 rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                    {t("name")}
                  </th>
                  <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                    {t("phone_number")}
                  </th>
                  <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {labelLeads.map((lead, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{lead.name}</td>
                    <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{lead.phone_number}</td>
                    <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                      <button onClick={() => removeLead(index)}>❌</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>{t("noLeadsInLabel")}</p>
          )
          }
        </div>


        {/* Existing Leads Section: you can add them to the label */}
        <h4 className='font-bold text-2xl mb-2'>{t("existingLeads")}</h4>
        {existingLeads.length > 0 ? (
            <table className="w-full border-collapse mb-8 rounded-lg overflow-hidden">

            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{t("name")}</th>
                <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{t("phone_number")}</th>
                <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{t("action")}</th>
              </tr>
            </thead>
            <tbody>
              {existingLeads.map((lead, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{lead.name}</td>
                  <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{lead.phone_number}</td>
                  <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                    <button onClick={() => handleAddExistingLeadToLabel(lead)}>➕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
            <p>{t("noMoreLeadsAvailable")}</p>
        )}

        
      </div>
      ) : (
          <div className="mt-16 ml-4">
            <p className='text-center font-bold italic'>{t("pleasePressAddLabelButton")}</p>
          </div>

      )
    }      
    </div>

  
  );
};

export default LabelManager;