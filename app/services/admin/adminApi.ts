export async function fetchAdminUsers() {
  const res = await fetch('/api/admin/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchIdentityVerifications(status: string = 'PENDING', page: number = 1) {
  const res = await fetch(`/api/admin/identity?status=${status}&page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch identity verifications');
  return res.json();
}

export async function fetchPhotoVerifications(status: string = 'PENDING', page: number = 1) {
  const res = await fetch(`/api/admin/verify/photos?status=${status}&page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch photo verifications');
  return res.json();
}

export async function fetchProposals(status?: string, page: number = 1) {
  let url = `/api/admin/proposals?page=${page}`;
  if (status) url += `&status=${status}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch proposals');
  return res.json();
}

export async function fetchReports(page: number = 1) {
  const res = await fetch(`/api/admin/reports?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchAdminStats() {
  const res = await fetch('/api/admin/stats');
  return res.json();
}