"use client";

type FacebookTabProps = {
  tab?: string;
  uniqueId?: string | null;
};

export default function FacebookTab({ uniqueId }: FacebookTabProps) {

  return (
    <div className="flex flex-col items-center gap-5 bg-gray-100 rounded-lg p-5">
      <h1 className="text-center font-bold text-2xl mb-2">Facebook</h1>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/bqjN9yL3zao"
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
        href="/static/webhook-scripts/blueprintFacebookWA.json"
        download
        className="bg-green-600 hover:bg-green-700 text-white hover:text-white px-4 py-2 rounded-md"
      >
        <button>Download Facebook Make.com Script</button>
      </a>
      <p>
        2. Follow{" "}
        <a
          href="https://developers.facebook.com/tools/lead-ads-testing"
          target="_blank"
        >
          this link
        </a>{" "}
        and follow the video tutorial above to setup form submission and
        Make.com scenario
      </p>
      <p>
        3. Grab the webhook URL below and insert in "Set Multiple Variables"
        module (the second module):
      </p>
      <p>
        <code>{`https://mom-ai-restaurant.lat/api/leads/register?unique_id=${uniqueId}&source=facebook`}</code>
      </p>
      <p className="text-center">
        4. Link the fields which return name and phone number of your lead to
        the respective variables in the same "Set Multiple Variables" module
      </p>
      <p className="text-center text-xl font-bold">✅Done✅</p>
    </div>
  );
}
