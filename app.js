window.addEventListener("load", updateMargin);
window.addEventListener("resize", updateMargin);

function updateMargin() {
  const header = document.querySelector(".header");
  const weatherInfo = document.querySelector(".weatherInfo");
  const headerHeight = header.offsetHeight;
  weatherInfo.style.height = `calc(100vh - ${headerHeight}px)`;
  weatherInfo.style.marginTop = `${headerHeight}px`;
}

function buildUrl(endpoint, params) {
  const apiKey = "8ead1f058e524186846112307231508";
  const baseUrl = "http://api.weatherapi.com/v1/";
  const urlParams = new URLSearchParams({
    key: apiKey,
    ...params,
  }).toString();

  return `${baseUrl}${endpoint}.json?${urlParams}`;
}

async function currentWeather() {
  const url = buildUrl("current", { q: "London" });

  try {
    const response = await fetch(url);
    const respJSON = await response.json();
    console.log(respJSON);
  } catch (error) {
    console.error(error);
  }
}

// currentWeather();
