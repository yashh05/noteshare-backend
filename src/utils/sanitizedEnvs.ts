import dotenv from "dotenv";

dotenv.config();

interface ENV {
  dbUrl: string | undefined;
  port: number | undefined;
  saltRounds: number | undefined;
  jwtSecret: string | undefined;
}

interface CONFIG {
  dbUrl: string;
  port: number;
  saltRounds: number;
  jwtSecret: string;
}

const getConfig = (): ENV => {
  return {
    dbUrl: process.env.DB_URL,
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    saltRounds: process.env.PORT ? Number(process.env.SALT_ROUNDS) : undefined,
    jwtSecret: process.env.JWT_SECRET,
  };
};

const getSanitzedConfig = (config: ENV): CONFIG => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as CONFIG;
};

const config = getConfig();
const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
