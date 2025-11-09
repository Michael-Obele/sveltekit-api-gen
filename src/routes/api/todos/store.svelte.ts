/**
 * Server-only state management for todos
 *
 * This module provides reactive-like state management for todos.
 * State persists across requests until server restart.
 */

export interface Todo {
	id: string;
	title: string;
	completed: boolean;
	createdAt: string;
	updatedAt?: string;
}

export interface TodoInput {
	title: string;
	completed?: boolean;
}

/**
 * Simple state management class
 */
class TodoStore {
	private todos: Todo[] = [
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

	// Helper function to generate unique IDs
	private generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	}

	/**
	 * Get all todos
	 */
	getAll(): Todo[] {
		return [...this.todos]; // Return a copy
	}

	/**
	 * Get a todo by ID
	 */
	getById(id: string): Todo | undefined {
		return this.todos.find((todo) => todo.id === id);
	}

	/**
	 * Create a new todo
	 */
	create(input: TodoInput): Todo {
		const newTodo: Todo = {
			id: this.generateId(),
			title: input.title,
			completed: input.completed ?? false,
			createdAt: new Date().toISOString()
		};

		this.todos.push(newTodo);
		return newTodo;
	}

	/**
	 * Update an existing todo
	 */
	update(id: string, input: Partial<TodoInput>): Todo | null {
		const todo = this.todos.find((t) => t.id === id);

		if (!todo) {
			return null;
		}

		if (input.title !== undefined) {
			todo.title = input.title;
		}
		if (input.completed !== undefined) {
			todo.completed = input.completed;
		}
		todo.updatedAt = new Date().toISOString();

		return todo;
	}

	/**
	 * Delete a todo by ID
	 */
	delete(id: string): boolean {
		const initialLength = this.todos.length;
		this.todos = this.todos.filter((todo) => todo.id !== id);
		return this.todos.length < initialLength;
	}

	/**
	 * Clear all todos (useful for testing)
	 */
	clearAll(): void {
		this.todos = [];
	}

	/**
	 * Get todos count
	 */
	get count(): number {
		return this.todos.length;
	}
}

// Export a single instance - the state is shared across all imports
export const todoStore = new TodoStore();
