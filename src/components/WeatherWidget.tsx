'use client'

import React, { useEffect, useState } from 'react'
import { 
  Cloud, 
  Search, 
  Droplets, 
  Wind, 
  Thermometer, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle,
  CloudFog,
  CloudSun,
  Moon,
  CloudMoon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WeatherData {
  temp: number
  condition: string
  humidity: number
  icon: string
  city: string
  windSpeed?: number
  feelsLike?: number
  timezone: number
}

interface ForecastDay {
  date: string
  temp: {
    min: number
    max: number
  }
  condition: string
  icon: string
}

interface WeatherForecast {
  daily: ForecastDay[]
}

interface Coordinates {
  lat: number
  lon: number
  name: string
}

const getWeatherBackground = (condition: string, isDark: boolean) => {
  if (isDark) {
    return 'from-gray-900 to-gray-800'
  }
  return condition.toLowerCase().includes('clear')
    ? 'from-blue-500 to-blue-400'
    : 'from-gray-700 to-gray-600'
}

const getWeatherIcon = (condition: string, icon: string) => {
  // Check if it's night time based on icon code (ends with 'n')
  const isNight = icon.endsWith('n');
  
  // Map weather conditions to Lucide icons
  switch (condition.toLowerCase()) {
    case 'clear':
      return isNight ? Moon : Sun;
    case 'clouds':
      if (icon === '02d' || icon === '02n') {
        return isNight ? CloudMoon : CloudSun;
      }
      return Cloud;
    case 'rain':
      return CloudRain;
    case 'drizzle':
      return CloudDrizzle;
    case 'thunderstorm':
      return CloudLightning;
    case 'snow':
      return CloudSnow;
    case 'mist':
    case 'fog':
    case 'haze':
      return CloudFog;
    default:
      return Cloud;
  }
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<WeatherForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [cityInput, setCityInput] = useState('')
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>('')

  // Dark mode detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Get initial location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
            )
            const data = await response.json()
            if (data && data[0]) {
              setCoordinates({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                name: data[0].name
              })
            }
          } catch (err) {
            console.error('Reverse geocoding error:', err)
            setApiError('Failed to get location name')
          }
        },
        (err) => {
          console.error('Geolocation error:', err)
          // Fallback to Tokyo if location access is denied
          setCoordinates({
            lat: 35.6762,
            lon: 139.6503,
            name: 'Tokyo'
          })
        }
      )
    }
  }, [])

  const getCoordinates = async (city: string) => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    if (!apiKey) return null

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
      )
      const data = await response.json()
      
      if (data && data[0]) {
        return {
          lat: data[0].lat,
          lon: data[0].lon,
          name: data[0].name
        }
      }
      return null
    } catch (err) {
      console.error('Geocoding error:', err)
      return null
    }
  }

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cityInput.trim()) return

    setLoading(true)
    const coords = await getCoordinates(cityInput)
    if (coords) {
      setCoordinates(coords)
      setCityInput('')
      setApiError(null)
    } else {
      setApiError('City not found')
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchWeatherAndForecast = async () => {
      if (!coordinates) return

      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
        if (!apiKey) {
          setApiError('API key is missing')
          setLoading(false)
          return
        }

        // Fetch current weather
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${apiKey}`
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${apiKey}`
        
        const [weatherResponse, forecastResponse] = await Promise.all([
          fetch(weatherUrl),
          fetch(forecastUrl)
        ])

        const [weatherData, forecastData] = await Promise.all([
          weatherResponse.json(),
          forecastResponse.json()
        ])

        if (!weatherResponse.ok || !forecastResponse.ok) {
          setApiError(weatherData.message || forecastData.message || 'Failed to fetch weather data')
          setLoading(false)
          return
        }

        if (weatherData.main && weatherData.weather?.[0]) {
          setWeather({
            temp: Math.round(weatherData.main.temp),
            condition: weatherData.weather[0].main,
            humidity: weatherData.main.humidity,
            icon: weatherData.weather[0].icon,
            city: coordinates.name,
            windSpeed: Math.round(weatherData.wind?.speed || 0),
            feelsLike: Math.round(weatherData.main.feels_like),
            timezone: weatherData.timezone
          })

          // Process forecast data - get daily min/max from all data points
          if (forecastData.list) {
            const dailyForecasts = forecastData.list.reduce((acc: { [key: string]: any }, curr: any) => {
              const date = new Date(curr.dt * 1000)
              const dayKey = date.toLocaleDateString()
              
              if (!acc[dayKey]) {
                acc[dayKey] = {
                  date: date,
                  temp: {
                    min: curr.main.temp,
                    max: curr.main.temp
                  },
                  condition: curr.weather[0].main,
                  icon: curr.weather[0].icon,
                  readings: 1
                }
              } else {
                // Update min/max temperatures
                acc[dayKey].temp.min = Math.min(acc[dayKey].temp.min, curr.main.temp)
                acc[dayKey].temp.max = Math.max(acc[dayKey].temp.max, curr.main.temp)
                // Use the most frequent condition for the day
                if (curr.weather[0].main !== acc[dayKey].condition) {
                  acc[dayKey].readings++
                  if (acc[dayKey].readings > 4) {
                    acc[dayKey].condition = curr.weather[0].main
                    acc[dayKey].icon = curr.weather[0].icon
                  }
                }
              }
              return acc
            }, {})

            const processedForecasts = Object.values(dailyForecasts)
              .slice(0, 7)
              .map((day: any) => ({
                date: day.date.toLocaleDateString('en-US', { weekday: 'short' }),
                temp: {
                  min: Math.round(day.temp.min),
                  max: Math.round(day.temp.max)
                },
                condition: day.condition,
                icon: day.icon
              }))

            setForecast({ daily: processedForecasts })
          }
          
          setApiError(null)
        } else {
          setApiError('Invalid data format received')
        }
      } catch (err) {
        console.error('Weather API Error:', err)
        setApiError(err instanceof Error ? err.message : 'Failed to fetch weather')
      } finally {
        setLoading(false)
      }
    }

    if (coordinates) {
      fetchWeatherAndForecast()
      const interval = setInterval(fetchWeatherAndForecast, 300000) // Update every 5 minutes
      return () => clearInterval(interval)
    }
  }, [coordinates])

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      if (weather?.timezone) {
        const localTime = new Date();
        const utc = localTime.getTime() + (localTime.getTimezoneOffset() * 60000);
        const cityTime = new Date(utc + (weather.timezone * 1000));
        
        setCurrentTime(cityTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }));
      }
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [weather?.timezone]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl overflow-hidden shadow-lg bg-gradient-to-br ${getWeatherBackground(weather?.condition || 'clear', isDark)} p-6 transition-all duration-500`}
    >
      <form onSubmit={handleCitySubmit} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Search for a city..."
            className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <Search className="h-5 w-5 text-white" />
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-40"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {apiError ? (
              <div className="text-white/80 text-center py-4 bg-red-500/20 rounded-lg backdrop-blur-sm">
                {apiError}
              </div>
            ) : weather ? (
              <>
                <div className="text-center mb-6">
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-white mb-1"
                  >
                    {weather.city}
                  </motion.h2>
                  <p className="text-white/70">{weather.condition}</p>
                  <p className="text-white/70 text-sm mt-1">
                    {currentTime}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center mb-8 gap-4">
                  {/* Current weather icon */}
                  <div className="relative w-32 h-32">
                    {weather && (() => {
                      const IconComponent = getWeatherIcon(weather.condition, weather.icon);
                      return <IconComponent className="w-full h-full text-white drop-shadow-lg" strokeWidth={1} />;
                    })()}
                  </div>
                  <div className="text-white text-center md:text-left">
                    <motion.div 
                      key={weather.temp}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-6xl font-bold"
                    >
                      {weather.temp}°C
                    </motion.div>
                    <p className="text-white/70">Feels like {weather.feelsLike}°C</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-center"
                  >
                    <Droplets className="h-6 w-6 text-white mb-2 mx-auto" />
                    <p className="text-white/70 text-sm">Humidity</p>
                    <p className="text-white font-bold">{weather.humidity}%</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-center"
                  >
                    <Wind className="h-6 w-6 text-white mb-2 mx-auto" />
                    <p className="text-white/70 text-sm">Wind Speed</p>
                    <p className="text-white font-bold">{weather.windSpeed} m/s</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-center"
                  >
                    <Thermometer className="h-6 w-6 text-white mb-2 mx-auto" />
                    <p className="text-white/70 text-sm">Feels Like</p>
                    <p className="text-white font-bold">{weather.feelsLike}°C</p>
                  </motion.div>
                </div>

                {forecast && (
                  <div className="mt-8 w-full">
                    <h3 className="text-white font-bold mb-4">7-Day Forecast</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 lg:gap-4 w-full">
                      {forecast.daily.map((day, index) => {
                        const IconComponent = getWeatherIcon(day.condition, day.icon);
                        return (
                          <motion.div 
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-center flex flex-col items-center justify-between h-full"
                          >
                            <p className="text-white/70 text-sm font-medium mb-2">{day.date}</p>
                            <div className="relative w-12 h-12">
                              <IconComponent className="w-full h-full text-white drop-shadow-lg" strokeWidth={1} />
                            </div>
                            <p className="text-white/70 text-sm mt-1">{day.condition}</p>
                            <div className="mt-2">
                              <p className="text-white font-bold">{day.temp.max}°C</p>
                              <p className="text-white/70 text-sm">{day.temp.min}°C</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
