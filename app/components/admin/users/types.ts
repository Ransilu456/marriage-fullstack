export interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  createdAt: string;
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  idVerified?: boolean;
  photoVerified?: boolean;
  trustScore?: number;
}
