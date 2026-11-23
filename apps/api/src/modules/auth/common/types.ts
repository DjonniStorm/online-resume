export type TokenPayload = {
  sub: string;
  sid: string;
  type: 'access' | 'refresh';
  jti?: string;
};

export type AuthenticatedUser = {
  id: string;
  role: 'USER' | 'ADMIN';
};

export type AuthenticatedRequest = {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
};
