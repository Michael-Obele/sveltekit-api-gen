import { json } from '@sveltejs/kit';

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos
 *     description: Retrieve a list of all todos
 *     tags:
 *       - Todos
 *     responses:
 *       200:
 *         description: Successfully retrieved todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
export async function GET() {
	const todos = [
		{
			id: '1',
			title: 'Implement OpenAPI generator',
			completed: true,
			createdAt: new Date().toISOString()
		},
		{
			id: '2',
			title: 'Write documentation',
			completed: false,
			createdAt: new Date().toISOString()
		}
	];

	return json(todos);
}

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     description: Add a new todo to the list
 *     tags:
 *       - Todos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoInput'
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST({ request }) {
	const data = await request.json();

	if (!data.title) {
		return json({ message: 'Title is required', code: 'INVALID_INPUT' }, { status: 400 });
	}

	const newTodo = {
		id: Date.now().toString(),
		title: data.title,
		completed: data.completed ?? false,
		createdAt: new Date().toISOString()
	};

	return json(newTodo, { status: 201 });
}
