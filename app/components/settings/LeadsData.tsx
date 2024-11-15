"use client";

import { useEffect, useState } from "react";

interface PhoneNumber {
  phoneNumber: string;
  active: boolean;
}

const PhoneNumberTacticsTable: React.FC = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [tactics, setTactics] = useState<string[]>([]);
  const [selectedTactics, setSelectedTactics] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const phoneNumbersResponse = await fetch("/api/phone-numbers");
        const tacticsResponse = await fetch("/api/text-tactics"); // Adjust this endpoint if needed

        const phoneNumbersData: PhoneNumber[] = await phoneNumbersResponse.json();
        const { text_tactics_names_list } = await tacticsResponse.json();

        setPhoneNumbers(phoneNumbersData);
        setTactics(["Do Nothing", ...text_tactics_names_list]);
        setSelectedTactics(
          phoneNumbersData.reduce((acc, phone) => {
            acc[phone.phoneNumber] = new Set();
            return acc;
          }, {} as Record<string, Set<string>>)
        );
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTacticChange = (phoneNumber: string, tactic: string) => {
    setSelectedTactics((prev) => {
      const currentSelection = new Set(prev[phoneNumber] || []);

      if (tactic === "Do Nothing") {
        // If "Do Nothing" is selected, clear all other tactics
        return {
          ...prev,
          [phoneNumber]: currentSelection.has(tactic) ? new Set() : new Set(["Do Nothing"]),
        };
      }

      // If any other tactic is selected, ensure "Do Nothing" is removed
      if (currentSelection.has("Do Nothing")) {
        currentSelection.delete("Do Nothing");
      }

      if (currentSelection.has(tactic)) {
        currentSelection.delete(tactic);
      } else {
        currentSelection.add(tactic);
      }

      return {
        ...prev,
        [phoneNumber]: currentSelection,
      };
    });
  };

  const saveData = async () => {
    const dataToSave = phoneNumbers.map((phone) => ({
      phoneNumber: phone.phoneNumber,
      tactics: Array.from(selectedTactics[phone.phoneNumber] || []),
    }));

    try {
      const response = await fetch("/api/save-tactics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        alert("Tactics saved successfully!");
      } else {
        alert("Failed to save tactics.");
      }
    } catch (error) {
      console.error("Error saving tactics:", error);
      alert("An error occurred while saving tactics.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="mt-8 p-4">
      {phoneNumbers.length === 0 ? (
        <p>No numbers. Connect one.</p>
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-4">Phone Number Tactics</h1>
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="border border-gray-300 p-2 text-left">Phone Number</th>
                <th className="border border-gray-300 p-2 text-left">Active</th>
                <th className="border border-gray-300 p-2 text-left">Tactics</th>
              </tr>
            </thead>
            <tbody>
              {phoneNumbers.map((phoneNumber) => (
                <tr key={phoneNumber.phoneNumber}>
                  <td className="border border-gray-300 p-2">{phoneNumber.phoneNumber}</td>
                  <td className="border border-gray-300 p-2">{phoneNumber.active ? "Active🟢" : "Inactive🔴"}</td>
                  <td className="border border-gray-300 p-2">
                    <div className="flex flex-wrap gap-2">
                      {tactics.map((tactic) => (
                        <label key={tactic} className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={selectedTactics[phoneNumber.phoneNumber]?.has(tactic) || false}
                            onChange={() => handleTacticChange(phoneNumber.phoneNumber, tactic)}
                          />
                          {tactic}
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={saveData}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save Tactics
          </button>
        </>
      )}
    </div>
  );
};

export default PhoneNumberTacticsTable;
