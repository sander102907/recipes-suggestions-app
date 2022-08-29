import fs from "fs";
import path from "path";

export default class FileHelper {
    /**
     * Write file to disk without overwriting already existing files
     * @param filePath to write file to
     * @param buffer of the file (file content)
     * @param attempt retry mechanism in case file path already exists
     * @returns path file is written to (can be different than given file path in case of duplicate file paths)
     */
    static writeFile(filePath: string, buffer: Buffer, attempt = 0): string {
        let writePath = filePath;

        if (attempt != 0) {
            writePath = path.join(path.dirname(filePath), `${path.parse(filePath).name} (${attempt})${path.extname(filePath)}`);
        }

        try {
            fs.writeFileSync(writePath, buffer, { flag: "wx" })
        } catch (err) {
            console.log(err);
            return FileHelper.writeFile(filePath, buffer, attempt + 1)
        }

        return writePath;
    }

    /**
     * Append to a file on disk or create the file if it does not exist yet
     * @param filePath to write file to
     * @param content of the file
     */
    static appendFile(filePath: string, content: string) {
        const dirPath = path.dirname(filePath);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        try {
            fs.writeFileSync(filePath, content, { flag: "a+" });
        } catch (err) {
            console.log(err);
        }
    }
}