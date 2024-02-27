var xhr, storesData;
var currentStoreMarkers = [];

const load = () => {
    xhr = new XMLHttpRequest();

    if (!xhr) {
        alert('Couldn\'t create XHR Object');
        return false;
    }

    xhr.onreadystatechange = renderContent;
    xhr.open('GET', 'stores.json');
    xhr.send();

    function renderContent() {
        if (xhr.readyState === 4) {
            console.log('Received the data');

            if (xhr.status === 200) {
                storesData = JSON.parse(xhr.responseText).stores;
                console.log(storesData);
            } else {
                console.error('Problem making AJAX request');
            }
        }
    };

}

window.onload = load;

document.getElementById('radius').addEventListener('input', getStores);
document.getElementById('category').addEventListener('input', getStores);

function getStores() {
    if (currentStoreMarkers !== null) {
        currentStoreMarkers.forEach(function (element) {
            element.remove();
        })
    }

    if (map.getSource("route")) {

        if (map.getLayer("route")) {
            map.removeLayer("route");
        }

        map.removeSource("route");
    }

    let radius = document.getElementById('radius').value;
    let selectedCategory = document.getElementById('category').value;

    if (storesData) {
        for (const { title, discount, category, logo, coordinates } of storesData) {
            storeLatitude = coordinates.latitude;
            storeLongitude = coordinates.longitude;
            storeCategory = category;
            let distance = getDistance(userLatitude, userLongitude, storeLatitude, storeLongitude);
            if (distance <= radius) {
                if (selectedCategory === 'All' || selectedCategory === storeCategory) {
                    var currentStoreMarker = plotMarker(title, discount, category, logo, storeLatitude, storeLongitude);
                    currentStoreMarkers.push(currentStoreMarker);

                }
            }
        }
    }
}

function plotMarker(title, discount, category, logo, storeLatitude, storeLongitude) {
    const sM = document.createElement('div');
    sM.className = category;
    
    // make a marker for each feature and add it to the map
    var currentStoreMarker = new mapboxgl.Marker(sM).setLngLat([storeLongitude, storeLatitude])
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
                .setHTML(` <p class="desc">${discount}</p>
                               <p class="title">${title}</p>
                               <img class="storeLogo" src="${logo}">
                               <p class="category">${category}</p>
                               <button class="route-btn" onclick="plotRoute(this.nextElementSibling.textContent)">Route</button>
                               <span style="display:none">${storeLongitude}_${storeLatitude}</span>`)
        ).addTo(map);
    return currentStoreMarker;
}
