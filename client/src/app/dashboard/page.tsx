"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import { City } from "@/types/city";
import { useRouter } from "next/navigation";
import {
  FiLogOut,
  FiPlus,
  FiStar,
  FiTrash2,
  FiDroplet,
  FiThermometer,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

export default function Dashboard() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  const favorites = cities.filter((c) => c.isFavorite);

  useEffect(() => {
    fetchCities();

    const interval = setInterval(() => {
      fetchCities();
    }, 60000); // auto refresh every 60s

    return () => clearInterval(interval);
  }, []);

  const fetchCities = async () => {
    try {
      const res = await api.get("/cities");
      setCities(res.data);
    } catch (err) {
      console.error("Error fetching cities");
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
  } catch (error) {
    if (error.response) {
      alert(error.response.data.message); // shows "City already added"
    } else {
      alert("Something went wrong");
    }
  } finally {
    setAdding(false);
  }
};

  const toggleFavorite = async (id: string) => {
    await api.patch(`/cities/${id}/favorite`);
    fetchCities();
  };

  const deleteCity = async (id: string) => {
    await api.delete(`/cities/${id}`);
    setCities((prev) => prev.filter((c) => c._id !== id));
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const filteredCities = cities
    .filter((c) => !c.isFavorite)
    .filter((c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase())
    );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold">Weather Dashboard</h1>
            <button
              onClick={logout}
              className="text-red-500 flex items-center gap-2"
            >
              <FiLogOut /> Logout
            </button>
          </div>

          {/* ADD CITY */}
          <div className="flex gap-3 mb-6">
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Add new city..."
              className="flex-1 px-4 py-2 rounded-xl border"
            />
            <button
              onClick={addCity}
              disabled={adding}
              className="bg-blue-600 text-white px-6 rounded-xl flex items-center gap-2"
            >
              {adding ? "Adding..." : <><FiPlus /> Add</>}
            </button>
          </div>

          {/* SEARCH FILTER */}
          <div className="flex items-center gap-2 mb-6 bg-white p-3 rounded-xl">
            <FiSearch />
            <input
              placeholder="Search cities..."
              onChange={(e) => setSearchFilter(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>

          {/* FAVORITES */}
          {favorites.length > 0 && (
            <div className="mb-10">
              <h2 className="font-bold mb-4 text-yellow-600">Favorites</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {favorites.map((c) => (
                  <CityCard
                    key={c._id}
                    city={c}
                    onFavorite={toggleFavorite}
                    onDelete={deleteCity}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE CITIES */}
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : filteredCities.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              No cities found.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCities.map((c) => (
                <CityCard
                  key={c._id}
                  city={c}
                  onFavorite={toggleFavorite}
                  onDelete={deleteCity}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

function CityCard({
  city,
  onFavorite,
  onDelete,
}: {
  city: City;
  onFavorite: any;
  onDelete: any;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">{city.name}</h2>
        <button onClick={() => onFavorite(city._id)}>
          <FiStar
            className={`text-xl ${
              city.isFavorite ? "text-yellow-500" : "text-gray-300"
            }`}
          />
        </button>
      </div>

      <div className="flex gap-6 mb-4">
        <div className="flex items-center gap-2 text-blue-600">
          <FiThermometer />
          {city.weather.temp}°C
        </div>
        <div className="flex items-center gap-2 text-teal-600">
          <FiDroplet />
          {city.weather.humidity}%
        </div>
      </div>

      <button
        onClick={() => onDelete(city._id)}
        className="text-red-500 text-sm flex items-center gap-1"
      >
        <FiTrash2 /> Remove
      </button>
    </div>
  );
}