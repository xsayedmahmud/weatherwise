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

function buildUrl(endpoint, params) {
  const apiKey = "8ead1f058e524186846112307231508";
  const baseUrl = "http://api.weatherapi.com/v1/";
  const urlParams = new URLSearchParams({
    key: apiKey,
    ...params,
  }).toString();

  return `${baseUrl}${endpoint}.json?${urlParams}`;
}

// currentWeather();

const searchInput = select(".awesomplete");
const awesomplete = new Awesomplete(searchInput);

async function getAutoCompleteSuggestions() {
  const query = searchInput.value.trim();
  if (query.length < 3) {
    awesomplete.list = [];
    return;
  }

  const url = buildUrl("search", { q: query });
  console.log(url);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Invalid");
    const data = await response.json();
    console.log(data);
    const suggestions = data.map((item) => item.name);
    awesomplete.list = suggestions;
  } catch (error) {
    console.error(error.message);
  }
}

searchInput.addEventListener("input", getAutoCompleteSuggestions);
