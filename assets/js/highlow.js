// JS for Higher-Population
$(document).ready(function() {
    let cityOne;
    let cityTwo;

    async function getCitiesData(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    function getRandomCity(citiesArray) {
        const randomIndex = Math.floor(Math.random() * citiesArray.length);
        return citiesArray[randomIndex];
    }
    async function initializeGame() {
        const citiesData  = await getCitiesData("https://api.teleport.org/api/urban_areas/");
        const citiesArray = citiesData._links.urban_area.map(city => city.href);

        cityOne = getRandomCity(citiesArray);
        cityTwo = getRandomCity(citiesArray);

        const cityOneData = await getCitiesData(cityOne);
        const cityTwoData = await getCitiesData(cityTwo);

        console.log("City 1 Population:", cityTwoData.population);
        console.log("City 2 Population:" , cityTwoData.population);

        $("nextBtn").prop("disabled", false);
    }
    $("#clickToBeginBtn").on("click", async function () {
        await initializeGame();   
    });
    $("#nextBtn").on("click", async function () {
        await initializeGame();
    });
});
