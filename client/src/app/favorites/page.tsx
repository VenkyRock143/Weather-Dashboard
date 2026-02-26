"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import { City } from "@/types/city";
import Link from "next/link";

import { FiStar, FiArrowLeft, FiThermometer, FiDroplet } from "react-icons/fi";

export default function Favorites() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get("/cities");
      setCities(res.data.filter((c: City) => c.isFavorite));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          
          {/*Navigation */}
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-medium"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-yellow-100 rounded-2xl text-yellow-600 shadow-sm">
              <FiStar className="text-2xl fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Favorite Cities</h1>
              <p className="text-slate-500">Your curated list of priority weather locations</p>
            </div>
          </div>

          {/* Favorites List */}
          <div className="space-y-4">
            {loading ? (
              [1, 2].map((i) => (
                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
              ))
            ) : cities.length > 0 ? (
              cities.map((c) => (
                <div 
                  key={c._id} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-6">
                    <h2 className="text-xl font-bold text-slate-800 min-w-[120px]">{c.name}</h2>
                    
                    <div className="flex gap-8">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FiThermometer className="text-blue-500" />
                        <span className="text-lg font-semibold">{c.weather.temp}°C</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <FiDroplet className="text-teal-500" />
                        <span className="text-lg font-medium">{c.weather.humidity}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      Live Data
                    </span>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <FiStar className="mx-auto text-4xl text-slate-200 mb-4" />
                <h3 className="text-lg font-medium text-slate-600">No favorites saved</h3>
                <p className="text-slate-400 mt-1">Go to the dashboard to mark cities with a star.</p>
                <Link 
                  href="/dashboard" 
                  className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Explore Cities
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
