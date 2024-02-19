mapboxgl.accessToken = 'pk.eyJ1Ijoic3JhdmFuaS1nIiwiYSI6ImNrdGN2MDd4ZzB5Z3UycG15ZnYycmYxYXQifQ.V-zOLTNSdugV9QBnhKceaQ';

var map, userLatitude, userLongitude;

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, { enableHighAcuuracy: true })

function successLocation(position) {
  userLongitude = position.coords.longitude;
  userLatitude = position.coords.latitude;
  
  setupMap([userLongitude, userLatitude])
}

function errorLocation() {
  alert('Please enable the location');
  /*  userLongitude = 78.56867876011565;
    userLatitude = 17.41911525407413;
    setupMap([userLongitude, userLatitude])*/
}

function setupMap(center) {
  map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
    center: center, // Starting position [lng, lat]
    zoom: 15, // Starting zoom level
  })

  const uM = document.createElement('div');
  uM.className = 'userMarker';
  const marker = new mapboxgl.Marker(uM) // initialize a new marker
    .setLngLat(center) // Marker [lng, lat] coordinates
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
      .setHTML(` <p class="user-banner">My Location</p>
                     <p class="user-longitude">Longitude:  ${center[0].toFixed(5)}</p>
                     <p class="user-latitude">Latitude:  ${center[1].toFixed(5)}</p>`)
    )
    .addTo(map); // Add the marker to the map

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());
}

/* Function to calculate distance between two coordinates */
function getDistance(lat1, lon1, lat2, lon2) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344
    return dist;
  }
}

function plotRoute(coords) {
  let start = [userLongitude, userLatitude];
  let storeLat = parseFloat(coords.split("_")[1]);
  let storeLng = parseFloat(coords.split("_")[0]);

  // create a function to make a directions request
  async function getRoute(end) {
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route
      }
    };
    // if the route already exists on the map, we'll reset it using setData
    if (map.getSource('route')) {
      map.getSource('route').setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }
  }

  (function () {
    const coords = [storeLng, storeLat];
    const end = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: coords
          }
        }
      ]
    };
    getRoute(coords);
  })();
}

