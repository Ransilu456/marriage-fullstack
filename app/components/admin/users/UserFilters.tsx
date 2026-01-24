'use client';

import Button from '../ui/Button';

const filters = ['ALL', 'ACTIVE', 'VERIFIED', 'UNVERIFIED', 'SUSPENDED'];

export default function UserFilters({ value, onChange }: any) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map(f => (
        <Button
          key={f}
          variant={value === f ? 'primary' : 'outline'}
          onClick={() => onChange(f)}
        >
          {f}
        </Button>
      ))}
    </div>
  );
}
