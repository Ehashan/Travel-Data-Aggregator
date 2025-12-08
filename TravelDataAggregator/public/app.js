const countryInput = document.getElementById('countryInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

const API_SECRET = 'my_super_secret_api_key'; // In a real scenario, this shouldn't be here, but per requirements "Check headers for x-api-key" on server. We need to send it.
// Wait, prompt says "Reject if it doesn't match a hardcoded secret".
// "Include 'x-api-key' and 'Authorization' headers in the POST request."
// Since this is client-side code, we have to hardcode it or fetch it. Use the hardcoded value matching server env for now.

const MOCK_TOKEN = 'Bearer mock_oauth_token_xyz_123';

searchBtn.addEventListener('click', handleSearch);

async function handleSearch() {
    const countryName = countryInput.value.trim();
    if (!countryName) return;

    // Reset UI
    resultsSection.innerHTML = '';
    errorMessage.classList.add('hidden');
    resultsSection.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        // 1. Get Config (OpenWeather Key & GeoDB Key)
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

        const commonName = countryData.name.common;
        const capital = countryData.capital ? countryData.capital[0] : 'N/A';
        const population = countryData.population;
        const [lat, lon] = countryData.latlng;

        // 3. Fetch Weather Data
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`);
        if (!weatherRes.ok) throw new Error('Weather data unavailable');
        const weatherData = await weatherRes.json();

        const temperature = weatherData.main.temp;
        const description = weatherData.weather[0].description;

        // 4. Fetch GeoDB Data (Capital Details)
        let capitalDetails = null;
        if (capital !== 'N/A' && geoDbApiKey) {
            try {
                const geoDbRes = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${capital}&limit=1`, {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': geoDbApiKey,
                        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
                    }
                });
                if (geoDbRes.ok) {
                    const geoData = await geoDbRes.json();
                    if (geoData.data && geoData.data.length > 0) {
                        capitalDetails = geoData.data[0];
                    }
                }
            } catch (err) {
                console.warn('GeoDB fetch failed', err);
            }
        }

        // 5. Aggregate Data
        const aggregatedData = {
            country: commonName,
            capital: capital,
            population: population,
            temperature: temperature,
            weatherDescription: description,
            capitalDetails: capitalDetails
        };

        // 6. Display Data
        displayResult(aggregatedData);

        // 7. Send to Backend
        await saveDataToBackend(aggregatedData);

    } catch (error) {
        showError(error.message);
    } finally {
        loading.classList.add('hidden');
    }
}

function displayResult(data) {
    resultsSection.classList.remove('hidden');
    const card = document.createElement('div');
    card.className = 'card';

    let extraDetails = '';
    if (data.capitalDetails) {
        extraDetails = `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <div class="card-item" style="font-size: 0.9rem; color: #94a3b8;">GeoDB Capital Data:</div>
                <div class="card-item"><strong>Region:</strong> ${data.capitalDetails.region || 'N/A'}</div>
                <div class="card-item"><strong>Elev:</strong> ${data.capitalDetails.elevationMeters ? data.capitalDetails.elevationMeters + 'm' : 'N/A'}</div>
            </div>
        `;
    }

    card.innerHTML = `
        <h2>${data.country}</h2>
        <div class="card-item"><strong>Capital:</strong> ${data.capital}</div>
        <div class="card-item"><strong>Population:</strong> ${data.population.toLocaleString()}</div>
        <div class="card-item"><strong>Temperature:</strong> ${data.temperature}°C</div>
        <div class="card-item"><strong>Weather:</strong> ${data.weatherDescription}</div>
        ${extraDetails}
        <div class="card-item" style="color: #4ade80; font-size: 0.9rem; margin-top: 10px;">
            ✓ Synced with Database
        </div>
    `;
    resultsSection.appendChild(card);
}

async function saveDataToBackend(data) {
    try {
        const response = await fetch('/api/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'my_super_secret_api_key', // Matching server .env
                'Authorization': MOCK_TOKEN
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server Error: ${errText}`);
        }
        console.log('Data saved successfully');
    } catch (error) {
        console.error('Failed to save data:', error);
        // Optionally update UI to show sync failed
        const card = resultsSection.querySelector('.card');
        if (card) {
            const statusMsg = card.querySelector('div:last-child');
            statusMsg.style.color = '#f87171'; // Red
            statusMsg.innerText = '⚠ Failed to sync with Database';
        }
    }
}

function showError(msg) {
    errorMessage.innerText = msg;
    errorMessage.classList.remove('hidden');
}
