"use client";

import { useTranslations } from "next-intl";

type WPFormsTabProps = {
  tab?: string;
  uniqueId?: string | null;
};

export default function WPFormsTab({ uniqueId }: WPFormsTabProps) {
  const t = useTranslations("wpformsWebhooksSetup");
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
        1. {t("goOn")}&nbsp;
        <a href="https://make.com" target="_blank">
          Make.com
        </a>{" "}
        {t("andInsertTheScenarioWhichYouCanDownloadBelow")}
      </p>
      <a
        href="/static/webhook-scripts/blueprintWpformsWA.json"
        download
        className="bg-green-600 hover:bg-green-700 text-white hover:text-white px-4 py-2 rounded-md"
      >
        <button>{t("downloadWPFormsMakecomScript")}</button>
      </a>
      <p>
        2. {t("grabTheWebhookUrlBelowAndInsertInSetMultipleVariablesModule")}
        {t("module")} ({t("thePenultimateModule")}):
      </p>
      <p>
        <code>{`https://mom-ai-restaurant.lat/api/leads/register?unique_id=${uniqueId}&source=wpforms`}</code>
      </p>
      <p>3. {t("goOnWPFormsAndInEmailNotificationsInsert")}<br></br><br></br>
                    - {t("theMailhookCreatedInMakecomAsEmailRecipient")}<br></br><br></br>
                    - {t("newFormEntryAsEmailSubject")}<br></br><br></br>
                    - {t("andTheFollowingTextInTheBodyOfTheEmail")}:<br></br><br></br>
                    <code>{`"user_PhoneNumber": "{field_id='X'}", "user_Name": "{field_id='Y'}"/split`}</code></p>
                    <p>{t("xFieldIdOfPhoneNumber")}</p>
                    <p>{t("yFieldIdOfName")}</p>
      <p className="text-center text-xl font-bold">✅{t("done")}✅</p>
    </div>
  );
}
