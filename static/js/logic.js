// Store API link
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

console.log("queryUrl\n", queryUrl);

function markerSize(mag) {
  return mag * 30000;
}

function markerColor(mag) {
  if (mag <= 1) {
      return "#ADFF2F";
  } else if (mag <= 2) {
      return "#9ACD32";
  } else if (mag <= 3) {
      return "#FFFF00";
  } else if (mag <= 4) {
      return "#ffd700";
  } else if (mag <= 5) {
      return "#FFA500";
  } else {
      return "#FF0000";
  };
}

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array


  var earthquakes = L.geoJSON(earthquakeData, {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
 onEachFeature : function (feature, layer) {

    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " +  feature.properties.mag + "</p>")
    },     pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.properties.mag),
        fillOpacity: 1,
        stroke: false,
    })
  }
  });
    


  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define lightmap and darkmap layers
  var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18, 
    id: 'mapbox/light-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18, 
    id: 'mapbox/dark-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
  })   


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the satelitemap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09,-95.71],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });

  
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
    
        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [0, 1, 2, 3, 4, 5];
    
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(magnitudes[i] + 1) + '"></i> ' + 
        + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
        }
    
        return div;
    };
    
    legend.addTo(myMap);

}