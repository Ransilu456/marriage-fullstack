export async function fetchAdminUsers() {
  const res = await fetch('/api/admin/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchAdminStats() {
  const res = await fetch('/api/admin/stats');
  return res.json();
}