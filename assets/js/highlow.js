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
            console.log(data)
            const response2 = await fetch(`https://api.teleport.org/api/urban_areas/slug:${citySlug}/images/` );
            const data2 = await response2.json();
            console.log(data2)
            const photos = data2.photos[0].image;
            console.log(photos)
            
                
            const image = photos.mobile;

            $(`#${imgId}`).attr("src", image);

            console.log(`${cityName} image: ${image}`);
            

            const population = data.categories[1].data[0].float_value*100000;

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
    $("#nextBtn").click(function () {
        fetchRandomCities();
    });
});
