// This is a Vercel Serverless Function.
// You should save this code in a file located at: /api/contact.js

// We're using the 'resend' library to send emails.
// You'll need to install it in your project if you're setting it up locally: npm install resend
import { Resend } from 'resend';

// Initialize Resend with your API key.
// IMPORTANT: Store your API key as an environment variable, not directly in the code.
// In Vercel, you'll add this under your project's Settings > Environment Variables.
const resend = new Resend(process.env.RESEND_API_KEY);

// This is the main function that handles incoming requests to /api/contact
export default async function handler(req, res) {
  // We only want to handle POST requests, which is what the form sends.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extract the data sent from the frontend form
    const { name, email, serviceType, message } = req.body;

    // Basic validation to make sure the essential fields aren't empty
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    // --- Email 1: Notification to your business ---
    // This email is sent to you to let you know you have a new inquiry.
    await resend.emails.send({
      from: 'onboarding@resend.dev', // This is a required sender for Resend's free plan
      to: 'kontakt@dgstadning.se', // YOUR business email address
      subject: `Ny förfrågan från ${name} - D&G Städning`,
      html: `
        <h1>Ny kundförfrågan</h1>
        <p>Du har fått en ny förfrågan via din hemsida.</p>
        <p><strong>Namn:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Önskad tjänst:</strong> ${serviceType}</p>
        <hr>
        <p><strong>Meddelande:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // --- Email 2: Confirmation to the customer ---
    // This email is sent to the person who filled out the form.
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email, // The customer's email address
      subject: 'Tack för din förfrågan hos D&G Städning!',
      html: `
        <h1>Vi har tagit emot ditt meddelande!</h1>
        <p>Hej ${name},</p>
        <p>Tack för att du kontaktat oss på D&G Städning. Vi har tagit emot din förfrågan och återkommer till dig så snart som möjligt, vanligtvis inom en arbetsdag.</p>
        <br>
        <p>Med vänliga hälsningar,</p>
        <p><strong>Teamet på D&G Städning</strong></p>
      `,
    });

    // Send a success response (HTTP 200) back to the frontend to let it know everything worked.
    return res.status(200).json({ message: 'Message sent successfully!' });

  } catch (error) {
    // If anything goes wrong during the process, log the error for debugging...
    console.error('Error sending email:', error);
    // ...and send an error response (HTTP 500) back to the frontend.
    return res.status(500).json({ error: 'Something went wrong while sending the message.' });
  }
}
