import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = 'user-attachments-523'; // Replace with your GCS bucket name

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
    console.log(`File ${filePath} deleted successfully.`);
  }
  
// Example Usage
// deleteFile('https://storage.googleapis.com/your-bucket-name/example.png').catch(console.error);
  

// Example Usage
// uploadFile('base64EncodedDataHere', 'example.png').then(console.log).catch(console.error);
