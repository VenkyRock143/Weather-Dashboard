city.ts
export interface Weather {
  temp: number;
  humidity: number;
}

export interface City {
  _id: string;
  name: string;
  weather: Weather;
  isFavorite: boolean;
}