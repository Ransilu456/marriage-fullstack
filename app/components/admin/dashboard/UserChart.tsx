'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', users: 120 },
  { name: 'Tue', users: 200 },
  { name: 'Wed', users: 150 },
  { name: 'Thu', users: 300 },
  { name: 'Fri', users: 250 },
];


export default function UserChart() {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <h3 className="font-bold mb-4">User Growth</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
