import k8s from '@kubernetes/client-node';
import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

// Decode the Base64-encoded kubeconfig and write to a temporary file
const kubeConfigBase64 = process.env.KUBECONFIG_BASE64;
const kubeConfigContent = Buffer.from(kubeConfigBase64, 'base64').toString('utf-8');

// Use os.tmpdir() for a cross-platform temporary directory
const kubeConfigDir = path.join(os.tmpdir(), 'kubeconfig');
if (!fs.existsSync(kubeConfigDir)) {
    fs.mkdirSync(kubeConfigDir, { recursive: true });
}

const kubeConfigPath = path.join(kubeConfigDir, 'kubeconfig');
fs.writeFileSync(kubeConfigPath, kubeConfigContent);

// Set the KUBECONFIG environment variable to point to the temporary kubeconfig file
// process.env.KUBECONFIG = kubeConfigPath;

export async function createK8sDeployment(uniqueId, APP_BASE_URL = "https://whatsapp-system-aviv-8gqflrxk8-max77788s-projects.vercel.app/") {
    // Initialize Kubernetes client using the kubeconfig file
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(kubeConfigPath); // Load kubeconfig from the decoded file

    const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

    // Define deployment configuration
    const deployment = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: `wwebjs-${uniqueId}` },
        spec: {
            replicas: 1,
            selector: { matchLabels: { app: `wwebjs-${uniqueId}` } },
            template: {
                metadata: { labels: { app: `wwebjs-${uniqueId}` } },
                spec: {
                    containers: [
                        {
                            name: `whatsapp-container-${uniqueId}`,
                            image: 'gcr.io/whatapp-system-app/wwebjs-app-script:latest',
                            env: [
                                { name: 'ACCOUNT_UNIQUE_ID', value: uniqueId },
                                { name: 'APP_BASE_URL', value: APP_BASE_URL }
                            ],
                            ports: [{ containerPort: 3000 }],
                            resources: {
                                requests: {
                                    cpu: '250m',
                                    memory: '1Gi'
                                },
                                limits: {
                                    'ephemeral-storage': '1Gi'
                                },
                            },
                        },
                    ],
                    tolerations: [
                        {
                            key: "cloud.google.com/gke-quick-remove",
                            operator: "Exists",
                            effect: "NoSchedule"
                        },
                    ],
                },
            },
        },
    };

    // Create the deployment in the 'default' namespace
    try {
        await k8sApi.createNamespacedDeployment('default', deployment);
        console.log(`Deployment wwebjs-${uniqueId} created.`);
        return true;
    } catch (error) {
        console.error(`Failed to create deployment wwebjs-${uniqueId}:`, error.response?.body || error);
        return false;
    }
}

// Example usage
// createK8sDeployment('max-matroninnet-ff6c', "https://whatsapp-system-aviv-8gqflrxk8-max77788s-projects.vercel.app/");
