import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function convertPostmanToAPIDocs(collectionPath) {
  const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
  
  const apiDocs = {
    name: collection.info.name,
    description: collection.info.description,
    baseUrl: collection.variable?.find(v => v.key === 'baseUrl')?.value || '',
    endpoints: []
  };

  function processItems(items, parentPath = '') {
    items.forEach(item => {
      if (item.request) {
        const endpoint = {
          name: item.name,
          method: item.request.method,
          path: item.request.url.path ? '/' + item.request.url.path.join('/') : item.request.url.raw,
          description: item.request.description || '',
          headers: item.request.header || [],
          queryParams: item.request.url.query || [],
          body: item.request.body || null,
          examples: {
            request: item.request.body,
            response: item.response?.[0]?.body || null
          }
        };
        apiDocs.endpoints.push(endpoint);
      }
      
      if (item.item) {
        processItems(item.item, `${parentPath}/${item.name}`);
      }
    });
  }

  processItems(collection.item);
  
  return apiDocs;
}

// Usage
const collectionPath = join(__dirname, 'postman-collection.json');
const outputPath = join(__dirname, 'api-documentation.json');

const apiDocs = convertPostmanToAPIDocs(collectionPath);
fs.writeFileSync(outputPath, JSON.stringify(apiDocs, null, 2));
console.log('✅ API documentation generated at:', outputPath);