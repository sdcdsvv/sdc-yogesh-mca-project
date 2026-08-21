import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Eye,
  Loader2
} from 'lucide-react';
import { getWeather, type WeatherData } from '../../services/api';

const WeatherWidget: React.FC = () => {
  const [location, setLocation] = useState('Dehradun');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const locations = [
    'Dehradun',
    'Rishikesh',
    'Haridwar',
    'Mussoorie',
    'Nainital',
    'Almora',
    'Ranikhet',
    'Kedarnath',
    'Badrinath',
    'Gangotri',
    'Yamunotri',
    'Auli'
  ];

  // Mock weather data for demonstration
  const getMockWeather = (loc: string): WeatherData => {
    const mockData: Record<string, WeatherData> = {
      'Dehradun': {
        location: 'Dehradun',
        temperature: 22,
        feels_like: 21,
        description: 'Partly Cloudy',
        humidity: 65,
        wind_speed: 12,
        pressure: 1013,
        visibility: 10,
        icon: '02d',
        condition: 'Clouds',
        travel_advice: 'Perfect weather for sightseeing. Carry light jacket for evening. Visit Robber\'s Cave and Sahastradhara.'
      },
      'Rishikesh': {
        location: 'Rishikesh',
        temperature: 24,
        feels_like: 23,
        description: 'Clear Sky',
        humidity: 55,
        wind_speed: 8,
        pressure: 1012,
        visibility: 12,
        icon: '01d',
        condition: 'Clear',
        travel_advice: 'Excellent weather for rafting and outdoor activities. Apply sunscreen. Perfect for Ganga Aarti at evening.'
      },
      'Haridwar': {
        location: 'Haridwar',
        temperature: 26,
        feels_like: 25,
        description: 'Sunny',
        humidity: 50,
        wind_speed: 10,
        pressure: 1012,
        visibility: 15,
        icon: '01d',
        condition: 'Clear',
        travel_advice: 'Hot and sunny. Stay hydrated. Best time for Har Ki Pauri visit is early morning or evening.'
      },
      'Mussoorie': {
        location: 'Mussoorie',
        temperature: 15,
        feels_like: 13,
        description: 'Light Rain',
        humidity: 80,
        wind_speed: 15,
        pressure: 1010,
        visibility: 8,
        icon: '10d',
        condition: 'Rain',
        travel_advice: 'Carry umbrella and raincoat. Roads may be slippery. Mall Road and Kempty Falls are beautiful in rain.'
      },
      'Nainital': {
        location: 'Nainital',
        temperature: 18,
        feels_like: 17,
        description: 'Mist',
        humidity: 75,
        wind_speed: 10,
        pressure: 1011,
        visibility: 6,
        icon: '50d',
        condition: 'Mist',
        travel_advice: 'Misty conditions. Drive carefully and enjoy the scenic beauty. Boat ride in Naini Lake is magical.'
      },
      'Almora': {
        location: 'Almora',
        temperature: 16,
        feels_like: 15,
        description: 'Partly Cloudy',
        humidity: 70,
        wind_speed: 12,
        pressure: 1011,
        visibility: 9,
        icon: '02d',
        condition: 'Clouds',
        travel_advice: 'Pleasant weather for exploring. Visit Kasar Devi temple and enjoy panoramic Himalayan views.'
      },
      'Ranikhet': {
        location: 'Ranikhet',
        temperature: 14,
        feels_like: 13,
        description: 'Cool Breeze',
        humidity: 68,
        wind_speed: 14,
        pressure: 1010,
        visibility: 10,
        icon: '02d',
        condition: 'Clouds',
        travel_advice: 'Cool and pleasant. Perfect for nature walks. Visit Chaubatia Gardens and Jhula Devi Temple.'
      },
      'Kedarnath': {
        location: 'Kedarnath',
        temperature: 8,
        feels_like: 5,
        description: 'Cold',
        humidity: 85,
        wind_speed: 20,
        pressure: 1008,
        visibility: 7,
        icon: '13d',
        condition: 'Snow',
        travel_advice: 'Very cold. Wear heavy woolens. Trek carefully. Temple opens May-November only.'
      },
      'Badrinath': {
        location: 'Badrinath',
        temperature: 10,
        feels_like: 7,
        description: 'Chilly',
        humidity: 80,
        wind_speed: 18,
        pressure: 1009,
        visibility: 8,
        icon: '13d',
        condition: 'Snow',
        travel_advice: 'Cold weather. Layer up with warm clothes. Temple accessible May-November. Carry oxygen if needed.'
      },
      'Gangotri': {
        location: 'Gangotri',
        temperature: 9,
        feels_like: 6,
        description: 'Cold & Windy',
        humidity: 82,
        wind_speed: 22,
        pressure: 1008,
        visibility: 7,
        icon: '50d',
        condition: 'Mist',
        travel_advice: 'Very cold and windy. Heavy woolens required. Best visited May-October. Acclimatize properly.'
      },
      'Yamunotri': {
        location: 'Yamunotri',
        temperature: 11,
        feels_like: 8,
        description: 'Cold',
        humidity: 78,
        wind_speed: 16,
        pressure: 1009,
        visibility: 8,
        icon: '02d',
        condition: 'Clouds',
        travel_advice: 'Cold mountain weather. Warm clothes essential. Trek is moderate. Open May-November.'
      },
      'Auli': {
        location: 'Auli',
        temperature: 5,
        feels_like: 2,
        description: 'Snow',
        humidity: 90,
        wind_speed: 25,
        pressure: 1007,
        visibility: 5,
        icon: '13d',
        condition: 'Snow',
        travel_advice: 'Snowy conditions. Perfect for skiing (Dec-Feb). Wear proper snow gear and boots. Cable car ride is amazing.'
      }
    };

    return mockData[loc] || {
      location: loc,
      temperature: 20,
      feels_like: 19,
      description: 'Pleasant Weather',
      humidity: 60,
      wind_speed: 10,
      pressure: 1013,
      visibility: 10,
      icon: '01d',
      condition: 'Clear',
      travel_advice: 'Good weather for traveling. Check local conditions before planning activities.'
    };
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async (loc?: string) => {
    const searchLocation = loc || location;
    setIsLoading(true);
    setError(null);

    try {
      const response = await getWeather(searchLocation);
      if (response.success && response.data) {
        setWeather(response.data);
        setUseMockData(false);
      } else {
        // If API fails, use mock data
        console.warn('Weather API unavailable, using mock data');
        setWeather(getMockWeather(searchLocation));
        setUseMockData(true);
      }
    } catch (err) {
      console.warn('Weather fetch error, using mock data:', err);
      // Use mock data on error
      setWeather(getMockWeather(searchLocation));
      setUseMockData(true);
      setError(null); // Don't show error, just use mock data
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    fetchWeather(newLocation);
  };

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain')) return <CloudRain className="w-12 h-12" />;
    if (cond.includes('snow')) return <CloudSnow className="w-12 h-12" />;
    if (cond.includes('clear') || cond.includes('sun')) return <Sun className="w-12 h-12" />;
    return <Cloud className="w-12 h-12" />;
  };

  return (
    <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white rounded-2xl shadow-2xl overflow-hidden border border-orange-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Weather Forecast</h3>
              <p className="text-sm text-orange-100">Current conditions & travel advice</p>
              {useMockData && (
                <p className="text-xs text-white/70 bg-white/20 px-2 py-1 rounded-full mt-1 inline-block">Demo Mode</p>
              )}
            </div>
          </div>
          <select
            value={location}
            onChange={handleLocationChange}
            disabled={isLoading}
            className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer hover:bg-white/30 transition-all shadow-lg"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc} className="text-gray-800 bg-white">
                {loc}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin mb-3" />
            <p className="text-sm text-white/80">Fetching weather data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-300/50 rounded-xl p-6 text-center backdrop-blur-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-100 mb-4">{error}</p>
            <button
              onClick={() => fetchWeather()}
              className="px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all text-sm font-medium shadow-md"
            >
              🔄 Retry
            </button>
          </div>
        ) : weather ? (
          <>
            {/* Main Weather Info */}
            <div className="flex items-center justify-between mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div>
                <div className="text-6xl font-bold mb-2 bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">
                  {weather.temperature}°C
                </div>
                <div className="text-white/80 text-sm flex items-center gap-1">
                  <span>Feels like</span>
                  <span className="font-semibold">{weather.feels_like}°C</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-2">
                  {getWeatherIcon(weather.condition)}
                </div>
                <div className="text-sm text-white/90 font-medium">
                  {weather.description}
                </div>
              </div>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-5 h-5 text-blue-200" />
                  <span className="text-xs text-white/70 font-medium">Humidity</span>
                </div>
                <div className="text-2xl font-bold">{weather.humidity}%</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-5 h-5 text-blue-200" />
                  <span className="text-xs text-white/70 font-medium">Wind Speed</span>
                </div>
                <div className="text-2xl font-bold">{weather.wind_speed}</div>
                <div className="text-xs text-white/60">km/h</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-blue-200" />
                  <span className="text-xs text-white/70 font-medium">Visibility</span>
                </div>
                <div className="text-2xl font-bold">{weather.visibility}</div>
                <div className="text-xs text-white/60">km</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-5 h-5 text-blue-200" />
                  <span className="text-xs text-white/70 font-medium">Pressure</span>
                </div>
                <div className="text-2xl font-bold">{weather.pressure}</div>
                <div className="text-xs text-white/60">hPa</div>
              </div>
            </div>

            {/* Travel Advice */}
            {weather.travel_advice && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-5 border border-yellow-300/30 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <p className="text-lg font-bold mb-2 text-yellow-100">Travel Advice</p>
                    <p className="text-sm text-white/90 leading-relaxed">{weather.travel_advice}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default WeatherWidget;

