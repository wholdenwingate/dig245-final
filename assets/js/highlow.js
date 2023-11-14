$(document).ready(function () {
    let score = 0;
    let highScore = 0;

    async function fetchRandomCities() {
        try {
            const response = await fetch("https://api.teleport.org/api/urban_areas/");
            const data = await response.json();
            const cities = data._links["ua:item"].map(item => item.name);
            const randomCities = getRandomCities(cities, 2);

            await fetchCityDetails(randomCities[0], "city1Img");
            await fetchCityDetails(randomCities[1], "city2Img");
        } catch (error) {
            console.error("Error fetching random cities:", error);
        }
    }

    async function fetchCityDetails(cityName, imgId) {
        const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');

        try {
            const response = await fetch(`https://api.teleport.org/api/urban_areas/slug:${citySlug}/details/`);
            const data = await response.json();
            
            const photos = data._links;
            
            if (photos) {
                
                const image = photos[0].image.web;

                $(`#${imgId}`).attr("src", image);

                console.log(`${cityName} image: ${image}`);
            } 

            const population = data.population;

            console.log(`${cityName} population: ${population}`);
        } catch (error) {
            console.error(`Error fetching details for ${cityName}:`, error);
        }
    }

    function getRandomCities(array, count) {
        const shuffledArray = array.sort(() => 0.5 - Math.random());
        return shuffledArray.slice(0, count);
    }

    
    $("#clickToBeginBtn").click(function () {
        fetchRandomCities();
    });
});
