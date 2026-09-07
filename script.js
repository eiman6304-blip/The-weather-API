// 1. مسك العناصر من الـ HTML
const cityInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn'); // ملاحظة: صلحنا الإملاء هنا
const cityNameDisplay = document.getElementById('cityName');
const tempResult = document.getElementById('currentTemperature');
const errorMessage = document.getElementById('errorMessage');
const currentIcon = document.getElementById('currentIcon');
const errorPage = document.getElementById('errorPage');
const retryBtn = document.getElementById('retryBtn');
const mainContent = document.querySelector('.container');

let lastCity = '';
// مفتاح الطقس (Open-Meteo لا يحتاج مفتاح API، مجاني ومباشر)

// 2. الاستماع لزر البحث
searchBtn.addEventListener('click', (e) => {
  e.preventDefault(); // منع إعادة تحميل الصفحة لأننا داخل form
  const cityName = cityInput.value.trim();
  if (cityName !== '') {
    updateWeatherInfo(cityName);
    cityInput.value = '';
    cityInput.blur();
  }
});

// الاستماع لزر الـ Enter
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value.trim());
    cityInput.value = '';
    cityInput.blur();
  }
});

async function updateWeatherInfo(city) {

  try {
mainContent.style.display = 'block';
errorPage.classList.remove('show');
    // 1. البحث عن المدينة
    const locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    const locationData = await locationResponse.json();

    if (!locationData.results || locationData.results.length === 0) {
      throw new Error('المدينة غير موجودة');
    }

    // 2. أخذ إحداثيات المدينة
    const latitude = locationData.results[0].latitude;
    const longitude = locationData.results[0].longitude;

    const realCityName = locationData.results[0].name;
    const country = locationData.results[0].country || '';


    // ====================================
    // 3. هنا ضع الكود الذي سألت عنه
    // ====================================

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code,is_day` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&hourly=temperature_2m,weather_code,is_day` +
      `&timezone=auto`
    );

    const weatherData = await weatherResponse.json();


    // ====================================
    // 4. الطقس الحالي
    // ====================================

    const current = weatherData.current;

    cityNameDisplay.innerText =
      `${realCityName}, ${country}`;

    tempResult.innerText =
      `${Math.round(current.temperature_2m)}°`;

    currentIcon.innerText =
      getWeatherVisuals(
        current.weather_code,
        current.is_day
      );

    document.getElementById('feelsLike').innerText =
      `${Math.round(current.apparent_temperature)}°`;

    document.getElementById('humidity').innerText =
      `${current.relative_humidity_2m}%`;

    document.getElementById('wind').innerText =
      `${Math.round(current.wind_speed_10m)} km/h`;

    document.getElementById('rain').innerText =
      `${current.precipitation} mm`;


    // ====================================
    // 5. التوقعات اليومية
    // ====================================

    updateDailyForecast(weatherData.daily);


    // ====================================
    // 6. التوقعات بالساعة
    // ====================================

    window.hourlyWeatherData = weatherData.hourly;

    updateHourlyForecast(
      weatherData.hourly,
      0
    );

  } catch (error) {

    console.error(error);

  mainContent.style.display = 'none';
  errorPage.classList.add('show');
}
}

