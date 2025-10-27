/**
 * Shared OpenAPI component schemas
 *
 * Define reusable schemas here and reference them in your endpoints
 * using $ref: '#/components/schemas/SchemaName'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - completed
 *       properties:
 *         id:
 *           type: string
 *           description: Unique todo identifier
 *         title:
 *           type: string
 *           description: Todo title
 *         completed:
 *           type: boolean
 *           description: Whether the todo is completed
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *
 *     TodoInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Todo title
 *         completed:
 *           type: boolean
 *           description: Whether the todo is completed
 *           default: false
 *
 *     Error:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         code:
 *           type: string
 *           description: Error code
 *
 *   securitySchemes:
 *     apiKey:
 *       type: apiKey
 *       in: header
 *       name: X-API-Key
 */
