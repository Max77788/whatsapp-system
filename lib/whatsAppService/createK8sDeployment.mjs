// Import the function you want to test
import { createK8sDeployment } from './kubernetes_part.mjs';

// Example: we assume you have environment variables set for AVIV_SERVICE_ACCOUNT_BASE64, etc.

// We use a unique ID for testing
const testUniqueId = 'testadmin-7777';

try {
    // Call the function
    await createK8sDeployment(testUniqueId);
    
} catch (error) {
    
}
    
