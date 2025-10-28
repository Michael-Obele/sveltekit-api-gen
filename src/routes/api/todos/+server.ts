import { json } from '@sveltejs/kit';
import { todoStore, type TodoInput } from '$lib/server/todos.svelte';

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos
 *     description: Retrieve a list of all todos from in-memory reactive state
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
	const todos = todoStore.getAll();
	return json(todos);
}

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     description: Add a new todo to the in-memory reactive state
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
	const data = (await request.json()) as TodoInput;

	if (!data.title || data.title.trim() === '') {
		return json({ message: 'Title is required', code: 'INVALID_INPUT' }, { status: 400 });
	}

	const newTodo = todoStore.create(data);
	return json(newTodo, { status: 201 });
}
