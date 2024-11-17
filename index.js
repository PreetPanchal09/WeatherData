import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

function ready(fn) {
    if (document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

function encode(text) {
    return encodeURIComponent(text);
}

function graphPlot(data) {
    const div = document.querySelector("#plot");
    div.textContent = '';

    const plot = Plot.plot({
        marks: [
            Plot.ruleY([]),
            Plot.lineY(data, {x: "time", y: "tempurature2m_max", stroke: "red"}),
            Plot.lineY(data, {x: "time", y: "tempurature2m_min", stroke: "blue"})
        ]
    });

    div.append(plot);
    div.append(document.createElement("h1").textContent = 'This work')
}

async function getDataFromAPI({longitude = 0, latitude = 0, 
    startDate = "2022-01-01", endDate="2022-12-31",
    dailyParameters=["temperature_2m_max", "temperature_2m_min"],
    units = {
        temperature: "fahrenheit",
        windspeed: "mph",
        precipitation: "inch"
    },
    timezone="America/New_York"}
 = {})
    {
    const BASEURL = "https://archive-api.open-meteo.com/v1/";
    let Request_URL = `${BASEURL}?latitude=${encode(latitude)}&longitude=${encode(longitude)}&start_date=${encode(startDate)}&end_date=${encode(endDate)}&daily=${dailyParameters.join()}&temperature_unit=${encode(units.temperature)}&windspeed_unit=${encode(units.windspeed)}&precipitation_unit=${encode(units.precipitation)}&timezone=${encode(timezone)}`;

    const response = await fetch(Request_URL);
    
    if (response.ok) {
        const weatherData = response.json();
        return weatherData.daily.time.map((time, idx) => {
            const data = {time: new Date(time)};
            dailyParameters.forEach(parameter => {
                data[parameter] = weatherData.daily[parameter][idx];
            });
            return data;
        });
    } else {
        throw new Error(`Not able to fetch ${Request_URL}`);
    }
}

function setUpPage() {
    graphPlot(getDataFromAPI());
}

ready(setUpPage)