function updateDailyForecast(daily) {

  const forecastCards = document.querySelectorAll(
    '.forecast-container .forecast-card'
  );

  forecastCards.forEach((card, index) => {

    // التأكد أن هناك بيانات لهذا اليوم
    if (index >= daily.time.length) {
      return;
    }

    const date = new Date(daily.time[index]);

    const dayName = date.toLocaleDateString('en-US', {
      weekday: 'short'
    });

    const maxTemp = Math.round(
      daily.temperature_2m_max[index]
    );

    const minTemp = Math.round(
      daily.temperature_2m_min[index]
    );

    const weatherCode = daily.weather_code[index];

    // أيقونة النهار
    const icon = getWeatherVisuals(weatherCode, 1);

    // تحديث البطاقة
    card.querySelector('.forecast-day').innerText =
      dayName;

    card.querySelector('.forecast-icon').innerText =
      icon;

    card.querySelector('.max-temp').innerText =
      `${maxTemp}°`;

    card.querySelector('.min-temp').innerText =
      `${minTemp}°`;
  });
}
const weatherConditions = {

  0: {
    label: "Clear sky",
    icon: "☀️",
    nightIcon: "🌙"
  },

  1: {
    label: "Mainly clear",
    icon: "🌤️",
    nightIcon: "🌙"
  },

  2: {
    label: "Partly cloudy",
    icon: "⛅",
    nightIcon: "☁️"
  },

  3: {
    label: "Overcast",
    icon: "☁️",
    nightIcon: "☁️"
  },

  45: {
    label: "Fog",
    icon: "🌫️",
    nightIcon: "🌫️"
  },

  48: {
    label: "Rime fog",
    icon: "🌫️",
    nightIcon: "🌫️"
  },

  51: {
    label: "Light drizzle",
    icon: "🌦️",
    nightIcon: "🌧️"
  },

  53: {
    label: "Drizzle",
    icon: "🌦️",
    nightIcon: "🌧️"
  },

  55: {
    label: "Heavy drizzle",
    icon: "🌧️",
    nightIcon: "🌧️"
  },

  61: {
    label: "Light rain",
    icon: "🌦️",
    nightIcon: "🌧️"
  },

  63: {
    label: "Rain",
    icon: "🌧️",
    nightIcon: "🌧️"
  },

  65: {
    label: "Heavy rain",
    icon: "🌧️",
    nightIcon: "🌧️"
  },

  71: {
    label: "Light snow",
    icon: "🌨️",
    nightIcon: "🌨️"
  },

  73: {
    label: "Snow",
    icon: "❄️",
    nightIcon: "❄️"
  },

  75: {
    label: "Heavy snow",
    icon: "❄️",
    nightIcon: "❄️"
  },

  80: {
    label: "Rain showers",
    icon: "🌦️",
    nightIcon: "🌧️"
  },

  81: {
    label: "Rain showers",
    icon: "🌧️",
    nightIcon: "🌧️"
  },

  82: {
    label: "Heavy rain showers",
    icon: "⛈️",
    nightIcon: "⛈️"
  },

  95: {
    label: "Thunderstorm",
    icon: "⛈️",
    nightIcon: "⛈️"
  },

  96: {
    label: "Thunderstorm with hail",
    icon: "⛈️",
    nightIcon: "⛈️"
  },

  99: {
    label: "Thunderstorm with heavy hail",
    icon: "⛈️",
    nightIcon: "⛈️"
  }
};
// دالة لجلب الأيقونة الصحيحة بناءً على الكود ووقت النهار/الليل
function getWeatherVisuals(weatherCode, isDay) {
  const condition = weatherConditions[weatherCode] || { icon: "🌡️", nightIcon: "🌡️" };
  
  // إذا كان isDay يساوي 0 يعني ليل، نختار أيقونة الليل، وإذا 1 نختار أيقونة النهار
  return isDay === 1 ? condition.icon : condition.nightIcon;
}
function updateHourlyForecast(hourly) {

  const hourlyContainer = document.getElementById('hourlyForecast');

  // تفريغ البيانات القديمة
  hourlyContainer.innerHTML = '';

  // نحدد الساعة الحالية
  const now = new Date();

  // نبحث عن الساعة الحالية في بيانات API
  let currentIndex = hourly.time.findIndex(time => {
    return new Date(time) >= now;
  });

  // إذا لم نجدها نبدأ من أول ساعة
  if (currentIndex === -1) {
    currentIndex = 0;
  }

  // عرض 8 ساعات
  const hoursToShow = 8;

  for (
    let i = currentIndex;
    i < currentIndex + hoursToShow && i < hourly.time.length;
    i++
  ) {

    const date = new Date(hourly.time[i]);

    // تحويل الوقت إلى 3 PM / 4 PM ...
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    });

    const temperature = Math.round(
      hourly.temperature_2m[i]
    );

    const weatherCode = hourly.weather_code[i];

    const isDay = hourly.is_day[i];

    const icon = getWeatherVisuals(
      weatherCode,
      isDay
    );

    // إنشاء البطاقة
    const card = document.createElement('div');

    card.className = 'hour-card';

    card.innerHTML = `
      <span class="hour-icon">${icon}</span>

      <span class="hour-time">
        ${timeString}
      </span>

      <span class="hour-temp">
        ${temperature}°
      </span>
    `;

    hourlyContainer.appendChild(card);
  }
}
// تحديث توقعات الأيام
updateDailyForecast(weatherData.daily);

// تحديث توقعات الساعات
updateHourlyForecast(weatherData.hourly);
retryBtn.addEventListener('click', () => {

  if (lastCity !== '') {
    updateWeatherInfo(lastCity);
  }

});









