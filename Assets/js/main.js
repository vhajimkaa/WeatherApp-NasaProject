// main.js
document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    // --------- Налаштування ----------
    const API_BASE = "https://weatherapp-back-1.onrender.com";
    const WEATHER_TIMEOUT_MS = 5000;

    // --------- Елементи інтерфейсу ----------
    const city = localStorage.getItem("city");
    if (!city) return window.location.href = "index.html";

    const app = document.querySelector(".weather-app");
    const cityDateEl = document.querySelector(".city-date");
    const resetBtn = document.getElementById("resetCity");
    const loader = document.getElementById("loader");
    const nasaImg = document.getElementById("nasaImage");
    const downloadBtn = document.getElementById("downloadImage");

    // --------- Іконки погоди ----------
    const icons = {
      clouds: "Assets/weather-icons/clouds.png",
      rain: "Assets/weather-icons/rain.png",
      thunderstorm: "Assets/weather-icons/thunderstorm.png",
      "sun-rain": "Assets/weather-icons/sun-rain.png",
      clear: "Assets/weather-icons/clear.png",
      drizzle: "Assets/weather-icons/rain.png",
      mist: "Assets/weather-icons/night.png",
      smoke: "Assets/weather-icons/night.png",
      haze: "Assets/weather-icons/night.png",
      dust: "Assets/weather-icons/dust.png",
      fog: "Assets/weather-icons/night.png",
      sand: "Assets/weather-icons/dust.png",
      ash: "Assets/weather-icons/dust.png",
      squall: "Assets/weather-icons/thunderstorm.png",
      tornado: "Assets/weather-icons/thunderstorm.png",
      snow: "Assets/weather-icons/snowy.png",
      sun: "Assets/weather-icons/clear.png",
    };

    function getIcon(condition) {
      if (!condition) return icons.sun;
      const key = condition.toLowerCase().replace(/\s+/g, "-");
      return icons[key] || icons.sun;
    }

    // --------- Утиліти (fade loader & redirect) ----------
    function fadeOutLoader(duration = 300) {
      if (!loader) return;
      loader.style.transition = `opacity ${duration}ms ease`;
      loader.style.opacity = "0";
      setTimeout(() => (loader.style.display = "none"), duration);
    }

    function fadeOutLoaderThenRedirect(url = "404.html", duration = 300) {
      return new Promise((resolve) => {
        if (!loader) {
          window.location.href = url;
          return;
        }
        loader.style.transition = `opacity ${duration}ms ease`;
        loader.style.opacity = "0";
        setTimeout(() => {
          window.location.href = url;
          resolve();
        }, duration + 10);
      });
    }

    // --------- Оновлення інтерфейсу погоди ----------
    function updateWeather(data) {
      if (!data) data = {};
      if (app) app.classList.add("show");
      if (cityDateEl) cityDateEl.textContent = data.city || city;

      const mainIcon = document.querySelector(".weather-icon img");
      const tempEl = document.querySelector(".weather-temp h2");
      const feelsEl = document.querySelector(".feels-like");
      const rainEl = document.querySelector(".rain-status");

      const condition = data.condition || "sun";
      if (mainIcon) mainIcon.src = getIcon(condition);
      if (tempEl) tempEl.textContent = data.temperature != null ? `${data.temperature}°C` : "-";
      if (feelsEl) feelsEl.textContent = data.feels_like != null ? `Feels like: ${data.feels_like}°C` : "-";
      if (rainEl) rainEl.textContent = condition;

      // today items (вітер, схід сонця, вологість, захід сонця)
      const todayItems = document.querySelectorAll(".today-item p");
      if (todayItems.length >= 4) {
        todayItems[0].textContent = data.wind != null ? `Wind: ${data.wind} m/s` : "-";
        todayItems[1].textContent = data.sunrise || "-";
        todayItems[2].textContent = data.humidity != null ? `Humidity: ${data.humidity}%` : "-";
        todayItems[3].textContent = data.sunset || "-";
      }

      // forecast
      const forecastItems = document.querySelectorAll(".forecast-item");
      if (data.forecast && Array.isArray(data.forecast)) {
        data.forecast.forEach((f, i) => {
          if (forecastItems[i]) {
            const dayEl = forecastItems[i].querySelector(".day");
            const tempElF = forecastItems[i].querySelector(".temp");
            const iconEl = forecastItems[i].querySelector("img");

            const fCondition = f.condition || "sun";
            if (dayEl) dayEl.textContent = f.day || "-";
            if (tempElF) tempElF.textContent = f.temp != null ? `${f.temp}°C` : "-";
            if (iconEl) iconEl.src = getIcon(fCondition);
          }
        });
      }
    }

    // --------- Fetch з таймаутом ----------
    async function fetchWithTimeout(url, options = {}, timeoutMs = WEATHER_TIMEOUT_MS) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        return res;
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    }

    // --------- Основний потік: погода ----------
    try {
      if (loader) {
        loader.style.display = "flex";
        loader.style.opacity = "1";
      }

      const weatherUrl = `${API_BASE}/api/forecast?city=${encodeURIComponent(city)}`;
      const weatherResp = await fetchWithTimeout(weatherUrl);
      if (!weatherResp.ok) {
        // handle specific HTTP statuses explicitly
        if (weatherResp.status === 404) {
          await fadeOutLoaderThenRedirect("404.html", 250);
          return;
        } else if (weatherResp.status === 500) {
          await fadeOutLoaderThenRedirect("500.html", 250);
          return;
        } else {
          throw new Error(`Weather API returned ${weatherResp.status}`);
        }
      }
      const weatherData = await weatherResp.json();

      updateWeather(weatherData);
      fadeOutLoader(300);
    } catch (err) {
      console.error("Weather fetch error:", err);
      // For network/timeouts/other errors — show user-friendly fallback (no abrupt redirect)
      updateWeather({
        city,
        temperature: "-",
        feels_like: "-",
        condition: "sun",
        humidity: "-",
        wind: "-",
        sunrise: "-",
        sunset: "-",
        forecast: Array(5).fill({ day: "-", temp: "-", condition: "sun" })
      });
      fadeOutLoader(300);
      // If you prefer redirect on all errors, adjust behavior above.
    }

  // --------- Завантаження зображення NASA (JPEG 1024x512) ----------
    async function loadNasaImage() {
      try {
        const res = await fetch(`${API_BASE}/api/nasa/snapshot?city=${encodeURIComponent(city)}`);
        if (!res.ok) {
          // do not redirect for auxiliary image errors; handle common statuses
          if (res.status === 404) {
            console.warn("NASA snapshot not found (404)");
            return;
          } else if (res.status === 500) {
            console.warn("NASA service error (500)");
            return;
          } else {
            throw new Error(`NASA API returned ${res.status}`);
          }
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);

        if (nasaImg) {
          nasaImg.src = objectUrl;
          nasaImg.style.display = "block";
          nasaImg.style.opacity = "0";
          nasaImg.onload = () => {
            nasaImg.style.transition = "opacity 0.3s ease";
            nasaImg.style.opacity = "1";
            if (downloadBtn) downloadBtn.style.display = "inline-block";
          };
        }

        if (downloadBtn) {
          downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = `NASA_${city}.jpg`;
            document.body.appendChild(a);
            a.click();
            a.remove();
          };
        }
      } catch (err) {
        console.error("NASA fetch error:", err);
      }
    }

    loadNasaImage();

  // --------- Зміна міста ----------
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        localStorage.removeItem("city");
        window.location.href = "index.html";
      });
    }
  })();
});
