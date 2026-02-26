"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";

export default function Home() {
  const [weather, setWeather] = useState(null);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center">
        <SearchBar setWeather={setWeather} />
        <WeatherCard data={weather} />
      </div>
    </>
  );
}