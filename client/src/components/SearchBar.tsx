"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function SearchBar({ setWeather }: any) {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!city.trim()) return;

    try {
      setLoading(true);

      const res = await api.get(`/weather/${city.trim()}`);

      console.log("Backend response:", res.data);

      setWeather(res.data);
    } catch (error: any) {
      console.error("Search error:", error);
      alert("City not found or server error");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
      className="flex gap-2"
    >
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city"
        className="border p-2 rounded w-64"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}