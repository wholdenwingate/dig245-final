
/* javascript */
$(document).ready(function () {
  // inital 
  let cityDetails;
  $("button:first").click(async function () {
    const CityDetails = await getData("https://api.teleport.org/api/urban_areas/");
    updateCityDetails(cityDetails);
  });
  $("button:last").click(async function () {
    // next
    currentCityDetails = await getData("https://api.teleport.org/api/urban_areas/");
    updateCityDetails();
  });
  function updateCityDetails(cityDetails) {
    const populationElement = document.querySelector(".row3 h2:nth-child(1)");
    const languageElement = document.querySelector(".row3 h2:nth-child(2)");
    const currencyElement = document.querySelector(".row3 h2:nth-child(3)");
    const cityElement =document.querySelector(".row4 h2:nth-child(1)");
    
    if (populationElement && languageElement && currencyElement) {
      populationElement.innerHTML = `Population: ${cityDetails.population}`;
      languageElement.innerHTML = `Language: ${cityDetails.language}`;
      currencyElement.innerHTML = `Currency: ${cityDetails.currency}`;
      cityElement.innerHTML = `This City is: ${cityDetails.name}`;
    }
    //$(".row4 h2:nth-child(1)").text(`This City is: ${currentCityDetails.name}`);
    //$(".row4 h2:nth-child(2)").text("Score: 0");

    $("#cityImage").attr("src", cityDetails.image);

    $("#map").html("City Map Content");
  }
});

// map
var map = L.map('map').setView([0, 0], 1);
// set the tileset
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

async function getData(url) {
  let city;
  let options = { method: "GET"};
  await fetch(url, options)
  .then((response) => response.json())
  .then((data) => {
    console.log(data._links);
    const citiesData = data._links["ua:item"];
    if (citiesData && citiesData.length > 0) {
      const randomIndex = Math.floor(Math.random() * citiesData.length);
      city = citiesData[randomIndex];
      console.log(city)
    } else {
      console.error("No cities found in the response.");
    }
  });
  return fetch(city.href)
  .then((response) => response.json())
  
  .then (data => {
    console.log(data)
    const cityData = data._links["ua:details"];
    console.log(cityData)
    return fetch(cityData.href)
  .then ((response) => response.json())
  .then (dataCity => {
    console.log(dataCity)
    const population = dataCity.categories[1].data[0].float_value;
    const language = dataCity.categories[11].data[2].string_value;
    const currency = dataCity.categories[5].data[0].string_value;
    console.log(population, language, currency)
    return {
      population,
      language,
      currency
    }
      
  })
  //.then (cityImg => {
    //const cityImage = data_links["ua:images"];
    //console.log(cityImage)
  //})
  });
  
}
