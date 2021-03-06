import "express-session";
declare module "express-session" {
  export interface SessionData {
    referred: string;
    returnTo: string;
    secondFactor: string;
    flash: {
      info?: string[];
      success?: string[];
      error?: string[];
      warning?: string[];
    };
  }
}
