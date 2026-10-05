import fs from 'node:fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import config from '../../Config.js';

// Publica openapi.yaml en /api/docs (interfaz) y /api/openapi.json (especificación).
export function montarDocumentacion(app) {
  const documento = YAML.parse(fs.readFileSync(config.rutas.openapi, 'utf8'));
  app.get('/api/openapi.json', (req, res) => res.json(documento));
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(documento, { customSiteTitle: 'PROYECTADAS · API' }),
  );
}
