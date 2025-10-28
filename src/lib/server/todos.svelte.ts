/**
 * Server-only state management for todos using Svelte 5 runes
 *
 * This is a .svelte.ts file which allows us to use runes ($state, $derived, etc.)
 * for reactive state management. While reactivity is primarily for UI, using runes
 * here demonstrates proper Svelte 5 patterns and makes the code more "native" to Svelte 5.
 *
 * Note: According to Svelte docs, we cannot directly export reassigned state.
 * Instead, we export an object containing the state, or use getter functions.
 *
 * This module can only be imported by server-side code.
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
 * Reactive state using Svelte 5 $state rune
 *
 * $state creates a deeply reactive proxy, meaning:
 * - Array methods like push, filter work reactively
 * - Property changes on todo objects are tracked
 * - Perfect for Svelte 5's reactive system
 *
 * We wrap it in an object to safely export it (can't directly export reassigned state)
 */
class TodoStore {
	todos = $state<Todo[]>([
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
	]);

	// Helper function to generate unique IDs
	private generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	}

	/**
	 * Get all todos (reactive)
	 */
	getAll(): Todo[] {
		return this.todos;
	}

	/**
	 * Get a todo by ID (reactive)
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

		// Direct property mutation works thanks to $state reactivity
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
	 * Get todos count (reactive)
	 */
	get count(): number {
		return this.todos.length;
	}
}

// Export a single instance - the state is shared across all imports
export const todoStore = new TodoStore();
