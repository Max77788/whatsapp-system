import { NextResponse } from 'next/server';
import { find_user } from '@/lib/utils';

export async function POST(req) {
    const { message, sender, clientId, uniqueId } = await req.json();      

    let respond_boolean = true;
    let user;
    user = await find_user({ unique_id: uniqueId })
  
    const phoneNumberTactics = user?.phoneNumberTactics;
   
    let name_tactics_to_use = [];
    const user_phone_number = user?.[`qrCode${clientId}`]?.phoneNumber;
    
    
    console.log("Starting tactic processing...");
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

    console.log("Text tactics list before flattening:", text_tactics_list);
    text_tactics_list = text_tactics_list.flatMap((tactic) => tactic.rows);
    console.log("Text tactics list after flattening:", text_tactics_list);

    const lead_platform = user?.leads?.find((lead) => lead.phoneNumber === user_phone_number)?.platform || "other";

    let reply, delay;
    text_tactics_list.forEach((tactic) => {
        if (tactic.type === "includes") {
            if (message.trim().toLowerCase().includes(tactic.search_term.trim().toLowerCase())) {
                if (!tactic.platforms.includes(lead_platform)) {
                    return;
                }

                
                reply = tactic.message_to_send;
                delay = tactic.delay;
                console.log(`Match found with 'includes': reply=${reply}, delay=${delay}`);
                return;
            }
        } else if (tactic.type === "starts with") {
            if (message.trim().toLowerCase().startsWith(tactic.search_term.trim().toLowerCase())) {
                reply = tactic.message_to_send;
                delay = tactic.delay;
                console.log(`Match found with 'starts with': reply=${reply}, delay=${delay}`);
                return;
            }
        }
    });

    if (!reply) {
        respond_boolean = false;
        console.log("No match found, setting respond_boolean to false");
    }

    console.log(`reply: ${reply}, delay: ${delay}, respond_boolean: ${respond_boolean}`);

  return NextResponse.json({reply, delay, respond_boolean: respond_boolean});
}