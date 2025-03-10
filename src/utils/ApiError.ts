export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errors: any[];
    public readonly data: any;
    public readonly success: boolean;

    constructor(
        statusCode: number,
        message: string = "Internal Server Error!",
        errors: any[] = [],
        stack?: string
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = false;
        this.data = null;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    public toJSON(): object {
        return {
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
            success: this.success,
            data: this.data,
            stack: this.stack,
        };
    }
}