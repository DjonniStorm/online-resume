export type TokenPayload = {
  sub: string;
  sid: string;
  type: 'access' | 'refresh';
  jti?: string;
};
