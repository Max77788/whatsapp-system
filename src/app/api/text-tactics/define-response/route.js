import { NextResponse } from 'next/server';
import { find_user, update_user } from '@/lib/utils';
import { generateResponse } from "@/lib/gpt_utils"

export async function POST(req) {
    const { message, sender, clientId, uniqueId, message_history } = await req.json();      

    const senderPhoneNumber = sender.split('@')[0];

    console.log(`message_history: ${message_history}`);
    
    // console.log(`senderPhoneNumber: ${senderPhoneNumber}`);
    
    let respond_boolean = true;
    let user;
    user = await find_user({ unique_id: uniqueId })
  
    const phoneNumberTactics = user?.phoneNumberTactics;
   
    let name_tactics_to_use = [];
    const user_phone_number = user?.[`qrCode${clientId}`]?.phoneNumber;

    let reply, delay=5;

    if (user?.greetingMessage?.isGreetingEnabled) {
        const formedMessage = `${user?.greetingMessage?.header}

${user?.greetingMessage?.bodyOptions.map((obj, index) => `${index + 1}. ${obj.option}`).join('\n')}

${user?.greetingMessage?.footer}
${user?.greetingMessage?.triggerWordMessage}: ${user?.greetingMessage?.triggerWord}`

        if (message_history && !(/\bUser:\s/.test(message_history))) {
            reply = formedMessage;
        } else if (message === user?.greetingMessage?.triggerWord) {
            reply = formedMessage;
        }

        user?.greetingMessage?.bodyOptions.forEach((obj, index) => {
            if (message === obj.option || message == index+1) {
                reply = obj.response;
                console.log(`reply Greeting Message: ${reply}`);
            }
        });
        
    }

    if (reply) {
        await update_user({email: user.email}, {sentMessages: user?.sentMessages || 0 + 1});
        return NextResponse.json({reply, delay, respond_boolean: true});
    }


    phoneNumberTactics.forEach((phoneNumberTactic) => {
        console.log(`Checking tactics for phone number: ${phoneNumberTactic.phoneNumber}`);
        if (phoneNumberTactic.phoneNumber === user_phone_number) {
            console.log(`Match found for user phone number: ${user_phone_number}`);
            phoneNumberTactic.tactics.forEach((tactic) => {
                console.log(`Evaluating tactic: ${tactic}`);
                if (tactic === "Do Nothing") {
                    console.log("Tactic is 'Do Nothing', setting respond_boolean to false");
                    respond_boolean = false;
                    return NextResponse.json({reply: "Do Nothing", respond_boolean: false});
                }
                name_tactics_to_use.push(tactic);
                console.log(`Added tactic to use: ${tactic}`);
            });
        }
    });




    console.log("Name tactics to use:", name_tactics_to_use);
    let message_logic_list = user?.messageLogicList;
    let text_tactics_list = [];

    name_tactics_to_use.forEach((name_tactic) => {
        console.log(`Processing name tactic: ${name_tactic}`);
        message_logic_list.forEach((message_logic) => {
            if (message_logic.name === name_tactic) {
                text_tactics_list.push(message_logic);
                console.log(`Added message logic to text tactics list: ${message_logic.name}`);
            }
        });
    });

    let flat_text_tactics_list = [];

    console.log("Text tactics list before flattening:", text_tactics_list);
    text_tactics_list.forEach((tactic) => {
        flat_text_tactics_list.push(tactic.rows);
    });
    console.log("Text tactics list after flattening:", flat_text_tactics_list);

    const lead_platform = user?.leads?.find((lead) => lead.phone_number.includes(senderPhoneNumber))?.source || "other";
    const lead_group = user?.leads?.find((lead) => lead.phone_number.includes(senderPhoneNumber))?.group || "other";

    console.log(`lead_platform: ${lead_platform}, lead_group: ${lead_group}`);
    
    let terminate_response = false;

    console.log("text_tactics_list: ", flat_text_tactics_list, "of type: ", typeof flat_text_tactics_list, "is array: ", Array.isArray(flat_text_tactics_list));
 
    const stable_text_tactics_list = flat_text_tactics_list;

    
    stable_text_tactics_list.forEach((tactics) => {
        tactics.forEach((tactic) => {
        console.log(`Checking tactic: ${JSON.stringify(tactic)}`);

        if (tactic.type === "includes") {
            if (new RegExp(`\\b${tactic.search_term.trim().toLowerCase()}\\b`).test(message.trim().toLowerCase())) {
                if (tactic.selectedGroups === undefined) {
                    tactic.selectedGroups = ["other"];
                }
                if (!tactic.platforms.includes(lead_platform) || !tactic.selectedGroups.includes(lead_group)) 
                {
                    console.log(`Tactic not applicable for lead_platform: ${lead_platform}, lead_group: ${lead_group}`);
                    terminate_response = true;
                    return;
                }

                
                reply = tactic.message_to_send;
                delay = tactic.delay;
                console.log(`Match found with 'includes': reply=${reply}, delay=${delay}`);
                return;
            }
        } else if (tactic.type === "starts with") {
            if (new RegExp(`\\b${tactic.search_term.trim().toLowerCase()}\\b`).test(message.trim().toLowerCase())) {
                if (!tactic.platforms.includes(lead_platform) || !tactic.selectedGroups.includes(lead_group)) {
                    console.log(`Tactic not applicable for lead_platform: ${lead_platform}, lead_group: ${lead_group}`);
                    terminate_response = true;
                    return;
                }

                reply = tactic.message_to_send;
                delay = tactic.delay;
                console.log(`Match found with 'starts with': reply=${reply}, delay=${delay}`);
                return;
            }
        }
            });
        });

    if (terminate_response) {
        console.log("Terminating response due to no applicable tactic");
        return NextResponse.json({reply: "Do Nothing", respond_boolean: false});
    }

    if (!reply && name_tactics_to_use.includes("Enable AI Auto Response") && user?.aiSystemConfig.isOn) {
        const instructions = `
        You are a whatsapp bot. Here are your instructions:
        ${user?.aiSystemConfig.instructions}
        Take into account the following message history:
        ${message_history}
        `
        
        reply = await generateResponse(message, user?.aiSystemConfig.instructions || "Respond politely to this whatsapp message.");
    }

    if (!reply) {
        respond_boolean = false;
        console.log("No match found, setting respond_boolean to false");
    }

    console.log(`reply: ${reply}, delay: ${delay}, respond_boolean: ${respond_boolean}`);

    if (respond_boolean) {
        await update_user({email: user.email}, {sentMessages: user?.sentMessages || 0 + 1});
    }

  return NextResponse.json({reply, delay, respond_boolean: respond_boolean});
}