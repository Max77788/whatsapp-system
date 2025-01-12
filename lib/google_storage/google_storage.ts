import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { google } from 'googleapis'; // Import Google Cloud SDK libraries

dotenv.config();

const SERVICE_ACCOUNT_BASE64 = process.env.AVIV_SERVICE_ACCOUNT_BASE64;
// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 'whatapp-system-app',
  credentials: JSON.parse(Buffer.from(SERVICE_ACCOUNT_BASE64!, 'base64').toString('utf-8')),
});
const bucketName = 'user-attachments-777'; // Replace with your GCS bucket name

/**
 * Uploads a file to Google Cloud Storage and returns a public URL.
 * @param {string} base64data - The Base64 encoded file data.
 * @param {string} fileName - The desired file name in the bucket.
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */
export async function uploadFile(base64data: string, fileName: string, contentType: string = 'image/png') {
  const bucket = storage.bucket(bucketName);
  
  // Extract file extension from the contentType (e.g., 'image/png' => '.png')
  const extension = `.${contentType.split('/')[1]}`;
  
  // Append the extension to fileName if not already present
  if (!fileName.endsWith(extension)) {
    fileName += extension;
  }

  const file = bucket.file(fileName);
  
  const buffer = Buffer.from(base64data, 'base64');

  await file.save(buffer, { contentType: contentType, public: true }); // Adjust contentType as needed

  // Make the file publicly accessible
  await file.makePublic();

  // Return the public URL
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}


/**
 * Deletes a file from Google Cloud Storage by its public URL.
 * @param {string} fileUrl - The public URL of the file.
 * @returns {Promise<void>} - Resolves when the file is deleted.
 */
export async function deleteFile(fileUrl: string) {
    const filePath = fileUrl.split('/').slice(4).join('/'); // Extract the file path from the URL
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
  
    await file.delete();
  }
  
  
export async function setupGoogleCloudCredentials() {
  // Ensure BASE64_GOOGLE_CREDENTIALS is set in the environment variables
  if (!SERVICE_ACCOUNT_BASE64) {
    console.error('Error: GOOGLE_STORAGE_ACC_BASE64 environment variable is not set.');
    process.exit(1);
  }
  
  try {
    // Decode the Base64 credentials
    const credentials = Buffer.from(SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
  
    // Parse the credentials to an object
    const credentialsObj = JSON.parse(credentials);
  
    // Configure the Google Cloud SDK client using the credentials object
    const auth = new google.auth.GoogleAuth({
      credentials: credentialsObj,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'], // Adjust scopes as needed
    });
  
    // Set the authentication globally (optional, depending on your use case)
    google.options({ auth });
  
    // console.log('Google Cloud credentials set up.');
  
    // Your code using Google Cloud services can go here
    // Example: const storage = google.storage('v1');
  } catch (error) {
    console.error('Error setting up Google Cloud credentials:', error);
    process.exit(1);
  }
}
