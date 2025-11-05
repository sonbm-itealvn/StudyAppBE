import 'dotenv/config'

export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/learn_app',
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://192.168.0.45:8081',
  CORS_ALLOW_CREDENTIALS: process.env.CORS_ALLOW_CREDENTIALS === 'true'
}
