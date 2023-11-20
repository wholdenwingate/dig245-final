$(document).ready(function () {
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let isGuessMade = false;
    function updateScoreDisplay() {
        $("#score").text(`Score: ${score}`);
        $("#highscore").text(`High Score: ${highScore}`);
    }
    updateScoreDisplay();
    async function fetchRandomCities() {
        try {

            $("#nextBtn").prop("disabled", true);
            isGuessMade = false;

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
        let population;
        const citySlug = cityName.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '');
        
        try {
            const response = await fetch(`https://api.teleport.org/api/urban_areas/slug:${citySlug}/details/`);
            const data = await response.json();

            const response2 = await fetch(`https://api.teleport.org/api/urban_areas/slug:${citySlug}/images/` );
            const data2 = await response2.json();
            const photos = data2.photos[0].image;
            const image = photos.mobile;

            const population =   parseFloat($(`#${imgId}`).data("population")) ||data.categories[1].data[0].float_value;

            $(`#${imgId}`).attr("src", image);
            $(`#${imgId}`).attr("alt", cityName);
            $(`#${imgId}`).data("population", population);

            const cityLabelId = `#${imgId.replace("Img", "")}`;
            $(cityLabelId).html(cityName);

            $("#nextBtn").prop("disabled", false);

        } catch (error) {
            console.error(`Error fetching details for ${cityName}:`, error);
        }
    }

    function handleUserGuess(population, imgId) {
        const otherImgId = imgId === "city1Img" ? "city2Img" : "city1Img";
        const otherPopulation = getPopulationFromOtherCity(otherImgId);
        
        if(!isNaN(otherPopulation)) {
            if (population > otherPopulation) {
                alert("Correct");
                score++;
            } else {
                alert("Incorrect");
                score = 0;
            }
        }
        
        highScore = Math.max(score, highScore);

        $("#score").text(`Score: ${score}`);
        $("#highscore").text(`High Score: ${Math.max(score, highScore)}`);
        localStorage.setItem('highScore', highScore)
    }

    function getPopulationFromOtherCity(imgId) {
        return $(`#${imgId}`).data("population") || NaN;
    }

    function getRandomCities(array, count) {
        const shuffledArray = array.sort(() => 0.5 - Math.random());
        return shuffledArray.slice(0, count);
    }

    $("#game-container").on('click', 'img', function() {
        const imgId = $(this).attr('id');
        if (!isGuessMade) {
            isGuessMade = true;
            const population = getPopulationFromOtherCity(imgId);
            handleUserGuess(population, imgId);
        }
    });
    
    $("#clickToBeginBtn").click(function () {
        fetchRandomCities();
        score = 0;
        $("#score").text(`Score: ${score}`);
    });
    $("#nextBtn").click(function () {
        if (isGuessMade) {
            fetchRandomCities(); 
        } else {
            alert("Please make a selection first")
        }
    });
    updateScoreDisplay();
});