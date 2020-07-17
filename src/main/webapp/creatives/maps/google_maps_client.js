const DEFAULT_MAP_LAT = 37.422004;
const DEFAULT_MAP_LNG = -122.081402;
const DEFAULT_ZOOM = 13;
const DEFAULT_LOCATION_NUM_DISPLAYED = 4;
const MARKER_SIZE = 25;

export default class GoogleMapsClient {
    constructor() {
        /**
         * The LatLng coordinates representing the location most recently
         * selected by the user, defaulting to the closest location.
         * @private {?google.maps.LatLng}
         */
        this.activeLocation_ = null;
        /**
         * The LatLng coordinates representing the user's current location.
         * @private {?google.maps.LatLng}
         */
        this.currentLocation_ = null;
        /**
         * The string representing the search query.
         * @private {?string}
         */
        this.searchQuery_ = null;
        /**
         * The desired marker image's string URL.
         * @private {?string}
         */
        this.markerImage_ = null;
        /**
         * The DirectionsRenderer object that displays directions from
         * the given request.
         * @private @const {!google.maps.DirectionsRenderer}
         */
        this.directionsRenderer_ = new google.maps.DirectionsRenderer();
        /** 
         * A map object from the Google Maps API.
         * @private {?google.maps.Map}
         */    
        this.map_ = null;
        /** 
         * The element from the document where the travel method selector lives
         * @private {?Element}
         */  
        this.travelMethodElement_ = null;
        /** 
         * The element from the document where the time display div lives
         * @private {?Element}
         */   
        this.timeDisplayElement_ = null;
    }

    /**
     * Assigns the proper HTML element representing the 
     * travel method selector to a variable that can be used inside
     * of the Simid Map class.
     * @param {?Element} element An HTML element.
     */
    setTravelMethodElement(element) {
        this.travelMethodElement_ = element;
    }

    /**
     * Assigns the proper HTML element representing the 
     * time display div to a variable that can be used inside
     * of the Simid Map class.
     * @param {?Element} element An HTML element.
     */
    setTimeDisplayElement(element) {
        this.timeDisplayElement_ = element;
    }

    /**
     * Sets the search query to be used in the Maps API
     * to the value from the creative's adParams.
     * @param {string} query The string representing the search query.
     */
    setSearchQuery(query) {
        this.searchQuery_ = query;
    }

    /**
     * Sets the marker image to be used in the Maps API
     * to the value from the creative's adParams.
     * @param {string} markerImage The string url of the chosen marker iaage.
     */
    setMarkerImage(markerImage) {
        this.markerImage_ = markerImage
    }

    /**
     * Creates and displays a marker on the map representing a given place.
     * @param {?google.maps.LatLng} coordinates The LatLng object of the user's current location.
     */
    setCurrentLocation(coordinates = new google.maps.LatLng(DEFAULT_MAP_LAT, DEFAULT_MAP_LNG)) {
        this.currentLocation_ = coordinates;
    }

    /**
     * Returns the map object within the Simid Map class. 
     */
    getMap() {
        return this.map_;
    }

    /**
     * Loads a map object that currently defaults to a hardcoded location.
     * @param {!Object} mapElement The div within the main document where the map is to be displayed.
     */
    displayMap(mapElement) {
        this.map_ = new google.maps.Map(mapElement, {
            zoom: DEFAULT_ZOOM,
            center: this.currentLocation_
        });
        this.findNearby_();
    }

    /**
     * Searches for the closest corresponding locations based off of the given search parameter,
     * and places pins on the map that represent the closest locations.
     * @private
     */
    findNearby_() {
        const request = {
            location: this.currentLocation_,
            name: this.searchQuery_,
            openNow: true,
            rankBy: google.maps.places.RankBy.DISTANCE
        };
        const placeService = new google.maps.places.PlacesService(this.map_);
        placeService.nearbySearch(request, this.displayResults_.bind(this));
    }

