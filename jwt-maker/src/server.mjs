import express from 'express';
import safe from 'express-async-handler';
import helmet from 'helmet';
import swagger from 'swagger-jsdoc';
import swaggerGhi from "swagger-ui-dist"
import { makeFactory } from './token-create.mjs';
import { verifyFactory } from './token-verify.mjs';

const docApp = express();
const docPort = Number.parseInt(process.env.DOC_PORT) || 8081;
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Invoicify Token Service',
      version: '1.0.0',
    },
  },
  apis: ['./src/server.mjs']
};
const spec = swagger(swaggerOptions);
const swaggerUiAssetPath = swaggerGhi.getAbsoluteFSPath();
docApp.get('/api-docs.json', (_, res) => {
  res.json(spec);
});
docApp.use(express.static(swaggerUiAssetPath));
docApp.listen(docPort, () => console.log(`
📝 Serving documentation on port ${docPort}.
➡️ Open your browser to http://localhost:${docPort}, then change the URL in the
  EXPLORE input box from the Pet Store URL to
  http://localhost:${docPort}/api-docs.json.
`));

const app = express();
const port = Number.parseInt(process.env.PORT);
const jwt_secret = process.env.JWT_SECRET;
const makers = makeFactory(jwt_secret);
const verifiers = verifyFactory(jwt_secret);

app.use(helmet());
app.use(express.json());

/**
 * @openapi
 *
 *  components:
 *    schemas:
 *      Error:
 *        properties:
 *          message:
 *            type: string
 *            description: A message that describes the error.
 *      Token:
 *        properties:
 *          token:
 *            type: string
 *            description: The base64 encoded token.
 *      TokenCreationRequestV1:
 *        properties:
 *          claims:
 *            description: Key-value pairs to use in the claims section of the token.
 *            type: object
 *          options:
 *            type: object
 *            properties:
 *              expiresIn:
 *                description: A relative time expressed in values like '1d' or '5y'.
 *                type: string
 *              id:
 *                type: string
 *              notBefore:
 *                description: A relative time expressed in values like '1d' or '5y'.
 *                type: string
 *        required:
 *          - claims
 */

/**
 * @openapi
 *
 * /api/tokens:
 *   post:
 *     description: Generates a JWT token based on the service's secret.
 *     parameters:
 *       - in: header
 *         name: X-Service-Version
 *         schema:
 *           type: number
 *           enum:
 *             - 1.0
 *         required: true
 *     requestBody:
 *       description: The claims and options for the token.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/TokenCreationRequestV1'
 *     responses:
 *       200:
 *         description: A new token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       412:
 *         description: An unknown version number was passed through X-Service-Version
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/tokens', safe(async (req, res) => {
  const version = Number.parseFloat(req.headers['x-service-version']);
  const maker = makers(version);
  try {
    const token = await maker(req.body);
    res.json({ token });
  } catch (e) {
    console.error(`Error with version header ${version}`, req.body, e);
    res.status(412);
    res.json(e);
  }
}));

/**
 * @openapi
 *
 *  /api/tokens/valid:
 *    put:
 *      description: Test if a token is valid.
 *      parameters:
 *        - in: header
 *          name: X-Service-Version
 *          schema:
 *            type: number
 *            enum:
 *              - 1.0
 *          required: true
 *      requestBody:
 *        description: The JSON Web token
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Token'
 *      responses:
 *        200:
 *          description: It's a valid token from this service.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *        404:
 *          description: It is NOT a valid token from this service.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        412:
 *          description: An unknown version number was passed through X-Service-Version
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 */
app.put('/api/tokens/valid', safe(async (req, res) => {
  const version = Number.parseFloat(req.headers['x-service-version']);
  const verifier = verifiers(version);
  const { token } = req.body;
  try {
    const claims = await verifier(token);
    res.json({ claims });
  } catch (e) {
    console.error(`Error occurred in validation:`, e);
    res.status(e.code || 412);
    res.json({ message: e.message });
  }
}));

app.listen(port, () => console.log(`
⚙️ Now listening on ${port} for API calls.
`));
