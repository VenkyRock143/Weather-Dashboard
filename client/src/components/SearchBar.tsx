"use client";
import { useState } from "react";
import api from "@/lib/api";

export default function SearchBar({ setWeather }: any) {

  const [city,setCity] = useState("");

  const handleSearch = async () => {

    const res = await api.get(`/weather/${city}`);

    setWeather(res.data);
  };

  return (
    <div className="flex gap-2 mt-6">
      <input
        className="border px-4 py-2 rounded"
        placeholder="Enter City"
        onChange={(e)=>setCity(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 rounded"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
}