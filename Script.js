// This variable will hold our chart so we can reference it later
let myChart;

// This function is called when a button is clicked
async function fetchClimateData(latitude, longitude, locationName) {

    // 1. Show the loading message and hide the download button
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('download-btn').classList.add('hidden');
    document.getElementById('location-name').textContent = locationName;

    // 2. Calculate the dates for the last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]); // Formats date as YYYY-MM-DD
    }

    // 3. Construct the URL for NASA's POWER API
    // This asks for daily average temperature (T2M) for the given latitude/longitude
    const baseUrl = 'https://power.larc.nasa.gov/api/temporal/daily/point?';
    const params = new URLSearchParams({
        parameters: 'T2M',
        start: dates[0],
        end: dates[dates.length - 1],
        latitude: latitude,
        longitude: longitude,
        community: 'RE',
        format: 'JSON'
    });
    const apiUrl = baseUrl + params.toString();

    try {
        // 4. Fetch the data from NASA!
        const response = await fetch(apiUrl);
        const data = await response.json();

        // 5. Extract the temperature values from the response
        const temps = dates.map(date => {
            // NASA's data structure is nested, this digs into it
            return data.properties.parameter.T2M[date];
        });

        // 6. Create the chart with the data we got
        createChart(dates, temps, locationName);

        // 7. Hide loading message, show download button
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('download-btn').classList.remove('hidden');

    } catch (error) {
        // 8. If something goes wrong, show an error
        console.error("Error fetching data from NASA:", error);
        document.getElementById('loading').textContent = 'Failed to load data. Please try again.';
    }
}

// This function creates the graph on the page
function createChart(dates, temperatures, locationName) {
    const ctx = document.getElementById('climate-chart').getContext('2d');

    // If a chart already exists, destroy it before making a new one
    if (myChart) {
        myChart.destroy();
    }

    // Create a new chart using Chart.js
    myChart = new Chart(ctx, {
        type: 'line', // This makes a line chart
        data: {
            labels: dates, // The dates on the bottom (X-axis)
            datasets: [{
                label: Average Temperature (°C) in ${locationName},
                data: temperatures, // The temperature values (Y-axis)
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointBackgroundColor: 'rgb(75, 192, 192)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// This function lets the user download the chart as a PNG image
function downloadChart() {
    if (myChart) {
        const link = document.createElement('a');
        link.download = climate-data-${document.getElementById('location-name').textContent}.png;
        link.href = myChart.toBase64Image();
        link.click();
    }
}
