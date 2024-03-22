import {
    Controller,
    Get,
    Query,
    Route,
    Tags,
} from "tsoa";
import { LogService } from '../services/log.service';
import { LogsCronjobs } from "@prisma/client";

@Route("logs")
@Tags("Logs")
export class LogController extends Controller {
    /**
     * Get a list of cronjob logs.
     * @summary Get a list of cronjob logs
     * @param take the number of logs to return
     * @isInt take limit should be an integer value
     * @minimum take 1 must retrieve at least one item, set limit to > 0
     * @maximum take 1000 can only retrieve a maximum of 1000 items, set limit to <= 1000
     * 
     * @param page the page of logs to retrieve
     * @isInt page page should be an integer value
     * @minimum page 0 page may not be a negative value
     * 
     * @param fromTime (optional) only retrieve logs from a certain timestamp
     * @isDateTime fromTime should be a datetime object
     */
    @Get("/cronjobs")
    public async getCronjoblogs(
        @Query("limit") take = 300,
        @Query() page = 0,
        @Query() fromTime?: Date,
    ): Promise<LogsCronjobs[]> {
        return await LogService.getCronjobsLogs(take, page, fromTime);
    }
}