const Docker = require('dockerode');
const docker = new Docker();

export default async function triggerDockerWhatsAppClientCreation(uniqueId) {
    await docker.createContainer({
        Image: 'node', // The image name from your Dockerfile
        name: `wwebjs-${uniqueId}`,
        Env: [`ACCOUNT_UNIQUE_ID=${uniqueId}`],
        ExposedPorts: { '3000/tcp': {} },
        HostConfig: {
            PortBindings: { '3000/tcp': [{ HostPort: '3000' }] },
        },
    }).then(container => container.start());
}