    /**
     * Displays the closest advertisement's locations to a user's current location.
     * @param {!Array<!Object>} results An array of Place Results from the search query.
     * @param {!google.maps.places.PlacesServiceStatus} status The status returned 
     *  by the PlacesService on the completion of its searches.
     * @private 
     */
    displayResults_(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            //Active location is set to the closest location to start.
            this.activeLocation_ = results[0].geometry.location;
            for (let i = 0; i < DEFAULT_LOCATION_NUM_DISPLAYED; i++) {
                this.placeMapMarker_(results[i]);
            }
            this.displayDirections_();
        } else {
            const statusErrorMessage = {
                message: "ERROR: Failed to complete search: " + status,
            };
            //this.simidProtocol.sendMessage(CreativeMessage.LOG, statusErrorMessage);
            this.playAd_();
        }
    }

    /**
     * Creates and displays a marker on the map representing a given place.
     * @param {!Object} place A Place Result object.
     * @private 
     */
    placeMapMarker_(place) {
        const placeIcon = {
            url: this.markerImage_,
            scaledSize: new google.maps.Size(MARKER_SIZE, MARKER_SIZE)
        };
        const placeMarker = new google.maps.Marker({
            map: this.map_,
            position: place.geometry.location,
            icon: placeIcon
        });
        ///Recalculate directions if a different active marker is selected.
        placeMarker.addListener('click', () => {
            this.activeLocation_ = place.geometry.location;
            this.displayDirections_();
        });
    }

    /**
     * Displays the route between the starting loaction and destination
     * based off of the selected travel mode.
     * @private 
     */
    displayDirections_() {
        this.directionsRenderer_.setMap(this.map_);
        this.calculateRoute_();
        this.calculateTravelTime_();
        //If travel method changes, recalculate directions.
        this.travelMethodElement_.addEventListener("change", () => {
            this.calculateRoute_();
            this.calculateTravelTime_();
        });
    }

    /**
     * Calculates the route between the user's current location and current
     * active location based off of the selected travel mode.
     * @private
     */
    calculateRoute_() {
        const dirService = new google.maps.DirectionsService();
        const selectedMode = this.travelMethodElement_.value;
        dirService.route(
            {
                origin: this.currentLocation_,
                destination: this.activeLocation_,
                travelMode: [selectedMode]
            },
            (response, status) => {
                if (status == "OK") {
                    this.directionsRenderer_.setDirections(response);
                } else {
                    const directionsErrorMessage = {
                        message: "ERROR: Failed to load directions: " + status,
                    };
                    //this.simidProtocol.sendMessage(CreativeMessage.LOG, directionsErrorMessage);
                }
            }
        );
    }

    /**
     * Calculates the time it takes to travel from the origin to the destination.
     * @private
     */
    calculateTravelTime_() {
        const travelMode = this.travelMethodElement_.value;
        const matrixService = new google.maps.DistanceMatrixService();
        matrixService.getDistanceMatrix(
            {
                origins: [this.currentLocation_],
                destinations: [this.activeLocation_],
                travelMode: [travelMode],
                unitSystem: google.maps.UnitSystem.IMPERIAL
            }, this.getTravelTime_.bind(this));
    }

    /**
     * Gets the travel time from the distanceMatrix response.
     * @param {!google.maps.DistanceMatrixResponse} response An object containing
     *   distance and duration information for the given origin & destination.
     * @param {!google.maps.DistanceMatrixStatus} travelStatus The status returned 
     *   by the Distance Matrix on the completion of its calculations.
     * @private 
     */
    getTravelTime_(response, travelStatus) {
        if (travelStatus == 'OK') {
            const results = response.rows[0].elements;
            this.displayTravelTimes_(results[results.length - 1].duration.text);
        }
    }

    /**
     * Adds the travel time to the creative display.
     * @param {string} timeString The string object representing travel time.
     * @private
     */
    displayTravelTimes_(timeString) {
        const transportMethod = this.travelMethodElement_.value.toLowerCase();
        this.timeDisplayElement_.innerText = "It will take " + timeString + " to get there by " + transportMethod;
        }
}