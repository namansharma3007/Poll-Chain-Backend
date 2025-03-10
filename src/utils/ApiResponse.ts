export class ApiResponse<T> {
    public readonly statusCode: number;
    public readonly message: string;
    public readonly data?: T;
    public readonly success: boolean;

    constructor(statusCode: number, message: string = "Success", data?: T) {
        this.statusCode = statusCode;
        this.message = message;
        this.success = statusCode >= 200 && statusCode < 300;
        if(data) {
            this.data = data;
        }
    }

    public toJSON(): object {
        return {
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            success: this.success,
        };
    }
}