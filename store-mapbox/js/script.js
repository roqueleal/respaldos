
mapboxgl.accessToken = 'pk.eyJ1Ijoib2xhdHVuaml5c28iLCJhIjoiY2p4MXRrdm04MGNjcjN6cDlpbWw1c2U3ZCJ9.zV2Ms88OdzBWUvPNZx9tNg';

// This adds the map to your page
var map = new mapboxgl.Map({
  // container id specified in the HTML
  container: 'map',
  // style URL
  style: 'mapbox://styles/mapbox/light-v10',
  // initial position in [lon, lat] format
  center: [138.86,36.45],
  // initial zoom
  zoom: 4
});

var stores = 'https://raw.githubusercontent.com/roqueleal/geo/master/coord.geojson';        
map.on('load', () => {
	fetch(stores)
		.then(response => response.json())
		.then((data) => {
			map.addSource("locations", {
				type: 'geojson',
				data: data
			});

			map.addLayer({
				"id": "locations",
				"type": "symbol",
				"source": "locations",
				"layout": {
					'icon-image': 'restaurant-15',
					"icon-size": 1,
					"icon-anchor": "bottom",
					'icon-allow-overlap': true,
				}
			});

			// Initialize the list
			buildLocationList(data);
		});
});

function buildLocationList(data) {
  // Iterate through the list of stores
  for (i = 0; i < data.features.length; i++) {
    var currentFeature = data.features[i];
    // Shorten data.feature.properties to `prop` so we're not
    // writing this long form over and over again.
    var prop = currentFeature.properties;
    // Select the listing container in the HTML and append a div
    // with the class 'item' for each store
    var listings = document.getElementById('listings');
    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'item';
    listing.id = 'listing-' + i;

    // Create a new link with the class 'title' for each store
    // and fill it with the store address
    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.dataPosition = i;
    link.innerHTML = prop.Main3;
    link.addEventListener('click', function (e) {
      // Update the currentFeature to the store associated with the clicked link
      var clickedListing = data.features[this.dataPosition];
      // 1. Fly to the point associated with the clicked link
      flyToStore(clickedListing);
      // 2. Close all other popups and display popup for clicked store
      createPopUp(clickedListing);
      // 3. Highlight listing in sidebar (and remove highlight for all other listings)
      var activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');
    });

    // Create a new div with the class 'details' for each store
    // and fill it with the city and phone number
    var details = listing.appendChild(document.createElement('div'));
    details.innerHTML = prop.Layoutdet;
    if (prop.phone) {
      details.innerHTML += ' · ' + prop.phoneFormatted;
    }
  }
}


// Add an event listener for when a user clicks on the map
map.on('click', function (e) {
  
  // Query all the rendered points in the view
  var features = map.queryRenderedFeatures(e.point, { layers: ['locations'] });
  if (features.length) {
    var clickedPoint = features[0];
    // 1. Fly to the point
    flyToStore(clickedPoint);
    // 2. Close all other popups and display popup for clicked store
    createPopUp(clickedPoint);
    // 3. Highlight listing in sidebar (and remove highlight for all other listings)
    var activeItem = document.getElementsByClassName('active');
    if (activeItem[0]) {
      activeItem[0].classList.remove('active');
    }
    // Find the index of the store.features that corresponds to the clickedPoint that fired the event listener
    var selectedFeature = clickedPoint.properties.address;

    for (var i = 0; i < stores.features.length; i++) {
      if (stores.features[i].properties.address === selectedFeature) {
        selectedFeatureIndex = i;
      }
    }
    // Select the correct list item using the found index and add the active class
    var listing = document.getElementById('listing-' + selectedFeatureIndex);
    listing.classList.add('active');
  }
});

