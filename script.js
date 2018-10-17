// This isn't necessary but it keeps the editor from thinking L is a typo
/* global L, Mustache */

var map = L.map('map').setView([40.7254, -73.9771], 11);



// Get the popup template from the HTML.
// We can do this here because the template will never change.
var parkPopupTemplate = document.querySelector('.park-popup-template').innerHTML;

var eatsPopupTemplate = document.querySelector('.eats-popup-template').innerHTML;


/*
// Add base layer - Stamen
L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);
*/


// Add base layer - Mapbox
L.tileLayer('https://api.mapbox.com/styles/v1/patra/cjn58pt2q05b42rnxx3919i1i/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicGF0cmEiLCJhIjoiY2pnenYwMnNsMnFiaDJxcDZrcmp2em5zdyJ9.kYctUroykJROCdaUGZovGw', {
  maxZoom: 18
}).addTo(map);


// loading data with promises
var parkFetch = fetch('https://cdn.glitch.com/0a66c592-a363-401d-9a13-1b68a378f2d8%2F9hm6-w2k7.geojson?1538250015685')
    .then(function (response) {
      // Read data as JSON
      return response.json();
    })

var eatsFetch = fetch('https://cdn.glitch.com/0a66c592-a363-401d-9a13-1b68a378f2d8%2FConcessions.geojson?1538361561998')
  .then(function (response) {
    return response.json();
  });


// Once both parks and eats fetches have loaded, do some work with them
Promise.all([parkFetch, eatsFetch])
  .then(function (fetchedData) {
    console.log('Both datasets have loaded');
  
    // Unpack the data from the Promise
    var parkData = fetchedData[0];
    var eatsData = fetchedData[1];
  
    //put the layer in a variable here so can refer to it below
    var parkLayer = L.geoJson(parkData, {
      pointToLayer: function (geoJsonPoint, latlng) {
        return L.circleMarker(latlng);
      },
      style: function (geoJsonFeature) {
        return {
          fillColor: '#0f731d',
          fillOpacity: 0.2,
          stroke: false,
        };
      },
      
      onEachFeature: function (feature, layer) {
        layer.on('mouseover', function() {
          console.log('mouseover');
          layer.setStyle({color : '#617349', fillColor: '#0f731d', weight: '2px', stroke: 'true'});  
        });
    
        layer.on('mouseout', function() {
          console.log('mouseout');
          // Use the resetStyle function on parkLayer to reset the layer's style
          // This was causing an error because the style before was making the layer disappear.
          parkLayer.resetStyle(layer);  
        });
    
        layer.on('click', function () {
          // This function is called whenever a feature on the layer is clicked
          console.log('onclick feature: ', layer.feature);
    
         // layer.setStyle({color: '#617349', fillColor: '#0f731d', weight: '2px', stroke: 'true'});

          // Render the template with all of the properties. Mustache ignores properties
          // that aren't used in the template, so this is fine.
          
          var names = new Map([['M', 'Manhattan'], ['X', 'Bronx'], ['B', 'Brooklyn'], ['Q', 'Queens'], ['R', 'Staten Island']]);
          
          layer.feature.properties.fullname = names.get(layer.feature.properties.borough);
          
          var sidebarContentArea = document.querySelector('.sidebar-park-content');
          console.log(sidebarContentArea);
          console.log(layer.feature.properties);
          console.log(layer.feature.properties.borough);
          console.log(names.get(layer.feature.properties.borough));
          sidebarContentArea.innerHTML = Mustache.render(parkPopupTemplate, layer.feature.properties);
      
          map.fitBounds(layer.getBounds());
        });
        
      }
    }).addTo(map);
  
  
   var eatsLayer = L.geoJson(eatsData, {
      pointToLayer: function (geoJsonPoint, latlng) {
        return L.circleMarker(latlng);
      },
      style: function (geoJsonFeature) {
        return {
          fillColor: '#c88d75',
          radius: 5,
          fillOpacity: 0.7,
          stroke: false,
          z: 100000,
        };
      },
      
      onEachFeature: function (feature, layer) {
        layer.on('click', function () {
          console.log('eats layer onclick feature: ', layer.feature);
    
          var sidebarContentArea = document.querySelector('.sidebar-eats-content');
          console.log(sidebarContentArea);
          sidebarContentArea.innerHTML = Mustache.render(eatsPopupTemplate, layer.feature.properties);
        });
      }
    });
   
   eatsLayer.addTo(map);
  
    var eatsSwitch = document.querySelector('.eats-switch');
    eatsSwitch.addEventListener('change', function () {
      console.log(map.hasLayer(eatsLayer));
      if (map.hasLayer(eatsLayer)) {
        console.log('trying to remove layer');
        map.removeLayer(eatsLayer);
      } else {
        map.addLayer(eatsLayer);
      }
      
    });
  
});
                                


var recenterButton = document.querySelector('.recenter-button');
recenterButton.addEventListener('click', function () {
  map.setView([40.7254, -73.9771], 11);
});

