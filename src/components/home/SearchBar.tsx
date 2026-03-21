'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Tag } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (date) params.set('date', date);
    if (category) params.set('category', category);
    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 flex flex-col md:flex-row items-stretch">
      {/* Location */}
      <div className="flex-1 flex items-center gap-3 px-5 py-4 hover:bg-gray-50 rounded-xl transition-colors">
        <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-black text-gray-900 mb-0.5 uppercase tracking-wide">Location</label>
          <input
            type="text"
            placeholder="Cairo, Alex, Sinai..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="hidden md:block w-px bg-gray-200 my-3" />
      <div className="md:hidden h-px bg-gray-100 mx-5" />

      {/* Date */}
      <div className="flex-1 flex items-center gap-3 px-5 py-4 hover:bg-gray-50 rounded-xl transition-colors">
        <Calendar className="w-5 h-5 text-orange-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-black text-gray-900 mb-0.5 uppercase tracking-wide">When</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full text-sm text-gray-500 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="hidden md:block w-px bg-gray-200 my-3" />
      <div className="md:hidden h-px bg-gray-100 mx-5" />

      {/* Category */}
      <div className="flex-1 flex items-center gap-3 px-5 py-4 hover:bg-gray-50 rounded-xl transition-colors">
        <Tag className="w-5 h-5 text-orange-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-black text-gray-900 mb-0.5 uppercase tracking-wide">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full text-sm text-gray-500 bg-transparent outline-none cursor-pointer"
          >
            <option value="">All categories</option>
            <option value="adventure">🏔️ Adventure</option>
            <option value="social">🤝 Social</option>
            <option value="sports">⚽ Sports</option>
            <option value="workshops">🎨 Workshops</option>
            <option value="nightlife">🌙 Nightlife</option>
            <option value="camping">🏕️ Camping</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="flex items-center justify-center gap-2 m-1 px-7 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-200 shrink-0 uppercase tracking-wide"
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </button>
    </div>
  );
}
