import { Resend } from "resend";
import { nanoid } from "nanoid";
import { update_user, find_user } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  console.log("Received POST request for password reset");
  const { email } = await request.json();
  console.log(`Parsed email from request: ${email}`);

  if (!email) {
    console.warn("No email provided in request");
    return new Response("Email is required", { status: 400 });
  }

  // Validate email and generate a password reset token
  const resetToken = nanoid(10);
  console.log(`Generated reset token: ${resetToken}`);
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
  console.log(`Constructed reset URL: ${resetUrl}`);

  const user = await find_user({ email: email });
  console.log(`User lookup result: ${user ? "User found" : "User not found"}`);
  
  if (!user) {
    console.warn("User not found for provided email");
    return new Response("User not found", { status: 404 });
  }
  if (user.id) {
    console.info("User has an ID, suggesting Google Signup");
    return new Response("Use Google Signup", { status: 404 });
  }

  const success = await update_user({ email: email }, { reset_token: resetToken });
  console.log(`User update result: ${success ? "Success" : "Failure"}`);

  try {
    console.log("Attempting to send password reset email");
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    });

    console.log("Password reset email sent successfully");
    return new Response("Password reset email sent successfully", { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response("Error sending password reset email", { status: 500 });
  }
}
