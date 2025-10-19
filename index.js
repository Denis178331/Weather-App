const apiKey = "f17334344a9572d36f738a6fb62360c2";
const searchBtn = document.getElementById("search");
const cityInput = document.getElementById("city");
const cityName = document.getElementById("city-name");
const temp = document.getElementById("temp");
const desc = document.getElementById("description");
const icon = document.getElementById("icon");
const errorMsg = document.getElementById("error");


const langToggle = document.getElementById("lang-toggle");
let currentLang = "en";


function updateStaticText() {

    if (currentLang === "ro") {
        cityInput.placeholder = "Introdu numele orașului";
        searchBtn.textContent = "Căutare";
    } else {
        cityInput.placeholder = "Enter city name";
        searchBtn.textContent = "Search";
    }
}



langToggle.addEventListener("click", () => {
    if (currentLang === "en") {
        currentLang = "ro";
        langToggle.textContent = "EN";
    } else {
        currentLang = "en";
        langToggle.textContent = "RO";
    }



    updateStaticText();

    const city = cityName.textContent.trim();
    if (city !== "" && city !== "Loading...") {
        getWeather(city);
    } else {
        getWeather("Bucuresti")
    }
});


const weatherInfoDiv = document.querySelector(".weather-info");
const detailContainer = document.createElement("div");
detailContainer.id = "details";
weatherInfoDiv.appendChild(detailContainer);



searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city === "") return;
    getWeather(city);
});


cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city === "") return;
        getWeather(city);
    }
});

 function updateBackground(weatherMain) {
        const body = document.body;
        body.className = "";
        const weatherClass = `weather-${weatherMain.toLowerCase()}`;
        body.classList.add(weatherClass);
    }
async function getWeather(city) {
    errorMsg.textContent = "";
    cityName.textContent = "Loading...";
    temp.textContent = "";
    desc.textContent = "";
    icon.src = "";
    detailContainer.innerHTML = "";
    
    
    document.querySelector(".forecast-container").innerHTML = ''; 
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${currentLang}`;
    icon.style.display = "none"; 

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        
        if (data.cod === "404") {
            if (currentLang === "ro") {
                errorMsg.textContent = "Orașul nu a fost găsit!";
            } else {
                errorMsg.textContent = "City not Found!";
            }
            cityName.textContent = "";
            document.body.className = ''; 
            return; 
        }

       
        errorMsg.textContent = "";
        cityName.textContent = data.name;
        temp.textContent = `🌡️ ${Math.round(data.main.temp)}°C`;
        
        const weatherMain = data.weather[0].main;
        updateBackground(weatherMain); 
        
        const weatherDescription = data.weather[0].description;
        desc.textContent = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);

        icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        icon.alt = weatherDescription;
        icon.style.display = "block"

        const sunriseTimestamp = data.sys.sunrise * 1000;
        const sunsetTimestamp = data.sys.sunset * 1000;
        const timeOptions = { hour: '2-digit', minute: '2-digit'};
        const sunriseTime = new Date(sunriseTimestamp).toLocaleTimeString('ro-RO', timeOptions);
        const sunsetTime = new Date(sunsetTimestamp).toLocaleTimeString('ro-RO', timeOptions);

        let moistureText = currentLang === "ro" ? "Umiditate" : "Moisture";
        let windText = currentLang === "ro" ? "Vânt" : "Wind";
        let risenText = currentLang === "ro" ? "Răsărit" : "Risen";
        let setText = currentLang === "ro" ? "Apus" : "Sunset";

        detailContainer.innerHTML = `
            <hr style="margin: 15px 0;">
            <p>💧 ${moistureText}: <strong>${data.main.humidity}%</strong></p>
            <p>🌬️ ${windText}: <strong>${data.wind.speed} m/s</strong></p>
            <p>🌅 ${risenText}: <strong>${sunriseTime}</strong></p>
            <p>🌇 ${setText}: <strong>${sunsetTime}</strong></p>
        `;

        
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=${currentLang}`;
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();
        
        if (forecastData.cod === "200") {
             displayForecast(forecastData);
        } else {
             document.querySelector(".forecast-container").innerHTML = '';
        }

    } catch (err) {
       
        document.body.className = "";
        document.querySelector(".forecast-container").innerHTML = ''; 

        if (currentLang === "ro") {
            errorMsg.textContent = "Eroare la preluarea datelor meteo. Vă rugăm să încercați din nou.";
        } else {
            errorMsg.textContent = "Error fetching weather data. Please try again.";
        }

        cityName.textContent = "";
        temp.textContent = "";
        desc.textContent = "";
        icon.src = "";
        detailContainer.innerHTML = "";
    }
}
function displayForecast(data) {
    const forecastContainer = document.querySelector(".forecast-container");
    forecastContainer.innerHTML = ''; 
    const dailyForecasts = [];
    const neededTime = "12:00:00"; 
    
    data.list.forEach(item => {
        const dateText = item.dt_txt; 
       
        if (dateText.includes(neededTime)) {
            dailyForecasts.push(item);
        }
    });

    
    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const locale = currentLang === "ro" ? "ro-RO" : "en-US";
        const dayName = date.toLocaleDateString(locale, { weekday: 'long' }); 
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Icon">
            <p>${Math.round(day.main.temp)}°C</p>
        `;
        forecastContainer.appendChild(card);
    });
}
function getInitialLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoords(lat, lon); 
        }, () => {
            
            getWeather("Bucuresti");
        });
    } else {
        getWeather("Bucuresti");
    }
}
updateStaticText();

getWeather("Bucuresti");