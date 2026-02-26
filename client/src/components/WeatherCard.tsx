export default function WeatherCard({ data }: any) {
  if (!data) return null;

  return (
    <div className="bg-white shadow-lg p-6 rounded-xl mt-6 w-[400px]">
      <h2 className="text-2xl font-semibold">{data.city}</h2>

      <div className="text-6xl text-blue-600 mt-3">
        {data.temp}°
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <p>Humidity: {data.humidity}%</p>
        <p>Wind: {data.wind} m/s</p>
        <p>Pressure: {data.pressure} hPa</p>
        <p>Visibility: {data.visibility / 1000} km</p>
      </div>
    </div>
  );
}