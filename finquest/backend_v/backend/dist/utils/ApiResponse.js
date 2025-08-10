export class ApiResponse {
    success;
    message;
    data;
    constructor(message, data, success = true) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}
