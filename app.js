const select = (selector) => document.querySelector(selector);

function updateMargin() {
  const header = document.querySelector(".header");
  const weatherInfo = document.querySelector(".weatherInfo");
  const headerHeight = header.offsetHeight;
  weatherInfo.style.height = `calc(100% - ${headerHeight}px)`;
  weatherInfo.style.marginTop = `${headerHeight}px`;
}
window.addEventListener("load", updateMargin);
window.addEventListener("resize", updateMargin);

function buildUrl(endpoint, params) {
  const apiKey = "8ead1f058e524186846112307231508";
  const baseUrl = "http://api.weatherapi.com/v1/";
  const urlParams = new URLSearchParams({
    key: apiKey,
    ...params,
  }).toString();

  return `${baseUrl}${endpoint}.json?${urlParams}`;
}

function formatDateAndTime(localtime) {
  const [date, time] = localtime.split(" ");
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");

  const dateTime = new Date(year, month - 1, day, hour, minute);
  const optionsDate = { weekday: "short", month: "short", day: "numeric" };
  const formattedDate = dateTime.toLocaleString("en-US", optionsDate);
  const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true };
  const lastUpdatedTime = dateTime.toLocaleString("en-US", optionsTime);

  return { formattedDate, lastUpdatedTime };
}

function getCurrentTime(tzId) {
  const date = new Date();

  const options = {
    timeZone: tzId,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const formattedTime = formatter.format(date);

  return formattedTime;
}

function updateTimeDisplay(tzId) {
  const formattedTime = getCurrentTime(tzId);
  select(".heading h2").textContent = formattedTime;
}

function currentWeatherInfo(data) {
  select(
    ".location h3"
  ).textContent = `${data.location.name}, ${data.location.country}`;

  const { formattedDate, lastUpdatedTime } = formatDateAndTime(
    data.location.localtime
  );

  select(".lastUpdated p:last-child").textContent = lastUpdatedTime;

  select(".location p").textContent = formattedDate;

  updateTimeDisplay(data.location.tz_id);
  setInterval(() => {
    updateTimeDisplay(data.location.tz_id);
  }, 30000);

  const iconUrl = `http:${data.current.condition.icon}`;
  select(".tempIcon").src = iconUrl;

  select(".curTemp").textContent = `${data.current.temp_c}°`;

  select(".condition").textContent = data.current.condition.text;

  select(
    ".feelsLike p:last-child"
  ).textContent = `${data.current.feelslike_c}°`;

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

async function currentWeather(queryVal) {
  const url = buildUrl("current", { q: queryVal });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Invalid response");
    const data = await response.json();
    console.log(data);
    currentWeatherInfo(data);
  } catch (error) {
    console.error(error.message);
  }
}

searchInput.addEventListener("input", getAutoCompleteSuggestions);
select(".searchBtn").addEventListener("click", () => {
  const queryVal = searchInput.value.trim();

  if (queryVal.length >= 3) {
    currentWeather(queryVal);
  }
});

currentWeather("auto:ip");

// helper function

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.latitude;
        console.log(lat, long);
      },
      (error) => {
        console.error(`Error getting location: ${error.message}`);
      }
    );
  } else {
    console.log("Error getting location");
  }
}

getUserLocation();
