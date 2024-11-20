import k8s from '@kubernetes/client-node';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { InstancesClient } from '@google-cloud/compute';

const retryInterval = 5000; // 5 seconds retry interval
const maxRetries = 24; // Retry for 2 minutes

dotenv.config();

const compute = new InstancesClient();

// Decode the Base64-encoded kubeconfig and write to a temporary file
const kubeConfigBase64 = process.env.KUBECONFIG_BASE64;

const kubeConfigContent = Buffer.from(kubeConfigBase64, 'base64').toString('utf-8');

// Use tmp folder to store kubeconfig
const kubeConfigDir = path.join('tmp');
if (!fs.existsSync(kubeConfigDir)) {
    fs.mkdirSync(kubeConfigDir, { recursive: true });
}

const kubeConfigPath = path.join(kubeConfigDir, 'kubeconfig.yaml');
fs.writeFileSync(kubeConfigPath, kubeConfigContent);

process.env.KUBECONFIG = kubeConfigPath;

export async function createK8sDeployment(uniqueId, APP_BASE_URL = "https://mom-ai-restaurant.lat") {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(kubeConfigPath);

    const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
    const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
    const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);

    const namespace = 'default';
    const serviceName = `app-${uniqueId}`;
    const deploymentName = `app-${uniqueId}`;
    const ingressName = `app-${uniqueId}`;

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

    // Step 2: Create Service
    const service = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: { name: serviceName, namespace },
        spec: {
            selector: { app: deploymentName },
            ports: [{ protocol: 'TCP', port: 4000, targetPort: 4000 }],
            type: 'ClusterIP', // Service remains internal for Ingress
        },
    };

    try {
        await k8sCoreApi.createNamespacedService(namespace, service);
        console.log(`Service ${serviceName} created.`);
    } catch (error) {
        console.error(`Failed to create service: ${JSON.stringify(error.response?.body || error.message)}`);
        return null;
    }

    // Step 3: Create Ingress
    const ingress = {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
            name: ingressName,
            namespace,
            annotations: {
                'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
            },
        },
        spec: {
            ingressClassName: 'nginx', // Ensure this matches your Ingress Controller
            rules: [
                {
                    http: {
                        paths: [
                            {
                                path: '/',
                                pathType: 'Prefix',
                                backend: {
                                    service: {
                                        name: serviceName,
                                        port: { number: 4000 },
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
        },
    };

    try {
        await k8sNetworkingApi.createNamespacedIngress(namespace, ingress);
        console.log(`Ingress ${ingressName} created.`);
    } catch (error) {
        console.error(`Failed to create ingress: ${JSON.stringify(error.response?.body || error.message)}`);
        return null;
    }

    // Step 4: Wait for Ingress to be Assigned an External IP/Hostname
    let externalUrl = null;
    try {
        for (let retries = 0; retries < maxRetries; retries++) {
            const response = await k8sNetworkingApi.readNamespacedIngress(ingressName, namespace);
            const ingressStatus = response.body.status?.loadBalancer?.ingress;

            if (ingressStatus && ingressStatus.length > 0) {
                const ip = ingressStatus[0].ip;
                const hostname = ingressStatus[0].hostname;

                externalUrl = ip
                    ? `http://${ip}`
                    : hostname
                    ? `http://${hostname}`
                    : null;

                if (externalUrl) break;
            }

            console.log(`Waiting for Ingress to get an external IP/hostname... Retry ${retries + 1}/${maxRetries}`);
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }

        if (!externalUrl) throw new Error('Failed to fetch external URL for Ingress after retries.');
    } catch (error) {
        console.error(`Error retrieving Ingress external URL: ${error.response?.body || error.message}`);
        return null;
    }

    console.log(`Ingress available at: ${externalUrl}`);
    return externalUrl;
}

// Example usage
(async () => {
    const externalUrl = await createK8sDeployment('admin-la47');
    if (externalUrl) {
        console.log(`Deployed app at: ${externalUrl}`);
    } else {
        console.error('Deployment failed to generate a public URL.');
    }
})();
