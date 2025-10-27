declare module 'swagger-jsdoc' {
	interface Options {
		definition: {
			openapi: string;
			info: any;
			[key: string]: any;
		};
		apis: string[];
		failOnErrors?: boolean;
	}

	function swaggerJsdoc(options: Options): any;

	export = swaggerJsdoc;
}
