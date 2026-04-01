// src/config/winston.config.ts
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        // Redact sensitive fields ก่อน log
        winston.format((info) => {
          const sensitiveKeys = [
            'password', 'password_hash', 'authorization',
            'access_token', 'refresh_token', 'token',
            'secret', 'key', 'credit_card',
          ];
          const sanitize = (obj: any): any => {
            if (typeof obj !== 'object' || !obj) return obj;
            return Object.keys(obj).reduce((acc, key) => {
              const rawValue = obj[key];
              const sanitizedValue =
                typeof rawValue === 'object' ? sanitize(rawValue) : rawValue;
              acc[key] = sensitiveKeys.some(k => key.toLowerCase().includes(k))
                ? '[REDACTED]'
                : sanitizedValue;
              return acc;
            }, {} as any);
          };
          return sanitize(info);
        })(),
        process.env.NODE_ENV === 'development'
          ? winston.format.prettyPrint()
          : winston.format.json(),
      ),
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/security.log',
        level: 'warn',
      }),
    ] : []),
  ],
};
