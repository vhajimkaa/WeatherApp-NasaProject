document.addEventListener('DOMContentLoaded', () => {
  const city = localStorage.getItem('city');

  // Если города нет, вернуться на index.html
  if (!city) return window.location.href = 'index.html';

  const app = document.querySelector('.weather-app');
  const cityDateEl = document.querySelector('.city-date');
  const resetBtn = document.getElementById('resetCity');

  // Обновляем название города
  if (cityDateEl) cityDateEl.textContent = city;

  // Кнопка смены города
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('city');
      window.location.href = 'index.html';
    });
  }
  
  const icons = {
    clouds: "./Assets/weather-icons/clouds-svgrepo-com.png",
    night: "./Assets/weather-icons/night-svgrepo-com.png",
    rain: "./Assets/weather-icons/rain-svgrepo-com.png",
    thunder: "./Assets/weather-icons/thunder-svgrepo-com.png",
    "sun-rain": "./Assets/weather-icons/sun-rain-svgrepo-com.png",
    sun: "./Assets/weather-icons/sun-svgrepo-com.png"
  };

  // Функция обновления данных на main
  function updateWeather(data) {
    if (!data) return;

    // --- (анимацию убрали) ---
    if (app) app.style.opacity = "1";

    cityDateEl.textContent = data.city || city;

    const mainIcon = document.querySelector('.weather-icon img');
    const tempEl = document.querySelector('.weather-temp h2');
    const feelsEl = document.querySelector('.feels-like');
    const rainEl = document.querySelector('.rain-status');

    if (mainIcon) mainIcon.src = icons[data.condition] || "";
    if (tempEl) tempEl.textContent = data.temperature != null ? `${data.temperature}°C` : "-";
    if (feelsEl) feelsEl.textContent = data.feels_like != null ? `Feels like: ${data.feels_like}°C` : "-";
    if (rainEl) rainEl.textContent = data.condition || "-";

    const todayItems = document.querySelectorAll('.today-item p');
    if (todayItems.length >= 4) {
      todayItems[0].textContent = data.wind != null ? `Wind: ${data.wind} km/h` : "-";
      todayItems[1].textContent = data.sunrise || "-";
      todayItems[2].textContent = data.humidity != null ? `Humidity: ${data.humidity}%` : "-";
      todayItems[3].textContent = data.sunset || "-";
    }

    const forecastItems = document.querySelectorAll('.forecast-item');
    if (data.forecast && Array.isArray(data.forecast)) {
      data.forecast.forEach((f, i) => {
        if (forecastItems[i]) {
          const dayEl = forecastItems[i].querySelector('.day');
          const tempEl = forecastItems[i].querySelector('.temp');
          const iconEl = forecastItems[i].querySelector('img');

          if (dayEl) dayEl.textContent = f.day || "-";
          if (tempEl) tempEl.textContent = f.temp != null ? `${f.temp}°C` : "-";
          if (iconEl) iconEl.src = icons[f.condition] || "";
        }
      });
    }
  }

  // Заглушка данных, пока нет бэкенда
  updateWeather({
    city,
    temperature: "-",
    feels_like: "-",
    condition: "sun",
    humidity: "-",
    wind: "-",
    sunrise: "-",
    sunset: "-",
    forecast: [
      { day: "-", temp: "-", condition: "sun" },
      { day: "-", temp: "-", condition: "sun" },
      { day: "-", temp: "-", condition: "sun" },
      { day: "-", temp: "-", condition: "sun" },
      { day: "-", temp: "-", condition: "sun" }
    ]
  });
});
