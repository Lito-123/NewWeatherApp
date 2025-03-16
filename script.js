
let weather = null;
let coordinates = null;

function getPhotoScore(weather, isGoldenHour) {
    let score = 0;
    if (weather.cloudcover < 50) score += 2;
    if (weather.precipitation === 0) score += 2;
    if (isGoldenHour) score += 3;
    if (weather.visibility > 20) score += 2;
    return Math.min(10, score);
}

async function fetchWeather(lat, lon) {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('weatherInfo').style.display = 'none';
        
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,cloud_cover,precipitation,visibility&daily=sunrise,sunset&timezone=auto`
        );
        weather = await response.json();
        updateUI();
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

async function searchLocation() {
    const location = document.getElementById('locationInput').value;
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}`
        );
        const data = await response.json();
        if (data.results?.[0]) {
            coordinates = {
                lat: data.results[0].latitude,
                lon: data.results[0].longitude
            };
            fetchWeather(coordinates.lat, coordinates.lon);
        }
    } catch (error) {
        console.error('Error searching location:', error);
    }
}

function updateUI() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('weatherInfo').style.display = 'block';
    
    document.getElementById('tempDisplay').textContent = `${Math.round(weather.current.temperature_2m)}°C`;
    document.getElementById('scoreDisplay').textContent = `Current: ${getPhotoScore(weather.current, false)}/10`;
    document.getElementById('goldenHours').innerHTML = `
        Sunrise: ${weather.daily.sunrise[0].split('T')[1]}<br>
        Sunset: ${weather.daily.sunset[0].split('T')[1]}
    `;
    
    document.getElementById('cloudCover').textContent = `Cloud Cover: ${weather.current.cloud_cover}%`;
    document.getElementById('visibility').textContent = `Visibility: ${weather.current.visibility}m`;
    document.getElementById('precipitation').textContent = `Precipitation: ${weather.current.precipitation}mm`;
}

// Get initial location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
        coordinates = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };
        fetchWeather(coordinates.lat, coordinates.lon);
    });
}
