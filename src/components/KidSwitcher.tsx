"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Kid {
  id: number;
  name: string;
}

interface KidSwitcherProps {
  currentKidId: number;
  currentPath: string;
}

export default function KidSwitcher({ currentKidId, currentPath }: KidSwitcherProps) {
  const router = useRouter();
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available kids
    fetch('/api/kids')
      .then(res => res.json())
      .then(data => {
        setKids(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleKidChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKidId = e.target.value;
    if (newKidId) {
      router.push(`${currentPath}?kid=${newKidId}`);
    }
  };

  if (loading || kids.length <= 1) {
    return null; // Don't show switcher if loading or only one kid
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="kid-switcher" className="text-slate-300">Switch Kid:</label>
      <select
        id="kid-switcher"
        value={currentKidId}
        onChange={handleKidChange}
        className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {kids.map(kid => (
          <option key={kid.id} value={kid.id}>
            {kid.name}
          </option>
        ))}
      </select>
    </div>
  );
} 