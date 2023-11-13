
/* javascript */
$(document).ready(function () {
  // inital 
  let currentCityDetails;
  $("button:first").click(async function () {
    currentCityDetails = await getData("https://api.teleport.org/api/urban_areas/");
    updateCityDetails();
  });
  $("button:last").click(async function () {
    // next
    currentCityDetails = await getData("https://api.teleport.org/api/urban_areas/");
    updateCityDetails();
  });
  function updateCityDetails() {
    $(".row3 h2:nth-child(1)").text(`Population: ${currentCityDetails.population}`);
    $(".row3 h2:nth-child(2)").text(`Language: ${currentCityDetails.languages[0].language_name}`);
    $(".row3 h2:nth-child(3)").text(`Currency: ${currentCityDetails.currencies[0].code}`);

    $(".row4 h2:nth-child(1)").text(`This City is: ${currentCityDetails.name}`);
    $(".row4 h2:nth-child(2)").text("Score: 0");

    $("#cityImage").attr("src", currentCityDetails.images[0].href);

    $("#cityMap").html("City Map Content");
  }
})

async function getData(url) {
  let city;
  let options = { method: "GET"};
  await fetch(url, options)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    const citiesData = data._links && data._links["ua:items"];
    if (citiesData && citiesData.length > 0) {
      const cities = citiesData.map((item) => item.href);

      console.log(cities);

      const randomIndex = Math.floor(Math.random() * cities.length);
      city = cities[randomIndex];
    } else {
      console.error("No cities found in the response.");
    }
  });
  return fetch(city).then((response) => response.json);
}
