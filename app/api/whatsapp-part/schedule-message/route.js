import { NextResponse } from 'next/server';
import { find_user, find_qr_id_by_phone, update_user } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/serverStuff';
import formidable from 'formidable';
import axios from 'axios';
import { uploadFile } from '@/lib/google_storage/google_storage';

export async function POST(req) {
    const session = await getServerSession(authOptions);

    const userEmail = session?.user?.email;

    try {
        // Parse the incoming form data
        const formData = await req.formData();

        
        const fromNumber = formData.get('fromNumber'); // Get the 'fromNumber' field
        const toNumbers = formData.get('toNumbers'); // Get the 'toNumbers' field
        const message = formData.get('message'); // Get the 'message' field
        const scheduleTime = formData.get('scheduleTime'); // Get the 'scheduleTime' field
        const timeZone = formData.get('timeZone'); // Get the 'timeZone' field
        const media = formData.get('media') || null; // Get the 'media' file or null if not present

        console.log(
            `fromNumber: ${fromNumber}, toNumbers: ${JSON.stringify(toNumbers)}, message: ${message}, scheduleTime: ${scheduleTime}, timeZone: ${timeZone}, media: ${media}`
        );

        let fileUrl = null;

        if (media !== null) {
            const buffer = Buffer.from(await media.arrayBuffer()); // Get the binary buffer
            const base64Content = buffer.toString('base64'); // Convert the buffer to Base64
            const fileName = `${Date.now()}-${media.originalFilename}`;
            fileUrl = await uploadFile(base64Content, fileName, media.type);
            console.log(`\n\n\nUploaded file to ${fileUrl}\n\n\n`);
        }

        const user = await find_user({ email: userEmail });
        const currentScheduledMessages = user.scheduledMessages || [];

        // Add new scheduled message to the user's record
        currentScheduledMessages.push({ fromNumber, toNumbers, message, scheduleTime, timeZone, mediaURL: fileUrl });

        const success = await update_user(
            { email: userEmail },
            { scheduledMessages: currentScheduledMessages }
        );

        if (success) {
            return NextResponse.json({ message: 'Message scheduled successfully!' }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Failed to schedule message' }, { status: 500 });
        }
    } catch (parseError) {
        console.error('Error processing form data:', parseError);
        return NextResponse.json({ error: 'Failed to schedule message' }, { status: 500 });
    }
}
