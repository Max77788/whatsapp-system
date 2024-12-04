"use client";

import { useEffect, useState } from "react";
import { find_user } from "@/lib/utils";
import { toast } from "react-toastify";

interface ScheduledMessage {
  fromNumber: string;
  toNumbers: string[];
  message: string;
  scheduleTime: string;
  timeZone: string;
  mediaURL: string | null;
}

const ScheduledMessagesListTable: React.FC = () => {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial scheduled messages
  useEffect(() => {
    const fetchScheduledMessages = async () => {
      try {
        const response = await fetch("/api/whatsapp-part/schedule-message/get");
        if (!response.ok) throw new Error("Failed to fetch scheduled messages");
        const { scheduledMessages } = await response.json();
        scheduledMessages.sort((a: ScheduledMessage, b: ScheduledMessage) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime());
        
        
        setScheduledMessages(scheduledMessages);
      } catch (error) {
        console.error("Error fetching scheduled messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledMessages();
  }, []);

  // Handle delete action
  const handleDelete = async (messageIndex: number) => {
    const confirmDelete = window.confirm("Are you sure you want to unschedule this message?");
    if (!confirmDelete) return;

    const messageToDelete = scheduledMessages[messageIndex];
    try {
      const response = await fetch(`/api/whatsapp-part/schedule-message/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageToDelete  }), // Use an identifier like `scheduleTime` or message ID
      });

      if (response.ok) {
        toast.success("Message unscheduled successfully!");
        setScheduledMessages((prev) => prev.filter((_, index) => index !== messageIndex));
      } else {
        toast.error("Failed to unschedule the message.");
      }
    } catch (error) {
      console.error("Error unscheduling the message:", error);
      alert("An error occurred while unscheduling the message.");
    }
  };

  if (loading) {
    return <p>Loading scheduled messages...</p>;
  }

  return (
    <div className="mt-8 p-4 border border-gray-300 rounded-lg">
      <h1 className="text-2xl text-center font-semibold mb-4">Scheduled Messages</h1>
      {scheduledMessages?.length === 0 ? (
        <p className="text-gray-500 italic">No messages are scheduled.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="border border-gray-300 p-2 text-left">From Number</th>
              <th className="border border-gray-300 p-2 text-left">To Numbers</th>
              <th className="border border-gray-300 p-2 text-left">Message</th>
              <th className="border border-gray-300 p-2 text-left">Schedule Time</th>
              <th className="border border-gray-300 p-2 text-left">Time Zone</th>
              <th className="border border-gray-300 p-2 text-left">Media Included</th>
              <th className="border border-gray-300 p-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {scheduledMessages?.map((message, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{message.fromNumber}</td>
                <td className="border border-gray-300 p-2">
                  {(() => {
                    const toNumbersArray = Array.isArray(message.toNumbers) ? message.toNumbers : JSON.parse(message.toNumbers || "[]");
                    return toNumbersArray.length > 1 ? toNumbersArray.join(", ") : toNumbersArray[0] || "N/A";
                  })()}
                </td>
                <td className="border border-gray-300 p-2">{message.message}</td>
                <td className="border border-gray-300 p-2">{message.scheduleTime.replace("T", " ").replace("Z", "")}</td>
                <td className="border border-gray-300 p-2">{message.timeZone}</td>
                <td className="border border-gray-300 p-2">{message.mediaURL ? "Yes" : "No"}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => handleDelete(index)}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScheduledMessagesListTable;
