"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import AIChat from "@/components/AIChat";
import { City } from "@/types/city";
import { useRouter } from "next/navigation";
import {
  FiLogOut, FiPlus, FiStar, FiTrash2, FiDroplet,
  FiThermometer, FiSearch
} from "react-icons/fi";

export default function Dashboard() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  // Logic for filtering
  const favorites = cities.filter((c) => c.isFavorite);
  const filteredCities = cities.filter(
    (c) => !c.isFavorite && c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  useEffect(() => {
    fetchCities();
    const interval = setInterval(fetchCities, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchCities = async () => {
    try {
      const res = await api.get("/cities");
      setCities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error");
    } finally {
      setLoading(false);
    }
  };

  const addCity = async () => {
    if (!cityInput.trim()) return;
    setAdding(true);
    try {
      await api.post("/cities", { name: cityInput });
      setCityInput("");
      fetchCities();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error adding city");
    } finally {
      setAdding(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      await api.patch(`/cities/${id}/favorite`);
      fetchCities();
    } catch (err) { console.error("API Error"); }
  };

  const deleteCity = async (id: string) => {
    if (!confirm("Delete city?")) return;
    try {
      await api.delete(`/cities/${id}`);
      setCities((prev) => prev.filter((c) => c._id !== id));
    } catch (err) { console.error("API Error"); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

        {/* SIDEBAR (Favorites Only) */}
        <aside className="w-64 bg-white border-r flex flex-col p-5 shadow-sm">
          <h1 className="text-xl font-black text-blue-600 mb-8 tracking-tighter">Favorites</h1>

          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pinned Locations</h2>
          <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
            {favorites.map((c) => (
              <div key={c._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 relative group transition-all hover:bg-blue-50/50">
                <button onClick={() => toggleFavorite(c._id)} className="absolute top-2 right-2 text-yellow-500">
                  <FiStar className="fill-current" size={12} />
                </button>
                <p className="font-bold text-xs truncate pr-4 text-slate-700">{c.name}</p>
                <p className="text-[10px] text-blue-500 font-bold mt-1">{Math.round(c.weather?.temp ?? 0)}°C</p>
              </div>
            ))}
            {favorites.length === 0 && <p className="text-[10px] text-slate-400 italic px-2">No favorites pinned.</p>}
          </div>

          <button onClick={logout} className="mt-4 flex items-center gap-2 text-slate-400 hover:text-red-500 p-2 text-xs font-bold transition-all">
            <FiLogOut /> Logout
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col relative overflow-hidden">

          {/* TOP SEARCH BAR */}
          <header className="p-4 bg-white border-b flex justify-center sticky top-0 z-10">
            <div className="flex gap-2 w-full max-w-md">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCity()}
                  placeholder="Monitor a new city..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                />
              </div>
              <button
                onClick={addCity}
                disabled={adding}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {adding ? "..." : "Add"}
              </button>
            </div>
          </header>

          {/* MAIN GRID AREA */}
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Global Stations</h2>
              <input
                placeholder="Filter list..."
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs bg-transparent border-b border-slate-300 outline-none focus:border-blue-500 py-1"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {filteredCities.map((c) => (
                  <CityCard key={c._id} city={c} onFavorite={toggleFavorite} onDelete={deleteCity} />
                ))}
                {filteredCities.length === 0 && !loading && (
                  <div className="col-span-full py-20 text-center text-slate-400 text-sm border-2 border-dashed rounded-3xl">
                    No matching cities found in your directory.
                  </div>
                )}
              </div>
            )}
          </div>
          <AIChat />
        </main>
      </div>
    </AuthGuard>
  );
}

function CityCard({ city, onFavorite, onDelete }: any) {
  return (
    <div className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
      <div className="flex justify-between items-start">
        <h3 className="font-extrabold text-slate-800 tracking-tight text-lg">{city.name}</h3>
        <button onClick={() => onFavorite(city._id)} className="text-slate-200 hover:text-yellow-400 transition-colors">
          <FiStar className={city.isFavorite ? "text-yellow-500 fill-current" : ""} size={20} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <span className="text-5xl font-black text-slate-900 tracking-tighter">
          {Math.round(city.weather?.temp ?? 0)}°
        </span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
            <FiThermometer size={10} /> Temp
          </div>
          <div className="flex items-center gap-1 text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
            <FiDroplet size={10} /> {city.weather?.humidity ?? 0}% Hum
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Live Updates</span>
        <button
          onClick={() => onDelete(city._id)}
          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>

  );
}