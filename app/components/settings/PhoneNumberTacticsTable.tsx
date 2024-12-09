"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

interface PhoneNumber {
  phoneNumber: string;
  active: boolean;
}

interface TacticAssignment {
  phoneNumber: string;
  tactics: string[];
}

interface PhoneNumberTacticsTableProps {
  initialTactics?: TacticAssignment[];
}

const PhoneNumberTacticsTable: React.FC<PhoneNumberTacticsTableProps> = ({ initialTactics = [] }) => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [tactics, setTactics] = useState<string[]>([]);
  const [selectedTactics, setSelectedTactics] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  let aiIncluded = false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const phoneNumbersResponse = await fetch("/api/phone-numbers");
        const tacticsResponse = await fetch("/api/text-tactics");
        const planResponse = await fetch("/api/plan/find-plan");
  
        if (!phoneNumbersResponse.ok || !tacticsResponse.ok || !planResponse.ok) {
          throw new Error("Failed to fetch data");
        }
  
        const phoneNumbersData: PhoneNumber[] = await phoneNumbersResponse.json();
        const { text_tactics_names_list } = await tacticsResponse.json();
        const plan = await planResponse.json();
  
        const aiIncluded = plan?.aiIncluded || false;
  
        // Conditionally include or exclude "Enable AI Auto Response"
        const availableTactics = aiIncluded
          ? ["Do Nothing", "Enable AI Auto Response", ...text_tactics_names_list]
          : ["Do Nothing", ...text_tactics_names_list];
  
        setPhoneNumbers(phoneNumbersData);
        setTactics(availableTactics);
  
        // Initialize selectedTactics with initial props or default "Do Nothing"
        const initialTacticsMap: Record<string, string[]> = phoneNumbersData.reduce(
          (acc, phone) => {
            // Check if phone number already has assigned tactics
            const assignedTactics = initialTactics.find(
              (tactic) => tactic.phoneNumber === phone.phoneNumber
            )?.tactics;
  
            // If tactics exist, use them; otherwise, default to ["Do Nothing"]
            acc[phone.phoneNumber] = assignedTactics || ["Do Nothing"];
            return acc;
          },
          {} as Record<string, string[]>
        );
        setSelectedTactics(initialTacticsMap);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [initialTactics]);
  

  const handleTacticChange = (phoneNumber: string, tactic: string) => {
    setSelectedTactics((prev) => {
      const currentSelection = prev[phoneNumber] || [];

      if (tactic === "Do Nothing") {
        return {
          ...prev,
          [phoneNumber]: ["Do Nothing"],
        };
      }

      const updatedSelection = currentSelection.includes(tactic)
        ? currentSelection.filter((t) => t !== tactic)
        : [...currentSelection.filter((t) => t !== "Do Nothing"), tactic];

      return {
        ...prev,
        [phoneNumber]: updatedSelection,
      };
    });
  };

  const handleDelete = async (phoneNumber: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to disconnect the phone number: ${phoneNumber}?`
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/whatsapp-part/disconnect-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        
        toast.success("Phone number disconnected successfully!");
        await new Promise((resolve) => setTimeout(resolve, 2000));
          // setPhoneNumbers((prev) => prev.filter((phone) => phone.phoneNumber !== phoneNumber));
          // setSelectedTactics((prev) => {
          // const newTactics = { ...prev };
          // delete newTactics[phoneNumber];
          // return newTactics;
        // });
        location.reload();
      } else {
        toast.error("Failed to disconnect phone number.");
      }
    } catch (error) {
      console.error("Error disconnecting phone number:", error);
      alert("An error occurred while disconnecting the phone number.");
    }
  };

  const saveData = async () => {
    console.log(`selectedTactics: ${JSON.stringify(selectedTactics)}`);

    const dataToSave = phoneNumbers.map((phone) => ({
      phoneNumber: phone.phoneNumber,
      tactics: selectedTactics[phone.phoneNumber] || [],
    }));

    console.log(`dataToSave: ${JSON.stringify(dataToSave)}`);

    try {
      const response = await fetch("/api/text-tactics/save", {
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
    return <div className="animate-pulse flex justify-center">
    <div className="h-48 bg-gray-300 rounded w-96"></div>
  </div>;
  }

  return (
    <div className="mt-8 p-4 flex flex-col gap-3 items-left justify-left">
      {phoneNumbers.length === 0 ? (
        <p>No numbers. Connect one.</p>
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-4">Phone Number Tactics</h1>
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="border border-gray-300 p-2 text-left">Phone Number</th>
                <th className="border border-gray-300 p-2 text-left">Active</th>
                <th className="border border-gray-300 p-2 text-left">Tactics</th>
                <th className="border border-gray-300 p-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {phoneNumbers.map((phoneNumber) => (
                <tr key={phoneNumber.phoneNumber}>
                  <td className="border border-gray-300 p-2">{phoneNumber.phoneNumber}</td>
                  <td className="border border-gray-300 p-2">
                    {phoneNumber.active ? "🟢" : "🔴"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <div className="flex flex-wrap gap-2">
                      {tactics.map((tactic) => (
                        <label key={tactic} className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={selectedTactics[phoneNumber.phoneNumber]?.includes(tactic) || false}
                            onChange={() => handleTacticChange(phoneNumber.phoneNumber, tactic)}
                          />
                          {tactic}
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="border border-gray-300 p-2">
                    {phoneNumber.active && (
                      <button
                        onClick={() => handleDelete(phoneNumber.phoneNumber)}
                        className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full mx-auto"
                      >
                        Disconnect
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => saveData()}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full mx-auto block"
          >
            Save Tactics
          </button>
        </>
      )}
    </div>
  );
};

export default PhoneNumberTacticsTable;
