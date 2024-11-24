"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import TablePopup from "../components/settings/TablePopup";
import { clientPromiseDb } from '@/lib/mongodb';
import { find_user } from '@/lib/utils';
import CreateClientButton from "../components/whatsapp-connection/createClientButton";
import PhoneNumberTacticsTable from "../components/settings/PhoneNumberTacticsTable";
import LeadsTable from "../components/settings/LeadsTable";

export default async function SettingsPage(): Promise<JSX.Element> {
    await loginIsRequiredServer();
    
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    const user = await find_user({ email: userEmail });
    const uniqueId = user?.unique_id;

    const initialData = (user?.messageLogicList && user.messageLogicList.length > 0) ? user.messageLogicList : [
      { type: "includes", search_term: "", message_to_send: "", delay: 5 },
    ];

    const initialTactics = (user?.phoneNumberTactics && user.phoneNumberTactics.length > 0) ? user.phoneNumberTactics : [
        { phoneNumber: "", tactics: [] }
    ];

    const leadsData = (user?.leads && user.leads.length > 0) ? user.leads : [
        {"name": "Name", "email": "example@example.com", "phone_number": "1234567890", "source": "unknown"}
    ];

    return (
        <div className="mt-5 flex flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-5">
                <h1 className="text-center font-bold text-2xl mb-2">Facebook</h1>
                <div className="flex flex-col items-center gap-5 bg-gray-100 rounded-lg p-5">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/bqjN9yL3zao" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    
                    <p>1. Go on <a href="https://make.com" target="_blank">Make.com</a> and insert the scenario which you can download below</p>
                    <a
                        href="/static/webhook-scripts/blueprintFacebookWA.json"
                        download
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                        <button>Download Facebook Make.com Script</button>
                    </a>
                    <p>2. Follow <a href="https://developers.facebook.com/tools/lead-ads-testing" target="_blank">this link</a> and follow the video tutorial above to setup form submission and Make.com scenario</p><br></br>
                    <p>3. Grab the webhook URL below and insert in "Set Multiple Variables" module(the second module):</p>
                    <p><code>{`https://mom-ai-restaurant.lat/api/leads/register?unique_id=${uniqueId}&source=facebook`}</code></p>
                    <p className="text-center">4. Link the fields which return name and phone number of your lead to the respective variables in the same "Set Multiple Variables" module</p>
                    <p className="text-center text-xl font-bold">✅Done✅</p>
                </div>
                <hr className="w-full"></hr>
                <h1 className="text-center font-bold text-2xl mb-2">Contact Form 7</h1>
                <div className="flex flex-col items-center gap-5 bg-gray-100 rounded-lg p-5">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/OxLNnjVoFS4" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    
                    <p>1. Get <a href="https://wordpress.org/plugins/contact-form-7/" target="_blank">Contact Form 7</a> and <a href="https://wordpress.org/plugins/cf7-to-zapier/" target="_blank">CF7 to Webhook</a> plugins for Wordpress</p>
                    <p>2. Create the form and include required fields for name and phone number with IDs your_name and phone_number</p>
                    <code>{`[text* your_name]`}<br></br>{`[tel* phone_number]`}</code>
                    <p>3. Grab the webhook URL below and insert in "Webhook URL" field of "Webhook" section:</p>
                    <p><code>{`https://mom-ai-restaurant.lat/api/leads/register?unique_id=${uniqueId}&source=contact-forms7`}</code></p>
                    <p className="text-center">4. Save the changes and insert the form in your page</p>
                    <p className="text-center text-xl font-bold">✅Done✅</p>
                </div>
                <hr className="w-full"></hr>
                <h1 className="text-center mt-5 font-bold text-2xl mb-2">WPForms</h1>
                <div className="flex flex-col items-center gap-5 bg-gray-100 rounded-lg p-5">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/_ncjFLXkEVM" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    
                    <p>1. Go on <a href="https://make.com" target="_blank">Make.com</a> and insert the scenario which you can download below</p>
                    <a
                        href="/static/webhook-scripts/blueprintWpformsWA.json"
                        download
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                        <button>Download WPForms Make.com Script</button>
                    </a>
                    <p>2. Grab the webhook URL below and insert in "Set Multiple Variables" module(the penultimate module):</p>
                    <p><code>{`https://mom-ai-restaurant.lat/api/leads/register?unique_id=${uniqueId}&source=wpforms`}</code></p>
                    
                    <p>3. Go on WPForms and in 'email notifications' insert<br></br><br></br>
                    - the mailhook created in Make.com as email recipient<br></br><br></br>
                    - 'newFormEntry' as email subject<br></br><br></br>
                    - and the following text in the body of the email:<br></br><br></br>
                    <code>{`{ "user_PhoneNumber": "{field_id="X"}", "user_Name": "{field_id="Y"}" }/split`}</code></p>
                    <p>X - field_id of phone number</p>
                    <p>Y - field_id of name</p>

                    <p className="text-center text-xl font-bold">✅Done✅</p>
                </div>
            </div>
        </div>
    );
};
