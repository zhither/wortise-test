export type WeatherSnapshot = {
  location: string;
  tempC: number;
  condition: string;
  humidity?: number;
};

export interface WeatherProvider {
  getCurrent(input: {
    city?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<WeatherSnapshot>;
}

const CONDITIONS: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla",
  51: "Llovizna",
  61: "Lluvia",
  80: "Chubascos",
  95: "Tormenta",
};

/**
 * Open-Meteo sin API key. Geocoding opcional vía API pública de Open-Meteo.
 */
export class OpenMeteoWeatherProvider implements WeatherProvider {
  async getCurrent(input: {
    city?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<WeatherSnapshot> {
    let lat = input.latitude;
    let lon = input.longitude;
    let location = "Ubicación por defecto";

    if (lat === undefined || lon === undefined) {
      if (input.city?.trim()) {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          input.city.trim(),
        )}&count=1`;
        const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(8000) });
        if (!geoRes.ok) throw new Error("WEATHER_GEO_UNAVAILABLE");
        const geoJson = (await geoRes.json()) as {
          results?: { latitude: number; longitude: number; name: string }[];
        };
        const first = geoJson.results?.[0];
        if (!first) {
          throw new Error("WEATHER_LOCATION_NOT_FOUND");
        }
        lat = first.latitude;
        lon = first.longitude;
        location = first.name;
      } else {
        lat = 40.4168;
        lon = -3.7038;
        location = "Madrid (por defecto)";
      }
    } else {
      location = `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error("WEATHER_API_UNAVAILABLE");
    const json = (await res.json()) as {
      current?: {
        temperature_2m?: number;
        relative_humidity_2m?: number;
        weather_code?: number;
      };
    };
    const cur = json.current;
    if (typeof cur?.temperature_2m !== "number") throw new Error("WEATHER_PARSE_ERROR");

    const code = cur.weather_code ?? 0;
    const condition = CONDITIONS[code] ?? "Condiciones variables";

    return {
      location,
      tempC: Math.round(cur.temperature_2m * 10) / 10,
      condition,
      humidity: cur.relative_humidity_2m,
    };
  }
}

export class DevMockWeatherProvider implements WeatherProvider {
  async getCurrent(input: {
    city?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<WeatherSnapshot> {
    const city = input.city?.trim();
    return {
      location: city ? `${city} (mock)` : "Mock (sin ciudad)",
      tempC: 21,
      condition: "Soleado (mock)",
      humidity: 55,
    };
  }
}
