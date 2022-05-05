export class AhError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AhError";
    }
}