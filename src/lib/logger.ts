/**
 * Simple logger utility for conditional logging based on silent mode
 */
export class Logger {
	private silent: boolean;

	constructor(silent: boolean = true) {
		this.silent = silent;
	}

	/**
	 * Log an info message (console.log)
	 */
	log(message?: any, ...optionalParams: any[]): void {
		if (!this.silent) {
			console.log(message, ...optionalParams);
		}
	}

	/**
	 * Log a warning message (console.warn)
	 */
	warn(message?: any, ...optionalParams: any[]): void {
		if (!this.silent) {
			console.warn(message, ...optionalParams);
		}
	}

	/**
	 * Log an error message (console.error)
	 */
	error(message?: any, ...optionalParams: any[]): void {
		if (!this.silent) {
			console.error(message, ...optionalParams);
		}
	}
}

/**
 * Create a logger instance
 */
export function createLogger(silent: boolean = true): Logger {
	return new Logger(silent);
}
