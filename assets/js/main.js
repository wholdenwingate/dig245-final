
/* javascript */
let latitude;
let longitude;
let initalMapView = true;
let map;

$(document).ready(async function () {
  // inital 
  map = L.map('map').setView([0, 0], 1);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  let currentCityDetails;
  let score = 0;  
  let highScore = localStorage.getItem('highScore') || 0;
  $("#highScore").text(`${highScore}`);

  let gameStarted = false;
  let guessSubmitted = false;

  //$("#beginButton").click(async function () {
  currentCityDetails = await getData("https://api.teleport.org/api/urban_areas/");
  updateCityDetails(currentCityDetails);
  gameStarted = true;
  guessSubmitted = false;
  enableSubmitButton();
  score = 0;
  document.getElementById("score").innerText = score;
  //});

  $("#submitGuess").click(function () {
    if (gameStarted && currentCityDetails && !guessSubmitted) {
      const userGuess = document.getElementById("userGuess").value.toLowerCase();
      const actualCityName = currentCityDetails.cityName.toLowerCase();
      disableNextButton();
      if (userGuess === actualCityName) {
        alert("Correct!");
        score++;
        disableSubmitButton();
        enableNextButton();
        gameStarted = false;
        guessSubmitted = true;
        initalMapView = false;

        if (score > highScore) {
          highScore = score;
          localStorage.setItem('highScore', highScore); 
          $("#highScore").text(`${highScore}`);
        }
        updateMapView(latitude, longitude, guessSubmitted);

      } else {
        alert("Incorrect! This city is cityName Press Begin to restart.");
        //enableBeginButton();
        disableNextButton();
        gameStarted = false;
      }
      document.getElementById("score").innerText = score;
    
    }
  });

  function updateMapView(latitude, longitude, guessSubmitted) {
  if (latitude !== undefined && longitude !== undefined && guessSubmitted) {
    map.setView([latitude, longitude], 7);
  } else {
    map.setView([0, 0], 1);
    }
  }

  $("#nextButton").click(async function () {
    // next
    if (!gameStarted && guessSubmitted) {
      currentCityDetails = await getData("https://api.teleport.org/api/urban_areas/");
      updateCityDetails(currentCityDetails);
      enableSubmitButton();
      disableNextButton();
      guessSubmitted = false;
      gameStarted = true;
      initalMapView = true;

      updateMapView(latitude, longitude, guessSubmitted);
    }
  });

  function enableSubmitButton() {
    $("#submitGuess").prop("disabled", false);
  }
  function disableSubmitButton() {
    $("#submitGuess").prop("disabled", true);
  }
  function enableNextButton() {
    $("#nextButton").prop("disabled", false);
  }
  function disableNextButton() {
    $("#nextButton").prop("disabled", true);
  }
  

  function updateCityDetails(cityDetails, image) {
    const populationElement = document.querySelector("#population");
    const languageElement = document.querySelector("#language");
    const currencyElement = document.querySelector("#currency");
    const lifeExpectancyElement = document.querySelector("#lifeExpectancy");

    if (populationElement && languageElement && currencyElement && lifeExpectancyElement) {
      populationElement.innerHTML = `Population: ${cityDetails.population}`;
      languageElement.innerHTML = `Language: ${cityDetails.language}`;
      currencyElement.innerHTML = `Currency: ${cityDetails.currency}`;
      lifeExpectancyElement.innerHTML = `Life Expectancy: ${cityDetails.lifeExpectancy}`;
    }
    $("#cityImage").attr("src", image);
 
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
  let lifeExpectancy;
  let cityName;
  

  return fetch(city.href)
    .then((response) => response.json())
    .then(data => {
      console.log(data)
      if (data.bounding_box && data.bounding_box.latlon) {
        latitude = data.bounding_box.latlon.north;
        longitude = data.bounding_box.latlon.east;
        console.log(latitude, longitude)
      }
      
      const cityData = data._links["ua:details"];
      console.log(cityData)
      cityName = city.name
      return fetch(cityData.href)
        .then((response) => response.json())
    })
    .then(dataCity => {
      console.log(dataCity)
      
      
      for (let i = 0; i < dataCity.categories.length; i++ ) {
        const category = dataCity.categories[i];
        if (category.id === 'CITY-SIZE') {
          population = category.data[0].float_value * 1000000;
        } else if (category.id === 'LANGUAGE'){
          for (let j = 0; j < category.data.length; j++) {
            const lang = category.data[j];
            if (lang.id ==='SPOKEN-LANGUAGES') {
              language = lang.string_value;
            };
          }
        } else if (category.id === 'ECONOMY') {
          currency = category.data[0].string_value;
        } else if (category.id === 'INTERNAL') {
          for (let k = 0; k < category.data.length; k++) {
            const lifeExpect = category.data[k];
            if (lifeExpect.id === 'LIFE-EXPECTANCY') {
              lifeExpectancy = lifeExpect.float_value;
            }
          }
        }
      }
        console.log(population, language, currency, lifeExpectancy, longitude, latitude)
      return {
        population,
        language,
        currency,
        cityName,
        latitude,
        longitude,
        lifeExpectancy,
      };
    });

}

