import { update_user, find_user } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  try {
    const body = await req.json(); // Parse JSON body
    const { groupName } = body; // Extract groupName from the request body

    if (!groupName) {
      return new Response(
        JSON.stringify({ message: "Group name is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Retrieve user's current groups
    const user = await find_user({ email: userEmail });
    const currentGroups = user?.leadGroups || [];

    // Remove the group from the current groups
    const updatedGroups = currentGroups.filter(
      (group) => group !== groupName
    );

    // Iterate through each lead and remove the groupName from their groups
    const updatedLeads = (user.leads || []).map(lead => {
      if (lead.groups && lead.groups.includes(groupName)) {
        return {
          ...lead,
          groups: lead.groups.filter(group => group !== groupName),
        };
      }
      return lead;
    });



    // Update the user with the filtered groups
    const success = await update_user(
      { email: userEmail },
      { leadGroups: updatedGroups,
        leads: updatedLeads }
    );

    if (success) {
      return new Response(
        JSON.stringify({ message: "Group removed successfully" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      throw new Error("Failed to update user data");
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ message: "Failed to process the request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}

  