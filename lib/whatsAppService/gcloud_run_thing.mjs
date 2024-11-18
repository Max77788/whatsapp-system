const { ServicesClient } = require('@google-cloud/run').v2;
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const projectId = process.env.GCP_PROJECT_ID || 'whatapp-system-app';
const region = process.env.GCP_REGION || 'europe-north1';
const serviceNamePrefix = 'wwebjs-';
const imageUri = process.env.CONTAINER_IMAGE_URI || 'gcr.io/whatapp-system-app/wwebjs-app-script:latest';

// Instantiate the Cloud Run client
const runClient = new ServicesClient();

async function createCloudRunService(uniqueId, APP_BASE_URL = "https://mom-ai-restaurant.lat") {
    // Generate a valid service ID
    const serviceId = `${serviceNamePrefix}${uniqueId}`
        .toLowerCase() // Ensure lowercase
        .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
        .replace(/^-+|-+$/g, '') // Remove leading or trailing hyphens
        .slice(0, 49); // Ensure it's less than 50 characters and does not exceed the limit

    const parent = `projects/${projectId}/locations/${region}`;

    const service = {
        template: {
            containers: [
                {
                    image: imageUri,
                    ports: [{ containerPort: 8080 }],
                    env: [
                        {
                            name: 'APP_BASE_URL',
                            value: APP_BASE_URL,
                        },
                        {
                            name: 'ACCOUNT_UNIQUE_ID',
                            value: uniqueId,
                        },
                    ],
                    resources: {
                        limits: {
                            memory: '2Gi',
                            cpu: '1',
                        },
                    },
                },
            ],
        },
    };

    try {
        console.log(`Creating Cloud Run service: ${serviceId}`);
        const [operation] = await runClient.createService({
            parent, // Specify the project and location
            serviceId, // Use valid service ID
            service, // Pass the service configuration
        });

        console.log(`Service ${serviceId} creation in progress...`);
        const [response] = await operation.promise(); // Wait for the operation to complete
        console.log(`Service ${serviceId} created successfully.`);

        // Enable unauthenticated access
        await enableUnauthenticatedAccess(serviceId);

        return response;
    } catch (error) {
        console.error(`Failed to create service ${serviceId}:`, error.message || error);
        return null;
    }
}

// Enable unauthenticated access to the service
async function enableUnauthenticatedAccess(serviceId) {
    const resource = `projects/${projectId}/locations/${region}/services/${serviceId}`;
    try {
        console.log(`Enabling unauthenticated access for service: ${serviceId}`);
        const [policy] = await runClient.getIamPolicy({ resource });

        // Add a binding for allUsers with the roles/run.invoker role
        policy.bindings = policy.bindings || [];
        policy.bindings.push({
            role: 'roles/run.invoker',
            members: ['allUsers'], // Grant access to all users
        });

        // Set the updated policy
        await runClient.setIamPolicy({ resource, policy });
        console.log(`Unauthenticated access enabled for service: ${serviceId}`);
    } catch (error) {
        console.error(`Failed to enable unauthenticated access for ${serviceId}:`, error.message || error);
    }
}

// Wait for a service to have an external endpoint ready
async function getCloudRunServiceUrl(serviceId) {
    const name = `projects/${projectId}/locations/${region}/services/${serviceId}`;
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
        try {
            const [service] = await runClient.getService({ name });

            const { uri } = service;
            if (uri) {
                console.log(`Cloud Run service URL: ${uri}`);
                return uri;
            }
        } catch (error) {
            console.error(`Error fetching Cloud Run service URL: ${error.message}`);
        }

        console.log(`Waiting for service ${serviceId} to have an external URL... (attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        retries++;
    }

    console.error(`Failed to retrieve the external URL for service ${serviceId} after ${maxRetries} attempts.`);
    return null;
}

// Example usage
export const obtainGoogleCloudRunURL = async (uniqueId) => {
    const service = await createCloudRunService(uniqueId);

    if (service) {
        const serviceUrl = await getCloudRunServiceUrl(`${serviceNamePrefix}${uniqueId}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .replace(/^-+|-+$/g, '')
            .slice(0, 49));
        if (serviceUrl) {
            console.log(`Service URL: ${serviceUrl}`);
        }
    }
};