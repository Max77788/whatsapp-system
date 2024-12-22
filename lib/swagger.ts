import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api', // Adjust if your API routes are elsewhere
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Bumby API Documentation',
        version: '1.0.0',
      },
    },
  });
  return spec;
};
