
import dynamic from 'next/dynamic';
import { getApiDocs } from '@/lib/swagger';
import 'swagger-ui-react/swagger-ui.css';

const customSorter = (method1: string, method2: string): number => {
  const priority: Record<string, number> = { post: 1, get: 2, put: 3, delete: 4 }; // Add other methods as needed
  return (priority[method1.toLowerCase()] || 99) - (priority[method2.toLowerCase()] || 99);
};


const SwaggerUI = dynamic(() => import('swagger-ui-react'));

const ApiDocsPage = () => {
  const swaggerOptions = {
    url: '/api-docs', // Replace with your OpenAPI JSON file URL
    docExpansion: 'none',
    sorter: customSorter, // Use the custom sorter here
  };

  const spec = getApiDocs();
  return ( 
  <div>
  <SwaggerUI spec={spec}  />;
  </div>
  )
};

export default ApiDocsPage;
