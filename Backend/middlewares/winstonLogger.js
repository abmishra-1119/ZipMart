import expressWinston from 'express-winston';
import winston from 'winston';

export const requestLogger = expressWinston.logger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.printf(({ level, message }) => {
                    return `${level}: ${message}`;
                })
            )
        }),

        new winston.transports.File({
            filename: "logs/requests.log",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ],

    // meta: false,

    msg: "HTTP {{req.method}} {{req.url}} - Status: {{res.statusCode}} - {{res.responseTime}}ms",

    expressFormat: false,
    colorize: false
});


export const errorLogger = expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.printf(({ level, message }) => {
                    return `${level}: ${message}`;
                })
            )
        }),

        new winston.transports.File({
            filename: "logs/errors.log",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ],

    // meta: false,
});