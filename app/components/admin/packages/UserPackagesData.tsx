'use client';

import { useState, useEffect } from 'react';

// Define a type for the plan
type Plan = {
  id: string;
  name: string;
};

// Define a type for edited users
type EditedUsers = {
  [key: string]: Plan & { planId?: string }; // Assuming planId is optional
};

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editedUsers, setEditedUsers] = useState<EditedUsers>({});

  // Fetch users and plans from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersRes = await fetch('/api/admin/users/get-all'); // Replace with your API endpoint
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const usersData = await usersRes.json();

        // Fetch plans
        const plansRes = await fetch('/api/admin/plans/get-all'); // Replace with your API endpoint
        if (!plansRes.ok) throw new Error('Failed to fetch plans');
        const plansData = await plansRes.json();

        console.log(`Plans: ${plansData}`);

        setUsers(usersData);
        setPlans(plansData);

        // Initialize edited users state
        setEditedUsers(
          usersData.reduce(
            (acc: any, user: any) => ({
              ...acc,
              [user.id]: { ...user },
            }),
            {}
          )
        );
      } catch (error) {
        console.error(`Error fetching users: ${error}`);
      }
    };
    fetchData();
  }, []);

  // Handle dropdown selection change
  const handlePlanChange = (id: any, planId: any) => {
    setEditedUsers((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        planId,
      },
    }));
  };

  // Save updated user plan
  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedUser: editedUsers[id] }), // Use optional chaining
      });
      if (!res.ok) throw new Error('Failed to update user plan');

      // Update local state
      setUsers((prev: any) =>
        prev.map((user: any) => (user.id === id ? editedUsers[id] : user))
      );
      setIsEditing(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <table className="min-w-full border border-gray-300 text-left">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="py-2 px-4">User Name</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Plan</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id} className="border-b">
              {isEditing === user.id ? (
                <>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">
                    <select
                      value={editedUsers[user.id].planId}
                      onChange={(e) => handlePlanChange(user.id, e.target.value)}
                      className="border px-2 py-1 w-full"
                    >
                      {plans.map((plan: Plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleSave(user.id)}
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
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">
                    {plans.find((plan: Plan) => plan.id === user.planId)?.name || 'No Plan'}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => setIsEditing(user.id)}
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
