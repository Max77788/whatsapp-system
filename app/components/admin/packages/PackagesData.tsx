'use client';

import { useState, useEffect } from 'react';

// Define a type for the plan
type Plan = {
  id: number;
  name: string;
  price: number;
  maxWaAccsNumber: number;
  aiIncluded: boolean;
  messageLimit: number;
};

export default function PlansTable() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editedPlans, setEditedPlans] = useState<Record<number, Plan>>({});

  // Fetch plans from the API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/admin/plans/get-all'); // Replace with your API endpoint
        if (!res.ok) throw new Error('Failed to fetch plans');
        const data: Plan[] = await res.json();
        console.log('Plans data:', data);
        setPlans(data);
        setEditedPlans(
          data.reduce((acc, plan) => ({ ...acc, [plan.id]: { ...plan } }), {})
        );
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };
    fetchPlans();
  }, []);

  // Handle input changes during customization
  const handleInputChange = (id: number, field: keyof Plan, value: any) => {
    setEditedPlans((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Save the edited plan
  const handleSave = async (id: number) => {
    try {
      const updatedPlan = editedPlans[id];
      const res = await fetch(`/api/admin/plans/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedPlan }),
      });
      if (!res.ok) throw new Error('Failed to update plan');
      setPlans((prev) =>
        prev.map((plan) => (plan.id === id ? updatedPlan : plan))
      );
      setIsEditing(null);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  // Render the table
  return (
    <div className="p-4">
      <table className="min-w-full border border-gray-300 text-left">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Price (NIS)</th>
            <th className="py-2 px-4">Max WA Accs</th>
            <th className="py-2 px-4">AI Included</th>
            <th className="py-2 px-4">Message Limit</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id} className="border-b">
              {isEditing === plan.id ? (
                <>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={editedPlans[plan.id].name}
                      onChange={(e) =>
                        handleInputChange(plan.id, 'name', e.target.value)
                      }
                      className="border px-2 py-1 w-full"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={editedPlans[plan.id].price}
                      onChange={(e) =>
                        handleInputChange(plan.id, 'price', parseFloat(e.target.value))
                      }
                      className="border px-2 py-1 w-full"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={editedPlans[plan.id].maxWaAccsNumber}
                      onChange={(e) =>
                        handleInputChange(
                          plan.id,
                          'maxWaAccsNumber',
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="border px-2 py-1 w-full"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <select
                      value={editedPlans[plan.id].aiIncluded ? 'true' : 'false'}
                      onChange={(e) =>
                        handleInputChange(plan.id, 'aiIncluded', e.target.value === 'true')
                      }
                      className="border px-2 py-1 w-full"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={editedPlans[plan.id].messageLimit}
                      onChange={(e) =>
                        handleInputChange(
                          plan.id,
                          'messageLimit',
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="border px-2 py-1 w-full"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleSave(plan.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2 mb-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(null)}
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-4">{plan.name}</td>
                  <td className="py-2 px-4">{plan.price}</td>
                  <td className="py-2 px-4">{plan.maxWaAccsNumber}</td>
                  <td className="py-2 px-4">{plan.aiIncluded ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4">{plan.messageLimit}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => setIsEditing(plan.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
