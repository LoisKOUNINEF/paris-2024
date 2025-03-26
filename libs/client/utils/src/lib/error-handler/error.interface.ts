export interface ApiError {
	statusCode: number;
	message: string;
	error: string;
	msg: string;
}

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR'
}

export interface ErrorConfig {
	type: ErrorType;
	displayMessage: string;
}
