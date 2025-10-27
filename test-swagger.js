import swaggerJsdoc from 'swagger-jsdoc';
import { readFileSync } from 'fs';

const files = [
	'src/routes/api/todos/+server.ts',
	'src/routes/api/todos/[id]/+server.ts'
];

for (const filePath of files) {
	console.log(`\n=== Testing ${filePath} ===`);
	const content = readFileSync(filePath, 'utf-8');

	console.log('File content length:', content.length);
	console.log('Has @swagger:', content.includes('@swagger'));

	try {
		const spec = swaggerJsdoc({
			definition: {
				openapi: '3.0.0',
				info: { title: 'Test', version: '1.0.0' }
			},
			apis: [filePath],
			failOnErrors: false
		});

		console.log('Spec paths:', Object.keys(spec.paths || {}));
		console.log('Path count:', Object.keys(spec.paths || {}).length);
	} catch (error) {
		console.error('Error:', error.message);
	}
}

