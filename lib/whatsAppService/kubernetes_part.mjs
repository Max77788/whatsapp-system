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

    // Create API clients
    const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api); // Apps API for Deployments
    const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api); // Core API for Services
    const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api); // Networking API for Ingresses

    const namespace = 'default';
    const serviceName = `wwebjs-${uniqueId}`;
    const deploymentName = `wwebjs-${uniqueId}`;

    // Step 1: Define and create the Deployment
    const deployment = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
            name: deploymentName,
            namespace: namespace,
        },
        spec: {
            replicas: 2,
            selector: {
                matchLabels: {
                    app: deploymentName,
                },
            },
            template: {
                metadata: {
                    labels: {
                        app: deploymentName,
                    },
                },
                spec: {
                    containers: [
                        {
                            name: 'app-container',
                            image: 'your-image-name:latest', // Replace with your container image
                            ports: [
                                {
                                    containerPort: 8080, // The port your app runs on
                                },
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
        console.error(`Failed to create deployment ${deploymentName}:`, error.response?.body || error);
        return null;
    }

    // Step 2: Wait for Deployment to Become Ready
    try {
        let deploymentReady = false;
        const maxRetries = 15;
        let retries = 0;

        while (retries < maxRetries) {
            const response = await k8sAppsApi.readNamespacedDeployment(deploymentName, namespace);
            const availableReplicas = response.body.status.availableReplicas || 0;
            if (availableReplicas >= 2) {
                deploymentReady = true;
                break;
            }
            console.log(`Waiting for deployment ${deploymentName} to become ready... (attempt ${retries + 1}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
            retries++;
        }

        if (!deploymentReady) {
            console.error(`Deployment ${deploymentName} did not become ready after ${maxRetries} attempts.`);
            return null;
        }
    } catch (error) {
        console.error(`Error while checking deployment status:`, error.response?.body || error);
        return null;
    }

    // Step 3: Define and create the Service
    const service = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: serviceName,
            namespace: namespace,
        },
        spec: {
            selector: {
                app: deploymentName, // Match the pods created by the deployment
            },
            ports: [
                {
                    protocol: 'TCP',
                    port: 80, // The port the service will expose
                    targetPort: 8080, // The port the container listens on
                },
            ],
            type: 'ClusterIP', // Service type, can be LoadBalancer or NodePort if needed
        },
    };

    try {
        await k8sCoreApi.createNamespacedService(namespace, service);
        console.log(`Service ${serviceName} created.`);
    } catch (error) {
        console.error(`Failed to create service ${serviceName}:`, error.response?.body || error);
        return null;
    }

    // Step 4: Define and create the Ingress
    const ingress = {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
            name: serviceName,
            namespace: namespace,
            annotations: {
                'kubernetes.io/ingress.class': 'nginx', // Use correct ingress class
            },
        },
        spec: {
            rules: [
                {
                    http: {
                        paths: [
                            {
                                path: '/', // Match all paths
                                pathType: 'Prefix',
                                backend: {
                                    service: {
                                        name: serviceName, // Match the service name
                                        port: { number: 80 }, // Exposed service port
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
        console.log(`Ingress ${serviceName} created.`);

        // Step 5: Wait and retrieve the external IP address
        let ingressIp = null;
        const maxRetriesIngress = 10;
        let retriesIngress = 0;

        while (retriesIngress < maxRetriesIngress) {
            const response = await k8sNetworkingApi.readNamespacedIngress(serviceName, namespace);
            const status = response.body.status;

            if (status && status.loadBalancer && status.loadBalancer.ingress && status.loadBalancer.ingress.length > 0) {
                ingressIp = status.loadBalancer.ingress[0].ip || status.loadBalancer.ingress[0].hostname;
                break; // Exit the loop when an IP is found
            }

            console.log(`Waiting for external IP address... (attempt ${retriesIngress + 1}/${maxRetriesIngress})`);
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
            retriesIngress++;
        }

        if (ingressIp) {
            console.log(`External IP address for ingress ${serviceName}: ${ingressIp}`);
            return ingressIp;
        } else {
            console.error(`Failed to retrieve the external IP address for ingress ${serviceName} after ${maxRetriesIngress} attempts.`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to create ingress ${serviceName}:`, error.response?.body || error);
        return null;
    }
}

// Example usage
const IP = await createK8sDeployment('max-matroninnet-ff6c', "https://mom-ai-restaurant.lat/");

console.log(`IP: ${IP}`);