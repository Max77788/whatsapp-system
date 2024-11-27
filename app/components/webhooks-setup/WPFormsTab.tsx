"use client";

type WPFormsTabProps = {
  tab?: string;
  uniqueId?: string | null;
};

export default function WPFormsTab({ uniqueId }: WPFormsTabProps) {

  return (
    <div className="flex flex-col items-center gap-5 bg-gray-100 rounded-lg p-5">
      <h1 className="text-center font-bold text-2xl mb-2">WPForms</h1>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/_ncjFLXkEVM"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>

      <p>
        1. Go on{" "}
        <a href="https://make.com" target="_blank">
          Make.com
        </a>{" "}
        and insert the scenario which you can download below
      </p>
      <a
        href="/static/webhook-scripts/blueprintWpformsWA.json"
        download
        className="bg-green-600 hover:bg-green-700 text-white hover:text-white px-4 py-2 rounded-md"
      >
        <button>Download WPForms Make.com Script</button>
      </a>
      <p>
        2. Grab the webhook URL below and insert in "Set Multiple Variables"
        module (the penultimate module):
      </p>
      <p>
        <code>{`https://mom-ai-restaurant.lat/api/leads/register?unique_id=${uniqueId}&source=wpforms`}</code>
      </p>
      <p>3. Go on WPForms and in 'email notifications' insert<br></br><br></br>
                    - the mailhook created in Make.com as email recipient<br></br><br></br>
                    - 'newFormEntry' as email subject<br></br><br></br>
                    - and the following text in the body of the email:<br></br><br></br>
                    <code>{`"user_PhoneNumber": "{field_id='X'}", "user_Name": "{field_id='Y'}"/split`}</code></p>
                    <p>X - field_id of phone number</p>
                    <p>Y - field_id of name</p>
      <p className="text-center text-xl font-bold">✅Done✅</p>
    </div>
  );
}
