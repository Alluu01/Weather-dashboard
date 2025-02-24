// Function to fetch weather data from the API
async function fetchWeatherData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        console.log('Fetched weather data:', data); // Log the fetched data for debugging
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Function to display temperature readings
function displayWeatherReadings(data, getCheckedValues) {
    const readings = data.hourly[getCheckedValues];
    const timestamps = data.hourly.time;

    if (!readings || !timestamps || readings.length === 0 || timestamps.length === 0) {
        console.warn(`${getCheckedValues} data or timestamps not available`);
        return;
    }

    const viewContent = document.getElementById('view1title');
    viewContent.innerHTML = `<h2>${getCheckedValues} Readings</h2>`;
    readings.forEach((value, index) => {
        const timestamp = new Date(timestamps[index]).toLocaleString('fi-FI', { timeZone: 'Europe/Helsinki', hour24: true });
        viewContent.innerHTML += `<div class="weather-value">${timestamp} - ${value}</div>`;
    });
}

function displaySpecificReadings(data, readingType, viewId) {
    const specificReadings = data.hourly[readingType];
    const timestamps = data.hourly.time.map(timestamp => moment(timestamp).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm'));

    if (!specificReadings || !timestamps || specificReadings.length === 0 || timestamps.length === 0) {
        console.error(`${readingType} data or timestamps not available`);
        return;
    }

    // Limit to the last 48 hours
    const last48HoursData = specificReadings.slice(-48);
    const last48HoursTimestamps = timestamps.slice(-48);

    const chartData = {
        labels: timestamps,
        datasets: [{
            label: `${readingType}`,
            data: specificReadings,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1
        }]
    };

    const ctx = document.getElementById(viewId + '-chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'DD-MM-YYYY HH:mm'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: data.hourly_units[readingType]
                    }
                }
            }
        }
    });

    console.log(viewId);
    const viewContent = document.getElementById(viewId);

    var title = document.getElementById("title");
    if (title === null) {
        title = document.createElement("h2");
        title.setAttribute("id", "title");
    }

    title.innerHTML = `<h2>${readingType} Readings</h2>`;
    viewContent.appendChild(title);
    viewContent.appendChild(ctx.canvas);
}







async function showView(viewNumber) {

    console.log(viewNumber)

    var days = document.getElementById('timespan' + viewNumber).value;
    var forecastDays = '0';

    if (days === '0') {
        forecastDays = '1';
    }

    console.log("days = " + days);

    let endpoint;
    switch (viewNumber) {
        case 1:
            var weather = getCheckedValues();
            console.log(weather);
            endpoint = `https://api.open-meteo.com/v1/forecast?latitude=61.4991&longitude=23.7871&hourly=${weather}&past_days=${days}&forecast_days=${forecastDays}&timezone=Europe%2FHelsinki`;
            break;
        case 2:
            endpoint = `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=rain&past_days=${days}&forecast_days=${forecastDays}&timezone=Europe%2FHelsinki`; // Fetching data for the previous 7 days
            break;
        case 3:
            endpoint = `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=wind_speed_10m&past_days=${days}&forecast_days=${forecastDays}&timezone=Europe%2FHelsinki`; // Fetching data for the previous 7 days
            break;
        default:
            console.error('Invalid view number');
            return;
    }

    const data = await fetchWeatherData(endpoint);
    if (!data) return;

    // Show all weather views
    const weatherViews = document.querySelectorAll('.weather-view');
    weatherViews.forEach(view => view.style.display = 'block');

    // Dynamically generate the IDs for the statistics boxes
    const statisticsBoxId = 'view' + viewNumber + '-statistics';

    switch (viewNumber) {
        case 1:
            const variables1 = document.getElementById("weatherVariables");
            variables1.style.display = 'block';
            const selectedWeatherVariable = getCheckedValues(); // Replace with your actual function call
            displayWeatherReadings(data, selectedWeatherVariable);
            break;
        case 2:
            const variables = document.getElementById("weatherVariables");
            variables.style.display = 'none';

            destroyChart('view2-chart');
            displaySpecificReadings(data, 'rain', 'view2');
            const statisticsDataView2 = data.hourly.rain; // Extracting rain data for statistics calculation
            const statisticsView2 = await calculateStatistics(statisticsDataView2);
            if (statisticsView2) {
                displayStatistics(statisticsView2, statisticsBoxId); // Pass the statistics box ID directly
            } else {
                console.error('Failed to calculate statistics for View 2');
            }
            break;
        case 3:
            destroyChart('view3-chart');
            displaySpecificReadings(data, 'wind_speed_10m', 'view3');
            const statisticsDataView3 = data.hourly.wind_speed_10m; // Extracting wind speed data for statistics calculation
            const statisticsView3 = await calculateStatistics(statisticsDataView3);
            if (statisticsView3) {
                displayStatistics(statisticsView3, statisticsBoxId); // Pass the statistics box ID directly
            } else {
                console.error('Failed to calculate statistics for View 3');
            }
            break;
        default:
            console.error('Invalid view number');
    }

    // Hide other views except the selected one
    
    weatherViews.forEach(view => {
        if (view.id !== 'view' + viewNumber) {
            view.style.display = 'none';
        }
    });
}



async function displayStatistics(viewNumber, data) {
    const statisticsData = extractDataForStatistics(data); // Extract relevant data for statistics calculation
    const statistics = await calculateStatistics(statisticsData);
    displayStatisticsInfo(viewNumber, statistics);
}


function extractDataForStatistics(data) {
    // For example, let's say you want to extract temperature data for the past 7 days
    const temperatureData = data.hourly.temperature_2m; // Assuming temperature data is available in hourly.temperature_2m
    const temperatureLast7Days = temperatureData.slice(-7); // Extracting temperature data for the last 7 days
    return temperatureLast7Days;
}




async function displayStatistics(statisticsData, elementId) {
    console.log(elementId);
    const statisticsElement = document.getElementById(elementId) ;
    if (!statisticsElement) {
        console.error(`Element with ID '${elementId}' not found.`);
        return;
    }
    statisticsElement.innerHTML
    
    // Display statistics
    const {
        mean,
        median,
        mode,
        range,
        standardDeviation,
        min,
        max
    } = statisticsData;

    statisticsElement.innerHTML = `
        <h2>Statistics</h2>
        <ul>
            <li>Mean: ${mean.toFixed(2)}</li>
            <li>Median: ${median.toFixed(2)}</li>
            <li>Mode: ${mode}</li>
            <li>Range: ${range.toFixed(2)}</li>
            <li>Standard Deviation: ${standardDeviation.toFixed(2)}</li>
            <li>Min: ${min.toFixed(2)}</li>
            <li>Max: ${max.toFixed(2)}</li>
        </ul>
    `;
}

function getCheckedValues() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    var checkedValues = [];

    checkboxes.forEach(function(checkbox) {
        checkedValues.push(checkbox.getAttribute('value'));
    });

    // Join the values into a comma-separated string
    return checkedValues.join(', ');
}








// Fetch weather data from API
async function fetchWeatherData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

function destroyChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    Chart.getChart(canvas)?.destroy();
}