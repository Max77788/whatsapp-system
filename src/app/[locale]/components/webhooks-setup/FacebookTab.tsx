"use client";

import { useTranslations } from "next-intl";

type FacebookTabProps = {
  tab?: string;
  uniqueId?: string | null;
};

export default function FacebookTab({ uniqueId }: FacebookTabProps) {
 
  const t = useTranslations("fbWebhooksSetup");

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
        1. {t("goOn")}&nbsp;
        <a href="https://make.com" target="_blank">
          Make.com
        </a>{" "}
        {t("andInsertTheScenarioWhichYouCanDownloadBelow")}
      </p>
      <a
        href="/static/webhook-scripts/blueprintFacebookWA.json"
        download
        className="bg-green-600 hover:bg-green-700 text-white hover:text-white px-4 py-2 rounded-md"
      >
        <button>{t("downloadFacebookMakecomScript")}</button>
      </a>
      <p>
        {t("follow")}{" "}
        <a
          href="https://developers.facebook.com/tools/lead-ads-testing"
          target="_blank"
        >
          {t("thisLink")}
        </a>{" "}
        {t("andFollowTheVideoTutorialAboveToSetupFormSubmissionAndMakecomScenario")}
      </p>
      <p>
        {t("grabTheWebhookUrlBelowAndInsertInSetMultipleVariablesModule")}
      </p>
      <p>
        <code>{`https://mom-ai-restaurant.lat/api/leads/register?unique_id=${uniqueId}&source=facebook`}</code>
      </p>
      <p className="text-center">
        {t("linkTheFieldsWhichReturnNameAndPhoneNumberOfYourLeadToTheRespectiveVariablesInTheSameSetMultipleVariablesModule")}
      </p>
      <p className="text-center text-xl font-bold">✅{t("done")}✅</p>
    </div>
  );
}
