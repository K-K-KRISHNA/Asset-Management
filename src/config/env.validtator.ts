import * as Joi from 'joi';

export const envValidator = Joi.object({
  DB_PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNC: Joi.boolean().default(true),
  AUTO_LOAD: Joi.boolean().default(true),
  // Auth Specific
  JWT_TOKEN_SECRET: Joi.string().min(10).required(), // secret should not be too short
  JWT_TOKEN_EXPIRESIN: Joi.number().positive().required(), // must be > 0
  JWT_TOKEN_AUDIENCE: Joi.string().uri().required(),
  JWT_TOKEN_ISSUER: Joi.string().uri().required(),
});
