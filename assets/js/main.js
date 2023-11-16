
/* javascript */
$(document).ready(function () {
  // inital 
  let currentCityDetails;
  let score = 0;  
  let gameStarted = false;

  $("button:first").click(async function () {
    currentCityDetails = await getData("https://api.teleport.org/api/urban_areas/");
    updateCityDetails(currentCityDetails);
    gameStarted = true;
    enableButtons();
  });

  $("#submitGuess").click(function () {
    if (gameStarted) {
      const userGuess = document.getElementById("userGuess").value.toLowerCase();
      const actualCityName = currentCityDetails.name.toLowerCase();

      if (userGuess === actualCityName) {
        alert("Correct! You earned a point.");
        score++;
      } else {
        alert("Incorrect. Try again!");
      }
      document.getElementById("score").innerText = score;
    }
  });

  $("button:last").click(async function () {
    // next
    if (gameStarted) {
      currentCityDetails = await getData("https://api.teleport.org/api/urban_areas/");
      updateCityDetails(currentCityDetails);
    }
  });

  function enableButtons() {
    $("#submitGuess").prop("disabled", false);
    $("button:last").prop("disabled", false);
}

  function updateCityDetails(cityDetails, image) {
    const populationElement = document.querySelector("#population");
    const languageElement = document.querySelector("#language");
    const currencyElement = document.querySelector("#currency");
    
    if (populationElement && languageElement && currencyElement) {
      populationElement.innerHTML = `Population: ${cityDetails.population}`;
      languageElement.innerHTML = `Language: ${cityDetails.language}`;
      currencyElement.innerHTML = `Currency: ${cityDetails.currency}`;
    }
    $("#cityImage").attr("src", image);

    $("#map").html("City Map Content");
  }
});

async function getData(url) {
  let city;
  let options = { method: "GET" };
  await fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      console.log(data._links);
      const citiesData = data._links["ua:item"];
      if (citiesData && citiesData.length > 0) {
        const randomIndex = Math.floor(Math.random() * citiesData.length);
        city = citiesData[randomIndex];

      } else {
        console.error("No cities found in the response.");
      }

    });
  console.log(city)
  const citySlug = city.name.toLowerCase().replace(/\s+/g, '-');
  const response2 = await fetch(`https://api.teleport.org/api/urban_areas/slug:${citySlug}/images/`);
  const data2 = await response2.json()
  console.log(data2)
  const photos = data2.photos[0].image;
  const image = photos.mobile;
  document.querySelector("#cityImage").src = image
  console.log(image)
  let population;
  let language;
  let currency;
  return fetch(city.href)
    .then((response) => response.json())
    .then(data => {
      console.log(data)
      const cityData = data._links["ua:details"];
      console.log(cityData)
      return fetch(cityData.href)
        .then((response) => response.json())
    })
    .then(dataCity => {
      console.log(dataCity)
      
      for (let i = 0; i < dataCity.categories.length; i++ ) {
        const category = dataCity.categories[i];
        if (category.id === 'CITY-SIZE') {
          population = category.data[0].float_value * 100000;
        } else if (category.id === 'LANGUAGE'){
          language = category.data[2].string_value;
        } else if (category.id === 'ECONOMY') {
          currency = category.data[0].string_value;
        }
      }
        console.log(population, language, currency)
      return {
        population,
        language,
        currency,
      }

    });

}


// map
var map = L.map('map').setView([0, 0], 1);
// set the tileset
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);