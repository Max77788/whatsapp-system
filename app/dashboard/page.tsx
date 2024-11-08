// app/dashboard/page.tsx
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth/helpers";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



export default async function DashboardPage(): Promise<JSX.Element> {

  const session = await getServerSession(authOptions);

  console.log(`session: ${JSON.stringify(session)}`);

  /*
  // Check if the session is loading or if there is no session
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  */

  // Render the dashboard content if the user is authenticated
  return (
    <div>
      <img src={session?.user?.image || '/default-avatar.png'} alt="User Avatar" className="w-10 h-10 rounded-full" />
      <h1>Welcome to your Dashboard, {session?.user?.name}!</h1>
      {/* Dashboard content */}
    </div>
  );
};
