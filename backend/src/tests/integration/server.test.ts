import { StatusCodes } from "http-status-codes";
import { agent as request } from "supertest";
import app from "../../app";

export const agent = request(app);

it("should return NOT FOUND on requesting non-existing route", async () => {
    await agent
        .get('/non-existing-url')
        .expect(StatusCodes.NOT_FOUND)
})