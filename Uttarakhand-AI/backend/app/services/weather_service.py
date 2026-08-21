"""Weather service using OpenWeather API"""
import requests
from typing import Dict, Optional, Any
from app.config.settings import Config
from app.utils.logger import logger

class WeatherService:
    """Service for fetching weather data"""
    
    def __init__(self):
        """Initialize weather service"""
        self.api_key = Config.WEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
        if not self.api_key:
            logger.warning("WEATHER_API_KEY not found. Weather features will be limited.")
    
    def get_weather(self, location: str) -> Dict[str, Any]:
        """
        Get current weather for a location in Uttarakhand
        
        Args:
            location: City name or location in Uttarakhand
            
        Returns:
            Weather data dictionary
        """
        if not self.api_key:
            return {
                'success': False,
                'message': 'Weather API key not configured',
                'data': self._get_default_weather(location)
            }
        
        try:
            # Uttarakhand cities mapping
            city_mapping = {
                'dehradun': 'Dehradun,IN',
                'rishikesh': 'Rishikesh,IN',
                'haridwar': 'Haridwar,IN',
                'mussoorie': 'Mussoorie,IN',
                'nainital': 'Nainital,IN',
                'almora': 'Almora,IN',
                'ranikhet': 'Ranikhet,IN',
                'kedarnath': 'Kedarnath,IN',
                'badrinath': 'Badrinath,IN',
                'gangotri': 'Gangotri,IN',
                'yamunotri': 'Yamunotri,IN',
                'auli': 'Auli,IN',
                'jim corbett': 'Ramnagar,IN'
            }
            
            city = location.lower()
            query = city_mapping.get(city, f"{location},IN")
            
            # Get current weather
            url = f"{self.base_url}/weather"
            params = {
                'q': query,
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Format response
            weather_data = {
                'location': data.get('name', location),
                'temperature': round(data['main']['temp']),
                'feels_like': round(data['main']['feels_like']),
                'description': data['weather'][0]['description'].title(),
                'humidity': data['main']['humidity'],
                'wind_speed': round(data['wind']['speed'] * 3.6, 1),  # Convert m/s to km/h
                'pressure': data['main']['pressure'],
                'visibility': data.get('visibility', 0) / 1000,  # Convert to km
                'icon': data['weather'][0]['icon'],
                'condition': data['weather'][0]['main']
            }
            
            # Add travel advice based on weather
            weather_data['travel_advice'] = self._get_travel_advice(weather_data)
            
            return {
                'success': True,
                'data': weather_data
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Weather API error: {str(e)}")
            return {
                'success': False,
                'message': 'Unable to fetch weather data',
                'data': self._get_default_weather(location)
            }
        except Exception as e:
            logger.error(f"Error in get_weather: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching weather',
                'data': self._get_default_weather(location)
            }
    
    def get_forecast(self, location: str, days: int = 5) -> Dict[str, Any]:
        """
        Get weather forecast for multiple days
        
        Args:
            location: City name
            days: Number of days (max 5)
            
        Returns:
            Forecast data dictionary
        """
        if not self.api_key:
            return {
                'success': False,
                'message': 'Weather API key not configured'
            }
        
        try:
            city_mapping = {
                'dehradun': 'Dehradun,IN',
                'rishikesh': 'Rishikesh,IN',
                'haridwar': 'Haridwar,IN',
                'mussoorie': 'Mussoorie,IN',
                'nainital': 'Nainital,IN'
            }
            
            city = location.lower()
            query = city_mapping.get(city, f"{location},IN")
            
            url = f"{self.base_url}/forecast"
            params = {
                'q': query,
                'appid': self.api_key,
                'units': 'metric',
                'cnt': min(days * 8, 40)  # 8 forecasts per day, max 40
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Group forecasts by day
            forecasts = []
            current_date = None
            daily_forecast = None
            
            for item in data['list']:
                date = item['dt_txt'].split(' ')[0]
                if date != current_date:
                    if daily_forecast:
                        forecasts.append(daily_forecast)
                    daily_forecast = {
                        'date': date,
                        'temp_min': item['main']['temp_min'],
                        'temp_max': item['main']['temp_max'],
                        'description': item['weather'][0]['description'],
                        'icon': item['weather'][0]['icon']
                    }
                    current_date = date
                else:
                    daily_forecast['temp_min'] = min(daily_forecast['temp_min'], item['main']['temp_min'])
                    daily_forecast['temp_max'] = max(daily_forecast['temp_max'], item['main']['temp_max'])
            
            if daily_forecast:
                forecasts.append(daily_forecast)
            
            return {
                'success': True,
                'location': data['city']['name'],
                'forecasts': forecasts[:days]
            }
            
        except Exception as e:
            logger.error(f"Error in get_forecast: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching forecast'
            }
    
    def _get_travel_advice(self, weather_data: Dict[str, Any]) -> str:
        """Get travel advice based on weather conditions"""
        condition = weather_data.get('condition', '').lower()
        temp = weather_data.get('temperature', 20)
        description = weather_data.get('description', '').lower()
        
        if 'rain' in condition or 'rain' in description:
            return "Carry umbrella and raincoat. Roads may be slippery. Avoid trekking in heavy rain."
        elif 'snow' in condition or 'snow' in description:
            return "Wear warm clothes and proper snow boots. Drive carefully on snow-covered roads."
        elif temp < 5:
            return "Very cold weather. Layer up with warm clothes. Keep yourself hydrated."
        elif temp > 30:
            return "Hot weather. Stay hydrated. Avoid outdoor activities during peak sun hours (11 AM - 3 PM)."
        elif 'clear' in condition or 'sunny' in description:
            return "Perfect weather for sightseeing and outdoor activities. Apply sunscreen."
        else:
            return "Moderate weather conditions. Check local conditions before planning activities."
    
    def _get_default_weather(self, location: str) -> Dict[str, Any]:
        """Get default weather data when API is unavailable"""
        return {
            'location': location,
            'temperature': 20,
            'feels_like': 20,
            'description': 'Weather data unavailable',
            'humidity': 60,
            'wind_speed': 10,
            'pressure': 1013,
            'visibility': 10,
            'icon': '01d',
            'condition': 'Clear',
            'travel_advice': 'Check local weather conditions before traveling.'
        }

# Singleton instance
_weather_service: Optional[WeatherService] = None

def get_weather_service() -> WeatherService:
    """Get or create weather service instance"""
    global _weather_service
    if _weather_service is None:
        _weather_service = WeatherService()
    return _weather_service

