import k8s from '@kubernetes/client-node';
import dotenv from 'dotenv';
import { update_user } from '../utils';

dotenv.config();

const retryInterval = 5000; // 5 seconds retry interval
const maxRetries = 24; // Retry for 2 minutes

// Decode the Base64-encoded kubeconfig
const kubeConfigBase64 = process.env.KUBECONFIG_BASE64;
const kubeConfigContent = Buffer.from(kubeConfigBase64, 'base64').toString('utf-8');

export async function createK8sDeployment(uniqueId, APP_BASE_URL = "https://mom-ai-restaurant.lat") {
    const kc = new k8s.KubeConfig();

    // Load the kubeconfig from the string content
    kc.loadFromString(kubeConfigContent);

    const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
    const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

    const namespace = 'default';
    const serviceName = `app-${uniqueId}`;
    const deploymentName = `app-${uniqueId}`;

    // Step 1: Create Deployment
    const deployment = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: deploymentName, namespace },
        spec: {
            replicas: 1,
            selector: { matchLabels: { app: deploymentName } },
            template: {
                metadata: { labels: { app: deploymentName } },
                spec: {
                    containers: [
                        {
                            name: 'app-container',
                            image: 'gcr.io/whatapp-system-app/wwebjs-app-script:latest',
                            ports: [{ containerPort: 4000 }],
                            resources: {
                                requests: {
                                    cpu: '300m',
                                    memory: '1Gi',
                                },
                                limits: {
                                    cpu: '800m',
                                    memory: '2Gi',
                                },
                            },
                            env: [
                                { name: 'APP_BASE_URL', value: APP_BASE_URL },
                                { name: 'ACCOUNT_UNIQUE_ID', value: uniqueId },
                            ],
                        },
                    ],
                },
            },
        },
    };

    try {
        await k8sAppsApi.createNamespacedDeployment(namespace, deployment);
        console.log(`Deployment ${deploymentName} created.`);
    } catch (error) {
        console.error(`Failed to create deployment: ${JSON.stringify(error.response?.body || error.message)}`);
        return null;
    }

    // Step 2: Create Service with LoadBalancer
    const service = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: { name: serviceName, namespace },
        spec: {
            selector: { app: deploymentName },
            ports: [{ protocol: 'TCP', port: 4000, targetPort: 4000 }],
            type: 'LoadBalancer', // Expose the app externally
        },
    };

    try {
        await k8sCoreApi.createNamespacedService(namespace, service);
        console.log(`Service ${serviceName} with LoadBalancer created.`);
    } catch (error) {
        console.error(`Failed to create service: ${JSON.stringify(error.response?.body || error.message)}`);
        return null;
    }

    // Step 3: Wait for LoadBalancer to Assign an External IP/Hostname
    let externalUrl = null;
    try {
        for (let retries = 0; retries < maxRetries; retries++) {
            const response = await k8sCoreApi.readNamespacedService(serviceName, namespace);
            const ingressStatus = response.body.status?.loadBalancer?.ingress;

            if (ingressStatus && ingressStatus.length > 0) {
                const ip = ingressStatus[0].ip;
                const hostname = ingressStatus[0].hostname;

                externalUrl = ip
                    ? `http://${ip}:4000`
                    : hostname
                    ? `http://${hostname}:4000`
                    : null;

                if (externalUrl) break;
            }

            console.log(`Waiting for LoadBalancer to get an external IP/hostname... Retry ${retries + 1}/${maxRetries}`);
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }

        if (!externalUrl) throw new Error('Failed to fetch external URL for LoadBalancer after retries.');
    } catch (error) {
        console.error(`Error retrieving LoadBalancer external URL: ${error.response?.body || error.message}`);
        return null;
    }

    const success = await update_user({ unique_id: uniqueId }, { kbAppBaseUrl: externalUrl });
    
    return success;
}