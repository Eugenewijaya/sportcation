export type AuthenticatedUser = {
  id: string;
  sessionId: string;
  tokenId: string;
  role: 'guest' | 'user' | 'partner' | 'admin';
  authProvider: string;
  email?: string | null;
  phone?: string | null;
};

export type AuthenticatedRequest = {
  user?: AuthenticatedUser;
};
