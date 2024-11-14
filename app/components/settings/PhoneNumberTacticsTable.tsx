"use client";

import { useEffect, useState } from "react";

interface PhoneNumber {
  phoneNumber: string;
  active: boolean;
}

const PhoneNumberTacticsTable: React.FC = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [tactics, setTactics] = useState<string[]>([]);
  const [selectedTactics, setSelectedTactics] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const phoneNumbersResponse = await fetch("/api/phone-numbers");
        const tacticsResponse = await fetch("/api/text-tactics"); // Adjust this endpoint if needed

        const phoneNumbersData: PhoneNumber[] = await phoneNumbersResponse.json();
        const { text_tactics_names_list, text_tactics_list } = await tacticsResponse.json();
        
        setPhoneNumbers(phoneNumbersData);
        setTactics(text_tactics_names_list);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTacticChange = (phoneNumber: string, tactic: string) => {
    setSelectedTactics((prev) => ({
      ...prev,
      [phoneNumber]: tactic,
    }));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="mt-8 p-4">
      {phoneNumbers.length === 0 ? (
        <p>No numbers. Connect one.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="border border-gray-300 p-2 text-left">Phone Number</th>
              <th className="border border-gray-300 p-2 text-left">Active</th>
              <th className="border border-gray-300 p-2 text-left">Tactic</th>
            </tr>
          </thead>
          <tbody>
            {phoneNumbers.map((phoneNumber) => (
              <tr key={phoneNumber.phoneNumber}>
                <td className="border border-gray-300 p-2">{phoneNumber.phoneNumber}</td>
                <td className="border border-gray-300 p-2">{phoneNumber.active ? "Active🟢" : "Inactive🔴"}</td>
                <td className="border border-gray-300 p-2">
                  <select
                    className="w-full p-1 border rounded bg-black"
                    value={selectedTactics[phoneNumber.phoneNumber] || ""}
                    onChange={(e) => handleTacticChange(phoneNumber.phoneNumber, e.target.value)}
                  >
                    <option value="">Select Tactic</option>
                    {tactics.map((tactic) => (
                      <option key={tactic} value={tactic}>
                        {tactic}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PhoneNumberTacticsTable;
