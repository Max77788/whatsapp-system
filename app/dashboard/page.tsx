// app/dashboard/page.tsx
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function DashboardPage(): Promise<JSX.Element> {

  const session = await getServerSession(authOptions);

  /*
  // Check if the session is loading or if there is no session
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  */

  // Render the dashboard content if the user is authenticated
  return (
    <div>
      <h1>Welcome to your Dashboard, {session?.user?.name}!</h1>
      {/* Dashboard content */}
    </div>
  );
};
