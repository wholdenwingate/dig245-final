/* javascript */
let latitude;
let longitude;
let initalMapView = true;
let map;
let score = 0;

$(document).ready(async function () {
  // inital 
  map = L.map('map').setView([0, 0], 1);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  let currentCityDetails;
  let highScore = localStorage.getItem('highScore') || 0;
  $("#highScore").text(`${highScore}`);

  let gameStarted = false;
  let guessSubmitted = false;
  disableNextButton();
  disableSubmitButton();

  function enableInput () {
    $("#userGuess").prop("disabled", false);
  }

  $("#userGuess").keypress(function (e) {
    if (e.which === 13) {
      $("#submitGuess").click();
    }
  });

  async function startNewGame() {
    enableInput();
    currentCityDetails = await getData("https://api.teleport.org/api/urban_areas/");
    updateCityDetails(currentCityDetails);
    gameStarted = true;
    guessSubmitted = false;
    initalMapView = true;
    enableSubmitButton();
    disableNextButton();
    disableBeginButton();
    document.getElementById("score").innerText = score;
  }

  $("#beginButton").click(async function (event) {
    event.preventDefault();
    startNewGame();
    score = 0;
    clearInput();
  });
  
  $("#submitGuess").click(function () {
    if (gameStarted && currentCityDetails && !guessSubmitted) {
      handleGuess();
    }
  });

  $("#nextButton").click(async function () {
    if (gameStarted && guessSubmitted) {
      startNewGame();
      updateMapView(0, 0, initalMapView);
      clearInput();
    }
    document.getElementById("score").innerText = score;
  });

  $("form").submit(function (event) {
    event.preventDefault();
    $("#submitGuess").click();
    return false;
  });
  
  function clearInput() {
    $("#userGuess").val("");
  }

  function handleGuess () {
    const userGuess = document.getElementById("userGuess").value.toLowerCase();
    const actualCityName = currentCityDetails.cityName.toLowerCase();

    if (userGuess === actualCityName) {
      alert("Correct!");
      score++;
      disableSubmitButton();
      enableNextButton();
      disableBeginButton();
      gameStarted = true;
      guessSubmitted = true;
      initalMapView = false;


      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore); 
        $("#highScore").text(`${highScore}`);    
      }
      updateMapView(latitude, longitude, guessSubmitted);
    } else {
      alert(`Incorrect! This city is ${actualCityName}. Press Begin to restart.`);
      enableBeginButton();
      disableSubmitButton();
      disableNextButton();
      gameStarted = false;
    }
    document.getElementById("score").innerText = score;
  }
  

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
  function disableBeginButton() {
    $("#beginButton").prop("disabled", true)
  }
  function enableBeginButton() {
    $("#beginButton").prop("disabled", false)
  }
  

  function updateCityDetails(cityDetails, image) {
    const populationElement = document.querySelector("#population");
    const languageElement = document.querySelector("#language");
    const currencyElement = document.querySelector("#currency");
    const lifeExpectancyElement = document.querySelector("#lifeExpectancy");

    if (populationElement && languageElement && currencyElement && lifeExpectancyElement) {
      populationElement.innerHTML = `<strong>Population:</strong> ${cityDetails.population}`;
      languageElement.innerHTML = `<strong>Language:</strong> ${cityDetails.language}`;
      currencyElement.innerHTML = `<strong>Currency:</strong> ${cityDetails.currency}`;
      lifeExpectancyElement.innerHTML = `<strong>Life Expectancy:</strong> ${cityDetails.lifeExpectancy}`;
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
      const citiesData = data._links["ua:item"];
      if (citiesData && citiesData.length > 0) {
        const randomIndex = Math.floor(Math.random() * citiesData.length);
        city = citiesData[randomIndex];
      } else {
        console.error("No cities found in the response.");
      }
    });
  const citySlug = city.name.toLowerCase().replace(/\s+/g, '-');
  const response2 = await fetch(`https://api.teleport.org/api/urban_areas/slug:${citySlug}/images/`);
  const data2 = await response2.json()
  const photos = data2.photos[0].image;
  const image = photos.mobile;
  document.querySelector("#cityImage").src = image

  
  let population;
  let language;
  let currency;
  let lifeExpectancy;
  let cityName;
  

  return fetch(city.href)
    .then((response) => response.json())
    .then(data => {
      if (data.bounding_box && data.bounding_box.latlon) {
        latitude = data.bounding_box.latlon.north;
        longitude = data.bounding_box.latlon.east;
      }
      const cityData = data._links["ua:details"];
      cityName = city.name
      return fetch(cityData.href)
        .then((response) => response.json())
    })
    .then(dataCity => {
      for (let i = 0; i < dataCity.categories.length; i++ ) {
        const category = dataCity.categories[i];
        if (category.id === 'CITY-SIZE') {
          for (let j = 0; j < category.data.length; j++) {
            pop = category.data[j];
            if (pop.id === 'POPULATION-SIZE') {
              population = category.data[0].float_value * 1000000;
            }
          }
        } else if (category.id === 'LANGUAGE'){
          for (let k = 0; k < category.data.length; k++) {
            const lang = category.data[k];
            if (lang.id ==='SPOKEN-LANGUAGES') {
              language = lang.string_value;
            }
          }
        } else if (category.id === 'ECONOMY') {
          for (let m = 0; m < category.data.length; m++ ) {
            money = category.data[m];
            if (money.id === 'CURRENCY-URBAN-AREA') {
              currency = category.data[0].string_value;
            }
          }
        } else if (category.id === 'INTERNAL') {
          for (let n = 0; n < category.data.length; n++) {
            const lifeExpect = category.data[n];
            if (lifeExpect.id === 'LIFE-EXPECTANCY') {
              lifeExpectancy = lifeExpect.float_value;
            }
          }
        }
      }
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
function updateMapView(latitude, longitude, guessSubmitted) {
  if (latitude !== undefined && longitude !== undefined && guessSubmitted) {
    map.setView([latitude, longitude], 7);
  } else {
    map.setView([0, 0], 1);
  }
}
let autoComplete;
autoComplete.exports = {
  autoComplete: tarekraafat/autocomplete.js
}
const autoCompleteJS = new autoComplete({
//selector: "#autoComplete",
  data: {
    src: async() => {
      try {
        document
          .getElementById("userGuess")
          .setAttribute("placeholder","Loading..." )
        const source = await fetch("https://api.teleport.org/api/urban_areas");
        const data = await source.json();
        document
          .getElementById("userGuess")
          .setAttribute("userGuess", autoCompleteJS.placeHolder);
          return data;
        } catch (error) {
          return error;
        }
    },
    keys: ["name"],
    cache: true,
    filter: (list) => {
      const filteredResults = Array.from(
        new Set(list.map((value) => value.match))
      ).map((name) => {
        return list.find((value) => value.match === name);
      });
      return filteredResults;
    }
  },
  placeHolder: "Type your guess...",
  resultsList: {
    element: (list, data) => {
      const info = document.createElement("p");
      if (data.results.length > 0) {
        info.innerHTML = `Displaying <strong>${data.results.length}</strong> out of <strong>${data.matches.length}</strong> results`;
      } else {
        info.innerHTML = `Found <strong>${data.matches.length}</strong> matching results for <strong>"${data.query}"</strong>`;
    }
    list.prepend(info);
  },
  resultItem: {
    element: (item, data) => {
      item.style = "display: flex; justify-content: space-between;";
      item.innerHTML = `
      <span style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
        ${data.match}
      </span>
      <span style="display: flex; align-items: center; font-size: 13px; font-weight: 100; text-transform: uppercase; color: rgba(0,0,0,.2);">
        ${data.key}
      </span>`;
    },
    highlight: true
  },
  events: {
    input: {
      focus: () => {
        if (autoCompleteJS.input.value.length) autoCompleteJS.start();
      }
    }
  }
  }
});
autoCompleteJS.input.addEventListener("selection", function (event) {
  const feedback = event.detail;
  autoCompleteJS.input.blur();
  const selection = feedback.selection.value[feedback.selection.key];
  // Render selected choice to selection div
  document.querySelector(".selection").innerHTML = selection;
  // Replace Input value with the selected value
  autoCompleteJS.input.value = selection;
  // Console log autoComplete data feedback
  console.log(feedback);
});


// Blur/unBlur page elements
const action = (action) => {
  const title = document.querySelector("h1");
  const mode = document.querySelector(".mode");
  const selection = document.querySelector(".selection");
  const footer = document.querySelector(".footer");

  if (action === "dim") {
    title.style.opacity = 1;
    mode.style.opacity = 1;
    selection.style.opacity = 1;
  } else {
    title.style.opacity = 0.3;
    mode.style.opacity = 0.2;
    selection.style.opacity = 0.1;
  }
};

// Blur/unBlur page elements on input focus
["focus", "blur"].forEach((eventType) => {
  autoCompleteJS.input.addEventListener(eventType, () => {
    // Blur page elements
    if (eventType === "blur") {
      action("dim");
    } else if (eventType === "focus") {
      // unBlur page elements
      action("light");
    }
  });
});
