/**
 * File parameters to create/update a file entity
 */

export default interface FileParams {
    /**
     * The path where the file is stored on disk
     */
    path: string;

    /**
     * The mimetype of the file
     * @example "image/png"
     */
    mimetype: string;

    /**
     * The creation date of the file (within the application)
     */
    createdAt: Date;

    /**
     * The size of the file in bytes
     * @isInt size should be an integer value, it represents size of the file in the number of bytes
     */
    size: number;
}
