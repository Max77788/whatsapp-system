// app/dashboard/page.tsx
"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../../../lib/auth/serverStuff";
import { authOptions } from "../../../../lib/auth/serverStuff";
import { find_user } from "@/lib/utils";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


export default async function ProfilePage(): Promise<JSX.Element> {
  await loginIsRequiredServer();

  const session = await getServerSession(authOptions);

  console.log(`session1: ${JSON.stringify(session)}`);

  const user = await find_user({ email: session?.user?.email });
  /*
  // Check if the session is loading or if there is no session
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  */

  // Render the dashboard content if the user is authenticated
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="profile-header bg-white p-8 border-b-2 border-gray-200 mb-8 text-center rounded-lg">
        <div className="flex justify-center">
          <img 
            src={session?.user?.image || '/static/default-icon.png'} 
            alt="User Avatar" 
            className="w-32 h-32 rounded-full mb-4 border-4 border-gray-200 shadow-lg"
          />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-black">{session?.user?.name}</h1>
        <p className="text-black">{session?.user?.email}</p>
      </div>

      <div className="profile-details text-center w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
          <div className="profile-section">
            <h2 className="text-xl font-semibold mb-4 text-black">Personal Information</h2>
            <div className="space-y-3">
              <div className="flex flex-col items-center">
                <span className="text-black font-bold">Name</span>
                <span className="font-medium text-black">{session?.user?.name}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-black font-bold">Email</span>
                <span className="font-medium text-black">{session?.user?.email}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-black font-bold">Unique ID</span>
                <span className="font-medium text-black">{user?.unique_id}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-black font-bold">API Key</span>
                <span className="font-medium text-black">{user?.apiKey}</span></div>
          
          {/*
          <div className="profile-section">
            <h2 className="text-xl font-semibold mb-4 text-black">Account Settings</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                Edit Profile
              </button>
              <button className="w-full bg-gray-200 text-black py-2 px-4 rounded hover:bg-gray-300 transition">
                Change Password
              </button>
            </div>
          </div>
          */}
        </div>
      </div>
    </div>
    </div>
  );
};
