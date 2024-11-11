const k8s = require('@kubernetes/client-node');

export async function createK8sDeployment(uniqueId, APP_BASE_URL="http://localhost:3000") {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

    const deployment = {
        metadata: {
            name: `wwebjs-${uniqueId}`,
        },
        spec: {
            selector: { matchLabels: { app: `wwebjs-${uniqueId}` } },
            replicas: 1,
            template: {
                metadata: { labels: { app: `wwebjs-${uniqueId}` } },
                spec: {
                    containers: [
                        {
                            name: `whatsapp-container-${uniqueId}`,
                            image: 'gcr.io/whatapp-system-app/wwebjs-app-script',
                            env: [{ name: 'ACCOUNT_UNIQUE_ID', value: uniqueId }],
                            ports: [{ containerPort: 3000 }],
                        },
                    ],
                },
            },
        },
    };

    await k8sApi.createNamespacedDeployment('default', deployment);
    console.log(`Deployment wwebjs-${uniqueId} created.`);
}
