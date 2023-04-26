import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user: {
      readonly id: string;
      username: string;
    };
  }
}
