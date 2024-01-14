// Set the URL as a variable
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Set different map layers and layout
let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let satelliteLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 15,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

const baseMaps = {
    Satellite: satelliteLayer,
    Street: streetLayer
};
let myMap = L.map("map", {
    center: [0, 0],
    zoom: 2,
    layers: [satelliteLayer]
});

// Set maxBounds after map is created
myMap.setMaxBounds([[ -90, -180], [90, 180 ]]);

// Event listener to restrict zooming out beyond the world bounds
myMap.on('zoomend', function() {
    if (myMap.getZoom() < 2) {
        myMap.setZoom(2);
    }
});
// Function to determine color based on earthquake depth
function getColor(eq_depth) {
    const gradientColors = ['#D4B9DA', '#C994C7', '#DF65B0', '#DD1C77', '#980043'];

    return eq_depth > 90 ? gradientColors[4] :
           eq_depth > 70 ? gradientColors[3] :
           eq_depth > 50 ? gradientColors[2] :
           eq_depth > 30 ? gradientColors[1] :
           gradientColors[0];
}

// Fetch earthquake data and plot circles on the map
d3.json(url).then(function (data) {
    for (var i = 0; i < data.features.length; i++) {
        // Create circles with varying properties based on earthquake data
        L.circle([data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]], {
            fillOpacity: 0.85,
            color: getColor(data.features[i].geometry.coordinates[2]),
            radius: Math.pow(data.features[i].properties.mag, 2) * 7500
        })
        .bindPopup(`
            <ul style="list-style-type:none; padding: 0; font-size: 16px;">
                <li style="font-size: 18px; font-weight: bold;">Magnitude: <span style="font-weight: normal;">${data.features[i].properties.mag.toLocaleString()} md</span></li>
                <li style="font-size: 18px; font-weight: bold;">Location: <span style="font-weight: normal;">${data.features[i].properties.place}</span></li>
                <li style="font-size: 18px; font-weight: bold;">Depth: <span style="font-weight: normal;">${data.features[i].geometry.coordinates[2].toLocaleString()} km</span></li>
            </ul>
        `)
        .addTo(myMap);
    }
});

// Create legend and add to the map
const legendControl = L.control({ position: 'bottomright' });

legendControl.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend'),
        depth = [0, 10, 30, 50, 70, 90];

    for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depth[i] + 1) + '"></i> ' +
            (depth[i] === 90 ? '&ge;' + depth[i] : depth[i] + '&ndash;' + depth[i + 1]) + '<br>';
    }

    return div;
};
legendControl.addTo(myMap);

// Add layer control to the map
L.control.layers(baseMaps).addTo(myMap);
