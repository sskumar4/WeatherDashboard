function initPage() {

    // Initialze variables

    const inputEl = document.getElementById("cityInput");

    const searchEl = document.getElementById("search-button");

    const clearEl = document.getElementById("clear-history");

    const nameEl = document.getElementById("cityName");

    const currentPicEl = document.getElementById("current-pic");

    const currentTempEl = document.getElementById("temperature");

    const currentHumidityEl = document.getElementById("humidity");


    const currentWindEl = document.getElementById("WindSpeed");

    const currentUVEl = document.getElementById("UVIndex");

    const historyEl = document.getElementById("history");

    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

    let searchedCity = '';

    //Openweathermap API key

    const APIKey = "fb95eea909ba35cdae25cddea228fe32";

    //  When search button is clicked, read the city name typed by the user
    // function to get weather details of the city
    function getWeather(cityName) {

        //  Use saved city name, execute a current condition get request from open weather map api

        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;

        //Axios call and response
        axios.get(queryURL)

        .then(function(response) {

            //  Parse response to display current conditions

            //  Method for using "date" objects from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

            const currentDate = new Date(response.data.dt * 1000);

            const day = currentDate.getDate();

            const month = currentDate.getMonth() + 1;

            const year = currentDate.getFullYear();

            nameEl.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";

            let weatherPic = response.data.weather[0].icon;

            currentPicEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");

            currentPicEl.setAttribute("alt", response.data.weather[0].description);

            currentTempEl.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";

            currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";

            currentWindEl.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";

            let lat = response.data.coord.lat;

            let lon = response.data.coord.lon;

            let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";

            //Axios call and response
            axios.get(UVQueryURL)

            .then(function(response) {
                //Create the UV index element
                let UVIndex = document.createElement("span");
                //Choose the correct background color based on the UV value
                let uv_value = Math.round(response.data[0].value);
                if (uv_value > 0 && uv_value <= 2) {
                    UVIndex.setAttribute("style", "background-color:green");
                } else if (uv_value >= 3 && uv_value <= 5) {
                    UVIndex.setAttribute("style", "background-color:yellow");
                } else if (uv_value >= 6 && uv_value <= 7) {
                    UVIndex.setAttribute("style", "background-color:orange");
                } else if (uv_value >= 8 && uv_value <= 10) {
                    UVIndex.setAttribute("style", "background-color:red");
                } else if (uv_value >= 11) {
                    UVIndex.setAttribute("style", "background-color:indigo");
                }



                UVIndex.innerHTML = response.data[0].value;

                currentUVEl.innerHTML = "UV Index: ";

                currentUVEl.append(UVIndex);

            });

            //  Use saved city name, execute a 5-day forecast get request from open weather map api

            let cityID = response.data.id;

            let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;

            //Axios call and response
            axios.get(forecastQueryURL)

            .then(function(response) {

                //  Parse response to display forecast for next 5 days underneath current conditions

                console.log(response);

                const forecastEls = document.querySelectorAll(".forecast");

                for (i = 0; i < forecastEls.length; i++) {

                    forecastEls[i].innerHTML = "";

                    const forecastIndex = i * 8 + 4;

                    const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);

                    const forecastDay = forecastDate.getDate();

                    const forecastMonth = forecastDate.getMonth() + 1;

                    const forecastYear = forecastDate.getFullYear();

                    const forecastDateEl = document.createElement("p");

                    forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                    forecastDateEl.setAttribute("style", "background-color: black; text-align: center");

                    forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;

                    forecastEls[i].append(forecastDateEl);

                    const forecastWeatherEl = document.createElement("img");

                    forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");

                    forecastWeatherEl.setAttribute("style", "text-align: center");

                    forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);

                    forecastEls[i].append(forecastWeatherEl);

                    const forecastTempEl = document.createElement("p");

                    forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " &#176F";

                    forecastEls[i].append(forecastTempEl);

                    const forecastHumidityEl = document.createElement("p");

                    forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";

                    forecastEls[i].append(forecastHumidityEl);

                }
                //Only in success path, add searched city to searchHistory
                searchHistory.push(searchedCity);

                localStorage.setItem("search", JSON.stringify(searchHistory));

                renderSearchHistory();
            })

        }).catch(function(err) {

            alert('City not found, please enter correct city name')
        });

    }

    //Adding eventlistener for search button click

    searchEl.addEventListener("click", function() {

        const searchTerm = inputEl.value;

        searchedCity = searchTerm;

        getWeather(searchTerm);



    })


    // Clears the search history
    clearEl.addEventListener("click", function() {

        searchHistory = [];
        localStorage.setItem("search", JSON.stringify(searchHistory));

        renderSearchHistory();

    })



    function k2f(K) {

        return Math.floor((K - 273.15) * 1.8 + 32);

    }


    // function to display the search history
    function renderSearchHistory() {

        historyEl.innerHTML = "";

        for (let i = 0; i < searchHistory.length; i++) {

            const historyItem = document.createElement("input");

            // <input type="text" readonly class="form-control-plaintext" id="staticEmail" value="email@example.com"></input>

            historyItem.setAttribute("type", "text");

            historyItem.setAttribute("readonly", true);

            historyItem.setAttribute("class", "form-control d-block bg-white");

            historyItem.setAttribute("value", searchHistory[i]);

            historyItem.addEventListener("click", function() {

                getWeather(historyItem.value);

            })

            historyEl.append(historyItem);

        }

    }


    // Call search history function
    renderSearchHistory();

    if (searchHistory.length > 0) {

        getWeather(searchHistory[searchHistory.length - 1]);

    }





    //  Save user's search requests and display them underneath search form

    //  When page loads, automatically generate current conditions and 5-day forecast for the last city the user searched for



}

initPage();