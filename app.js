async function fetchData() {
    url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const response = await fetch(url);
    const data = await response.json();
    return data
}

function processData(geoData) {
    //Map list[A] => list[B]
    return geoData.features.map(feature => {
        return {
            coordinates: feature.geometry.coordinates,
            magnitude: feature.properties.mag,
            time: feature.properties.time
        }
    })
}

function plotData(earthquakeData) {
    plotMap(earthquakeData);
    plotMagnitudeHistogram(earthquakeData);
    plotMagnitudeVsDepths(earthquakeData);
    plotDailyEarthquakeFrequency(earthquakeData);
}

function plotMap(earthquakeData) {
    const trace1 = {
        type: 'scattergeo',
        locationmode: 'world',
        lon: earthquakeData.map(d => d.coordinates[0]),
        lat: earthquakeData.map(d => d.coordinates[1]),
        text: earthquakeData.map(d => `Magnitude: ${d.magnitude} Time: ${new Date(d.time)}`),
        marker: {
            size: earthquakeData.map(d => d.magnitude * 4),
            color: earthquakeData.map(d => d.magnitude),
            cmin: 0,
            cmax: 8,
            colorscale: "Viridis",
            colorbar: {
                title: 'Magnitude'
            }
        }
    };

    const layout1 = {
        title: 'Global Earthquakes in the Last Week',
        geo: {
            scope: 'world',
            projection: {
                type: 'natural earth'
            },
            showland: true,
            landcolor: 'rgb(243, 243, 243)',
            countrycolor: 'rgb(204, 204, 204)',
        }
    };
    Plotly.newPlot('earthquakePlot', [trace1], layout1);
}

function plotMagnitudeHistogram(earthquakeData) {
    const magnitudes = earthquakeData.map(d => d.magnitude);
    const depths = earthquakeData.map(d => d.coordinates[2]);
    const trace = { 
        x: magnitudes,
        type: 'histogram',
        marker: {
            color: 'pink'
        }
    };
    const layout = {
        title: 'Histogram of Earthquake Magnitudes',
        xaxis: {title: 'Magnitude'},
        yaxis: {title: 'Frequency'}
    };
    Plotly.newPlot('magnitudeHistogram', [trace], layout);
}

function plotDailyEarthquakeFrequency(earthquakeData) {
        const dates = earthquakeData.map(d => new Date(d.time).toLocaleDateString().slice(0,10))
        const counts = dates.reduce((acc, date) => {
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
     
        const trace = {
            x: Object.keys(counts),
            y: Object.values(counts),
            type: 'scatter',
            mode: 'lines+markers',
            marker: {
                color: 'red',
                size: 10
            }
        };
     
        const layout = {
            title: "Earthquakes per Day in the Last Week",
            xaxis: {title: 'Date'},
            yaxis: { title: 'Number of Earthquakes'}
        };
     
        Plotly.newPlot('timeSeriesPlot', [trace], layout);
}

function plotMagnitudeVsDepths(earthquakeData) {
    const magnitudes = earthquakeData.map(d => d.magnitude);
    const depths = earthquakeData.map(d => d.coordinates[2]);
    const trace = { 
        x: magnitudes,
        y: depths,
        mode: 'markers',
        type: 'scatter',
        marker: {size: 8, color: 'blue'}
    };
    const layout = {
        title: 'Magnitude Vs Depth',
        xaxis: {title: 'Magnitude'},
        yaxis: {title: 'Depth (km)'},
        height: 600
    };
    Plotly.newPlot('magnitudeDepthPlot', [trace], layout);
}



fetchData()
    .then(rawData => processData(rawData))
    .then(cleanData => plotData(cleanData))
    
    
  


  