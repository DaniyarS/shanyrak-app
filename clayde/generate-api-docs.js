import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateMarkdownDocs(apiDocs) {
  let markdown = `# ${apiDocs.name} API Documentation\n\n`;
  markdown += `${apiDocs.description || 'API Documentation'}\n\n`;
  markdown += `**Base URL:** \`${apiDocs.baseUrl}\`\n\n`;
  markdown += `---\n\n`;

  apiDocs.endpoints.forEach(endpoint => {
    markdown += `## ${endpoint.name}\n\n`;
    markdown += `**${endpoint.method}** \`${endpoint.path}\`\n\n`;
    
    if (endpoint.description) {
      markdown += `${endpoint.description}\n\n`;
    }

    if (endpoint.queryParams?.length) {
      markdown += `### Query Parameters\n\n`;
      endpoint.queryParams.forEach(param => {
        markdown += `- \`${param.key}\`${param.description ? ` - ${param.description}` : ''}\n`;
      });
      markdown += `\n`;
    }

    if (endpoint.headers?.length) {
      markdown += `### Headers\n\n`;
      endpoint.headers.forEach(header => {
        if (header.key && !header.disabled) {
          markdown += `- \`${header.key}\`: ${header.value || ''}\n`;
        }
      });
      markdown += `\n`;
    }

    if (endpoint.body) {
      markdown += `### Request Body\n\n`;
      try {
        const bodyContent = endpoint.body.raw ? JSON.parse(endpoint.body.raw) : endpoint.body;
        markdown += `\`\`\`json\n${JSON.stringify(bodyContent, null, 2)}\n\`\`\`\n\n`;
      } catch (e) {
        markdown += `\`\`\`\n${endpoint.body.raw || JSON.stringify(endpoint.body)}\n\`\`\`\n\n`;
      }
    }

    if (endpoint.examples?.response) {
      markdown += `### Response Example\n\n`;
      try {
        const response = typeof endpoint.examples.response === 'string' 
          ? JSON.parse(endpoint.examples.response) 
          : endpoint.examples.response;
        markdown += `\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\`\n\n`;
      } catch (e) {
        markdown += `\`\`\`\n${endpoint.examples.response}\n\`\`\`\n\n`;
      }
    }

    markdown += `---\n\n`;
  });

  return markdown;
}

// Usage
const apiDocsPath = join(__dirname, 'api-documentation.json');
const outputPath = join(__dirname, 'API_DOCUMENTATION.md');

const apiDocs = JSON.parse(fs.readFileSync(apiDocsPath, 'utf8'));
const markdown = generateMarkdownDocs(apiDocs);
fs.writeFileSync(outputPath, markdown);
console.log('✅ Markdown documentation generated at:', outputPath);