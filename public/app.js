const countryInput = document.getElementById('countryInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const welcomeState = document.getElementById('welcomeState');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

// Elements to update
const elCountryName = document.getElementById('countryName');
const elRegionName = document.getElementById('regionName');
const elCapital = document.getElementById('capital');
const elPopulation = document.getElementById('population');
const elCurrency = document.getElementById('currency');
const elLocalTime = document.getElementById('localTime');
const elWeatherTemp = document.getElementById('weatherTemp');
const elWeatherDesc = document.getElementById('weatherDesc');
const elAttractions = document.getElementById('attractions');

let map = null;

const API_SECRET = 'my_super_secret_api_key';
 // In a real scenario, this shouldn't be here, but per requirements "Check headers for x-api-key" on server. We need to send it.
// Wait, prompt says "Reject if it doesn't match a hardcoded secret".
// "Include 'x-api-key' and 'Authorization' headers in the POST request."
// Since this is client-side code, we have to hardcode it or fetch it. Use the hardcoded value matching server env for now.
//gg
const MOCK_TOKEN = 'Bearer mock_oauth_token_xyz_123';

searchBtn.addEventListener('click', handleSearch);

// Allow Enter key to search
countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
    const countryName = countryInput.value.trim();
    if (!countryName) return;

    // Reset UI
    welcomeState.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        // 1. Get Config
        const configRes = await fetch('/api/config');
        const config = await configRes.json();
        const weatherApiKey = config.openWeatherApiKey;
        const geoDbApiKey = config.geoDbApiKey;

        if (!weatherApiKey) throw new Error('Weather API Key not configured on server.');

        // 2. Fetch Country Data
        const countryRes = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        if (!countryRes.ok) throw new Error('Country not found');
        const countryDataArray = await countryRes.json();
        const countryData = countryDataArray[0];

        // 3. Extract Data
        const commonName = countryData.name.common;
        const region = countryData.region;
        const capital = countryData.capital ? countryData.capital[0] : 'N/A';
        const population = countryData.population;
        const [lat, lon] = countryData.latlng;

        // Currency
        const currencies = countryData.currencies ? Object.values(countryData.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A';

        // Time (Simple approximation using UTC offset)
        const timeZone = countryData.timezones ? countryData.timezones[0] : 'UTC';
        const localTime = calculateLocalTime(timeZone);

        // 4. Fetch Weather Data
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`);
        if (!weatherRes.ok) throw new Error('Weather data unavailable');
        const weatherData = await weatherRes.json();
        const temperature = weatherData.main.temp;
        const description = weatherData.weather[0].description;

        // 5. Update UI
        updateUI({
            commonName, region, capital, population, currencies, localTime, temperature, description, lat, lon
        });

        // 6. Update Map
        updateMap(lat, lon, commonName);

        // 7. Update Attractions (Mock)
        updateAttractions(commonName);

        // 8. Save to Backend
        await saveDataToBackend({
            country: commonName,
            capital: capital,
            population: population,
            temperature: temperature,
            weatherDescription: description
        });

    } catch (error) {
        showError(error.message);
    } finally {
        loading.classList.add('hidden');
    }
}

function updateUI(data) {
    elCountryName.innerText = data.commonName;
    elRegionName.innerText = data.region;
    elCapital.innerText = data.capital;
    elPopulation.innerText = data.population.toLocaleString();
    elCurrency.innerText = data.currencies;
    elLocalTime.innerText = data.localTime;
    elWeatherTemp.innerText = `${Math.round(data.temperature)}°C`;
    elWeatherDesc.innerText = data.description.charAt(0).toUpperCase() + data.description.slice(1);

    resultsSection.classList.remove('hidden');
}

function updateMap(lat, lon, title) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lon], 5);
    }

    // Clear existing markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    L.marker([lat, lon]).addTo(map)
        .bindPopup(title)
        .openPopup();
}

function updateAttractions(country) {
    // Mock Data for demonstration
    const mockAttractions = {
        'Japan': ['Mount Fuji', 'Kyoto Temples', 'Tokyo Tower', 'Osaka Castle'],
        'France': ['Eiffel Tower', 'Louvre Museum', 'Palace of Versailles', 'French Riviera'],
        'Italy': ['Colosseum', 'Venice Canals', 'Leaning Tower of Pisa', 'Vatican City'],
        'USA': ['Grand Canyon', 'Statue of Liberty', 'Yellowstone', 'Times Square'],
        'Sri Lanka': ['Sigiriya', 'Temple of the Tooth', 'Ella Rock', 'Yala National Park']
    };

    const list = mockAttractions[country] || ['City Center', 'National Museum', 'Historic Old Town', 'Central Park'];

    elAttractions.innerHTML = list.map(item => `
        <div class="stat-card" style="align-items: center; text-align: center;">
            <span class="stat-value" style="font-size: 1.2rem;">${item}</span>
            <span class="stat-label">Must Visit</span>
        </div>
    `).join('');
}

function calculateLocalTime(offsetStr) {
    // offsetStr format: "UTC+05:30" or "UTC-04:00" or "UTC"
    if (offsetStr === 'UTC') return new Date().toUTCString().split(' ')[4].substring(0, 5);

    // Very basic parsing, ideally use a library like moment-timezone or Intl API with proper timezone names
    // But REST Countries gives offsets like "UTC+09:00"
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);

    const sign = offsetStr.includes('+') ? 1 : -1;
    const parts = offsetStr.replace('UTC', '').replace('+', '').replace('-', '').split(':');
    const hours = parseInt(parts[0]);
    const minutes = parts[1] ? parseInt(parts[1]) : 0;

    const offsetMillis = sign * (hours * 60 * 60 * 1000 + minutes * 60 * 1000);
    const localDate = new Date(utc + offsetMillis);

    return localDate.toTimeString().substring(0, 5);
}

async function saveDataToBackend(data) {
    try {
        await fetch('/api/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'my_super_secret_api_key',
                'Authorization': MOCK_TOKEN
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Failed to save data:', error);
    }
}

function showError(msg) {
    errorMessage.innerText = msg;
    errorMessage.classList.remove('hidden');
}
