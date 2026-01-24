export interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  createdAt: string;
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  idVerified?: boolean;
  trustScore?: number;
}
