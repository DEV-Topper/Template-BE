import { config } from "dotenv";

config();

export const googleID: string | undefined = process.env.GOOGLE_ID;
export const googleSecret: string | undefined = process.env.GOOGLE_SECRET;
export const googleRedirect: string | undefined =
  process.env.GOOGLE_REDIRECT_URL;
export const googleToken: string | undefined = process.env.GOOGLE_REFRESH_TOKEN;

export const port: number = +process.env.PORT!;
