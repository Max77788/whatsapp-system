"use client";

type ContactForm7TabProps = {
  tab?: string;
  uniqueId?: string | null;
};

export default function ContactForm7Tab({ uniqueId }: ContactForm7TabProps) {

  return (
    <div className="flex flex-col items-center gap-5 bg-gray-100 rounded-lg p-5">
      <h1 className="text-center font-bold text-2xl mb-2">Contact Form 7</h1>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/OxLNnjVoFS4"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>

      <p>
        1. Get{" "}
        <a href="https://wordpress.org/plugins/contact-form-7/" target="_blank">
          Contact Form 7
        </a>{" "}
        and{" "}
        <a
          href="https://wordpress.org/plugins/cf7-to-zapier/"
          target="_blank"
        >
          CF7 to Webhook
        </a>{" "}
        plugins for Wordpress
      </p>
      <p>
        2. Create the form and include required fields for name and phone
        number with IDs your_name and phone_number
      </p>
      <code>
        {`[text* your_name]`}
        <br />
        {`[tel* phone_number]`}
      </code>
      <p>
        3. Grab the webhook URL below and insert in "Webhook URL" field of
        "Webhook" section:
      </p>
      <p>
        <code>{`https://mom-ai-restaurant.lat/api/leads/register?unique_id=${uniqueId}&source=contact-forms7`}</code>
      </p>
      <p className="text-center">4. Save the changes and insert the form in your page</p>
      <p className="text-center text-xl font-bold">✅Done✅</p>
    </div>
  );
}
