//@ts-ignore
import MySQLTransport from 'winston-mysql';
import winston from 'winston';

const options = {
    host: process.env.MYSQL_HOST,
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    table: 'LogsCronjobs',
    fields: {level: 'level', meta: 'metadata', message: 'message', timestamp: 'timestamp'}
};

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
        new MySQLTransport(options),
    ],
});

export default logger;