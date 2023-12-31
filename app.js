const select = (selector) => document.querySelector(selector);

function updateMargin() {
  const header = select(".header");
  const headerHeight = header.offsetHeight;
  document.documentElement.style.setProperty(
    "--header-height",
    `${headerHeight}px`
  );
}
window.addEventListener("load", updateMargin);
window.addEventListener("resize", updateMargin);

function buildUrl(endpoint, params) {
  const apiKey = "8ead1f058e524186846112307231508";
  const baseUrl = "https://api.weatherapi.com/v1/";
  const urlParams = new URLSearchParams({
    key: apiKey,
    ...params,
  }).toString();

  return `${baseUrl}${endpoint}.json?${urlParams}`;
}

function selectTemp(tempC, tempF) {
  const useFahrenheit = select(".toggleUnit input").checked;
  return useFahrenheit ? tempF : tempC;
}

function getCurrentDateTime(tzId) {
  const date = new Date();

  const dateOptions = {
    timeZone: tzId,
    weekday: "short",
    month: "short",
    day: "2-digit",
  };

  const timeOptions = {
    timeZone: tzId,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const dateFormatter = new Intl.DateTimeFormat("en-US", dateOptions);
  const timeFormatter = new Intl.DateTimeFormat("en-US", timeOptions);

  const formattedDate = dateFormatter.format(date);
  const formattedTime = timeFormatter.format(date);

  return { formattedDate, formattedTime };
}

function updateTimeDisplay(tzId) {
  const { formattedDate, formattedTime } = getCurrentDateTime(tzId);
  select(".heading h2").textContent = formattedTime;
  select(".location p").textContent = formattedDate;
}
let updateTimeInterval;

function getAirQuality(usEpaIndex, gbDefraIndex) {
  let quality = "Unknown";

  if (usEpaIndex === 2 || (gbDefraIndex >= 4 && gbDefraIndex <= 6)) {
    quality = "Moderate";
  } else if (usEpaIndex === 1 || (gbDefraIndex >= 1 && gbDefraIndex <= 3)) {
    quality = "Good";
  } else if (usEpaIndex >= 3 || gbDefraIndex >= 7) {
    quality = "Poor";
  }

  return quality;
}

function currentWeatherInfo(data) {
  select(".location h3").textContent = `${data.location.name}`;

  const lastUpdatedTime = new Date(
    data.current.last_updated
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  select(".lastUpdated p:last-child").textContent = lastUpdatedTime;

  const currentTzId = data.location.tz_id;
  clearInterval(updateTimeInterval);
  updateTimeDisplay(currentTzId);
  updateTimeInterval = setInterval(() => {
    updateTimeDisplay(currentTzId);
  }, 60000);

  const iconUrl = `https:${data.current.condition.icon}`;
  select(".tempIcon").src = iconUrl;

  const curTemp = selectTemp(data.current.temp_c, data.current.temp_f);

  select(".curTemp").textContent = `${curTemp}°`;

  select(".condition").textContent = data.current.condition.text;

  const feelsLike = selectTemp(
    data.current.feelslike_c,
    data.current.feelslike_f
  );

  select(".feelsLike p:last-child").textContent = `${feelsLike}°`;

  select(
    ".wind p:last-child"
  ).textContent = `${data.current.wind_dir} ${data.current.wind_kph} km/h`;

  select(".uvIndex p:last-child").textContent = `${data.current.uv} ${
    data.current.uv < 3 ? "Low" : "High"
  }`;

  select(".humidity p:last-child").textContent = `${data.current.humidity}%`;

  select(".visibility p:last-child").textContent = `${data.current.vis_km} km`;

  select(".precip p:last-child").textContent = `${data.current.precip_mm} mm`;

  select(".cloud p:last-child").textContent = `${data.current.cloud}%`;

  const usEpaIndex = data.current.air_quality["us-epa-index"];
  const gbDefraIndex = data.current.air_quality["gb-defra-index"];

  select(".aqi p:last-child").textContent = getAirQuality(
    usEpaIndex,
    gbDefraIndex
  );
}

const searchInput = select(".awesomplete");
const awesomplete = new Awesomplete(searchInput);

async function getAutoCompleteSuggestions() {
  const query = searchInput.value.trim();
  if (query.length < 3) {
    awesomplete.list = [];
    return;
  }

  const url = buildUrl("search", { q: query });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Invalid response");
    const data = await response.json();
    const suggestions = data.map((item) => item.name);
    awesomplete.list = suggestions;
  } catch (error) {
    console.error(error.message);
  }
}

searchInput.addEventListener("input", getAutoCompleteSuggestions);

function hourlyForecastInfo(data) {
  const tableBody = select(".forecast .table-container table tbody");

  const timeCells = [];
  const temperatureCells = [];
  const conditionCells = [];
  const rainChanceCells = [];
  const windCells = [];
  const humidityCells = [];
  const feelsLikeCells = [];
  const uvIndexCells = [];

  data.forEach((hour) => {
    const time = new Date(hour.time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const iconUrl = `${hour.condition.icon}`;
    const tempUnit = selectTemp(hour.temp_c, hour.temp_f);
    const temperature = `${tempUnit}°`;
    const condition = `${hour.condition.text}`;
    const rainChance = `${hour.will_it_rain}`;
    const wind = `${hour.wind_dir} ${hour.wind_kph} km/h`;
    const humidity = `${hour.humidity}%`;
    const feelsLike = `${hour.feelslike_c}°`;
    const uvIndex = `${hour.uv} ${hour.uv < 3 ? "Low" : "High"}`;

    timeCells.push(
      `<td><div><img src="${iconUrl}"> <span>${time}</span></div></td>`
    );
    temperatureCells.push(`<td>${temperature}</td>`);
    conditionCells.push(`<td>${condition}</td>`);
    rainChanceCells.push(`<td>${rainChance}</td>`);
    windCells.push(`<td>${wind}</td>`);
    humidityCells.push(`<td>${humidity}</td>`);
    feelsLikeCells.push(`<td>${feelsLike}</td>`);
    uvIndexCells.push(`<td>${uvIndex}</td>`);
  });

  tableBody.innerHTML = `
    <tr><th>Time</th>${timeCells.join("")}</tr>
    <tr><th>Temperature</th>${temperatureCells.join("")}</tr>
    <tr><th>Condition</th>${conditionCells.join("")}</tr>
    <tr><th>Chance of Rain</th>${rainChanceCells.join("")}</tr>
    <tr><th>Wind</th>${windCells.join("")}</tr>
    <tr><th>Humidity</th>${humidityCells.join("")}</tr>
    <tr><th>Feels Like</th>${feelsLikeCells.join("")}</tr>
    <tr><th>UV Index</th>${uvIndexCells.join("")}</tr>
  `;
}

function weatherHighlights(data) {
  const maxTemp = selectTemp(data.day.maxtemp_c, data.day.maxtemp_f);
  const minTemp = selectTemp(data.day.mintemp_c, data.day.mintemp_f);

  select(".highTemp p:last-child").textContent = `${maxTemp}°`;
  select(".lowTemp p:last-child").textContent = `${minTemp}°`;
  select(".sunrise p:last-child").textContent = `${data.astro.sunrise}`;
  select(".sunset p:last-child").textContent = `${data.astro.sunset}`;
  select(".moonrise p:last-child").textContent = `${data.astro.moonrise}`;
  select(".moonset p:last-child").textContent = `${data.astro.moonset}`;
  select(".avgHumid p:last-child").textContent = `${data.day.avghumidity}%`;
  select(".avgVis p:last-child").textContent = `${data.day.avgvis_km} km`;
}

function updateForecastDates(forecastDays) {
  const selectDate = document.getElementById("forecastDate");
  const { selectedIndex } = selectDate;
  selectDate.innerHTML = "";

  forecastDays.forEach((day, index) => {
    const date = new Date(day.date);
    const formattedDate = date.toLocaleDateString("en-us", {
      month: "short",
      day: "2-digit",
    });

    const option = document.createElement("option");
    option.value = index;
    option.textContent = formattedDate;
    selectDate.appendChild(option);
  });

  selectDate.selectedIndex = selectedIndex;
}

async function getWeatherData(queryVal, dateIndex = 0) {
  const url = buildUrl("forecast", { q: queryVal, days: 3, aqi: "yes" });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Invalid response");
    const data = await response.json();
    console.log(data);
    updateForecastDates(data.forecast.forecastday);
    currentWeatherInfo(data);
    hourlyForecastInfo(data.forecast.forecastday[dateIndex].hour);
    weatherHighlights(data.forecast.forecastday[dateIndex]);
  } catch (error) {
    console.error(error.message);
  }
}

let lastQuery = "auto:ip";

function updateWeatherData(dateIndex) {
  const queryVal = searchInput.value.trim();
  const queryToUse = queryVal.length >= 3 ? queryVal : lastQuery;

  getWeatherData(queryToUse, dateIndex);
}

const forecastDate = document.getElementById("forecastDate");

forecastDate.addEventListener("change", (e) => {
  const dateIndex = e.target.value;
  updateWeatherData(dateIndex);
});

select(".searchBtn").addEventListener("click", () => {
  const dateIndex = forecastDate.value;
  const queryVal = searchInput.value.trim();
  if (queryVal.length >= 3) {
    lastQuery = queryVal;
    getWeatherData(queryVal, dateIndex);
  }
});

select(".toggleUnit input").addEventListener("change", () => {
  const dateIndex = forecastDate.value;
  updateWeatherData(dateIndex);
});

const initialDateIndex = forecastDate.value;
getWeatherData(lastQuery, initialDateIndex);
