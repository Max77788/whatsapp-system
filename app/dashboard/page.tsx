// app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if the session is loading or if there is no session
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    // Redirect to sign-in page if no session
    router.push("/auth/signin");
    return null; // Return nothing while redirecting
  }

  // Render the dashboard content if the user is authenticated
  return (
    <div>
      <h1>Welcome to your Dashboard, {session.user?.name}!</h1>
      {/* Dashboard content */}
    </div>
  );
};

export default DashboardPage;

