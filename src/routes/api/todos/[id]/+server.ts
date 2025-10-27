import { json, error } from '@sveltejs/kit';

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a todo by ID
 *     description: Retrieve a specific todo by its unique identifier
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The todo ID
 *     responses:
 *       200:
 *         description: Todo found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a todo
 *     description: Remove a todo by its ID
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The todo ID
 *     responses:
 *       204:
 *         description: Todo deleted successfully
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET({ params }) {
	// Mock data - in a real app, fetch from database
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

	const todo = todos.find((t) => t.id === params.id);

	if (!todo) {
		throw error(404, 'Todo not found');
	}

	return json(todo);
}

export async function DELETE({ params }) {
	// In a real app, delete from database
	return new Response(null, { status: 204 });
}
