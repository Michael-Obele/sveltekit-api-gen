import { json, error } from '@sveltejs/kit';
import { todoStore, type TodoInput } from '$lib/server/todos.svelte';

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a todo by ID
 *     description: Retrieve a specific todo by its unique identifier from in-memory reactive state
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
 *   put:
 *     summary: Update a todo
 *     description: Update an existing todo by its ID using reactive state
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoInput'
 *     responses:
 *       200:
 *         description: Todo updated successfully
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
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a todo
 *     description: Remove a todo by its ID from in-memory reactive state
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
	const todo = todoStore.getById(params.id);

	if (!todo) {
		throw error(404, 'Todo not found');
	}

	return json(todo);
}

export async function PUT({ params, request }) {
	const data = (await request.json()) as Partial<TodoInput>;

	if (data.title !== undefined && data.title.trim() === '') {
		return json({ message: 'Title cannot be empty', code: 'INVALID_INPUT' }, { status: 400 });
	}

	const updatedTodo = todoStore.update(params.id, data);

	if (!updatedTodo) {
		throw error(404, 'Todo not found');
	}

	return json(updatedTodo);
}

export async function DELETE({ params }) {
	const deleted = todoStore.delete(params.id);

	if (!deleted) {
		throw error(404, 'Todo not found');
	}

	return new Response(null, { status: 204 });
}
