import { update_user, find_user } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { group } from "console";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  


  try {
    let { labelName, leads } = await req.json();

    if (!labelName || !leads) {
      return new Response(
        JSON.stringify({ message: "Label name and leads are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const user = await find_user({ email: userEmail });
    const currentGroups = user?.leadGroups || [];

    const userLeads = user?.leads || [];

    let updatedGroups = currentGroups;
    
    if (!currentGroups.includes(labelName)) {
      updatedGroups = [...currentGroups, labelName];
    }

    const updateLeadsWithLabel = (userLeads, leads, labelName) => {
      // Step A: Update existing leads
      const updatedLeads = userLeads.map((userLead) => {
        let phoneMatches = false;

        leads.forEach((lead) => {
          if (userLead.phone_number === lead.phone_number) {
            phoneMatches = true;
            
            if (userLead.groups) {
            if (!userLead.groups.includes(labelName)) {
              userLead.groups.push(labelName);
            }
          }
          }
        });

        if (userLead.groups) {
        if (!phoneMatches && userLead.groups.includes(labelName)) {
          userLead.groups = userLead.groups.filter((g) => g !== labelName);
        }
      }

        return userLead;
      });

      // Step B: Identify and append new leads
      const existingPhoneNumbers = new Set(userLeads.map((lead) => lead.phone_number));

      const newLeads = leads
        .filter((lead) => !existingPhoneNumbers.has(lead.phone_number))
        .map((lead) => ({
          ...lead, groups: [labelName],
          source: "other"
        }));

      // Step C: Combine updated and new leads
      const finalLeads = [...updatedLeads, ...newLeads];

      return finalLeads;
    };

    const updatedLeads = updateLeadsWithLabel(userLeads, leads, labelName);
    

    // Update the user with the filtered groups
    const success = await update_user(
      { email: userEmail },
      { leadGroups: updatedGroups, leads: updatedLeads }
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

  