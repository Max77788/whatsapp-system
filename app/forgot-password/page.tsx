"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.text();

    if (result === "Use Google Signup") {
      router.push("/auth/signin?notification=use-google-signup");
    }
    setMessage(result);
  };

  return (
    <div className="w-96 p-8 space-y-6 rounded-lg shadow-lg flex flex-col items-center">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded text-black"
        />
        <button type="submit" className="p-2 bg-green-600 hover:bg-green-700 text-white rounded">Send Reset Link</button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  )
}
