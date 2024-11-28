import k8s from '@kubernetes/client-node';
import dotenv from 'dotenv';
import { GoogleAuth } from 'google-auth-library';

dotenv.config();

const retryInterval = 5000; // 5 seconds retry interval
const maxRetries = 24; // Retry for 2 minutes

// Step 1: Retrieve the Access Token Dynamically
async function getAccessToken() {
    const base64ServiceAccount = process.env.SERVICE_ACCOUNT_BASE64;

    if (!base64ServiceAccount) {
        throw new Error("SERVICE_ACCOUNT_BASE64 is not set");
    }

    // Decode Base64 string to JSON
    const serviceAccountJson = JSON.parse(
        Buffer.from(base64ServiceAccount, 'base64').toString('utf-8')
    );

    const auth = new GoogleAuth({
        credentials: serviceAccountJson,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    return accessToken.token;
}

// Step 2: Configure Kubernetes Client with Dynamic Token
async function configureKubeClient() {
    const token = await getAccessToken();

    // Define kubeconfig dynamically
    const kubeConfigContent = {
        "apiVersion": "v1",
        "clusters": [
            {
                "name": "gke_whatapp-system-app_europe-north1_autopilot-cluster-1",
                "cluster": {
                    "certificate-authority-data": process.env.CA_CERT_BASE64,
                    "server": "https://34.88.170.30"
                }
            }
        ],
        "contexts": [
            {
                "name": "gke_whatapp-system-app_europe-north1_autopilot-cluster-1",
                "context": {
                    "cluster": "gke_whatapp-system-app_europe-north1_autopilot-cluster-1",
                    "user": "gke_whatapp-system-app_europe-north1_autopilot-cluster-1"
                }
            }
        ],
        "current-context": "gke_whatapp-system-app_europe-north1_autopilot-cluster-1",
        "kind": "Config",
        "preferences": {},
        "users": [
            {
                "name": "gke_whatapp-system-app_europe-north1_autopilot-cluster-1",
                "user": {
                    "token": token
                }
            }
        ]
    };

    const kc = new k8s.KubeConfig();
    kc.loadFromString(JSON.stringify(kubeConfigContent));

    return {
        k8sAppsApi: kc.makeApiClient(k8s.AppsV1Api),
        k8sCoreApi: kc.makeApiClient(k8s.CoreV1Api),
    };
}

// Step 3: Deployment Function
export async function createK8sDeployment(uniqueId, APP_BASE_URL = "https://mom-ai-restaurant.lat") {
    const { k8sAppsApi, k8sCoreApi } = await configureKubeClient();

    const namespace = 'default';
    const serviceName = `app-${uniqueId}`;
    const deploymentName = `app-${uniqueId}`;

    // Deployment spec
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

    // Service spec
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
}

export async function retrieveK8sDeploymentUrl(uniqueId) {
    console.log(`Starting retrieveK8sDeploymentUrl for uniqueId: ${uniqueId}`);
    
    const namespace = 'default';
    console.log(`Namespace set to: ${namespace}`);
    
    const serviceName = `app-${uniqueId}`;
    console.log(`Service name constructed as: ${serviceName}`);

    const { k8sCoreApi } = await configureKubeClient();
    console.log(`Kubernetes client configured.`);

    // Wait for LoadBalancer to Assign an External IP/Hostname
    let externalUrl = null;
    console.log(`Attempting to read namespaced service: ${serviceName} in namespace: ${namespace}`);
    
    
        const response = await k8sCoreApi.readNamespacedService(serviceName, namespace);
        console.log(`Service response received: ${JSON.stringify(response.body)}`);
        
        const ingressStatus = response.body.status?.loadBalancer?.ingress;
        console.log(`Ingress status: ${JSON.stringify(ingressStatus)}`);

    if (ingressStatus && ingressStatus.length > 0) {
        const ip = ingressStatus[0].ip;
        const hostname = ingressStatus[0].hostname;
        console.log(`Ingress IP: ${ip}, Hostname: ${hostname}`);

        externalUrl = ip
            ? `http://${ip}:4000`
            : hostname
            ? `http://${hostname}:4000`
            : null;
            console.log(`External URL determined as: ${externalUrl}`);
        }

    console.log(`Returning external URL: ${externalUrl}`);
    return externalUrl;
}
