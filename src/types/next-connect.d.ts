// src/types/next-connect.d.ts
declare module 'next-connect' {
    import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
    import type { IncomingMessage, ServerResponse } from 'http';
    type NextConnectHandler<Req = NextApiRequest, Res = NextApiResponse> =
      | NextApiHandler<Res>
      | ((req: Req, res: Res, next: (err?: any) => void) => void);
    interface NextConnect<Req = NextApiRequest, Res = NextApiResponse> {
      (req: Req, res: Res): Promise<void>;
      use: (
        handler:
          | NextConnectHandler<Req, Res>
          | { new (...args: any[]): any }
          | any
      ) => NextConnect<Req, Res>;
      get: (handler: NextConnectHandler<Req, Res>) => NextConnect<Req, Res>;
      post: (handler: NextConnectHandler<Req, Res>) => NextConnect<Req, Res>;
      // 必要に応じて put, delete などを追加
    }
    const nextConnect: () => NextConnect;
    export default nextConnect;
  }