import BaseSimidCreative from '../base_simid_creative.js';
import {CreativeMessage, CreativeErrorCode} from '../constants.js';

const AdParamKeys = {
  BUTTON_LABEL: 'buttonLabel',
  SEARCH_QUERY: 'searchQuery',
  MARKER: 'marker',
};

const FIND_NEAREST_TEMPLATE_TEXT = "Find Nearest ";
const DEFAULT_BUTTON_LABEL = "Location";
const DEFAULT_ZOOM = 13;
const DEFAULT_LOCATION_NUM_DISPLAYED = 4;
const MARKER_SIZE = 25;
const DEFAULT_MAP_LAT = 37.422004;
const DEFAULT_MAP_LNG = -122.081402;

/**
 * A sample SIMID ad that shows a map of nearby locations.
 */
export default class SimidMapCreative extends BaseSimidCreative {
  constructor() {
    super();
    /**
     * A map object from the Google Maps API.
     * @private {?google.maps.Map}
     */
    this.map_ = null;
    /**
     * The desired marker image's string URL.
     * @private {?string}
     */
    this.markerImage_ = null;
    /**
     * The string representing the search query.
     * @private {?string}
     */
    this.searchQuery_ = null;
    /**
     * The LatLng coordinates representing the closest advertised location.
     * @private {?google.maps.LatLng}
     */
    this.activeLocation_ = null;
    /**
     * The LatLng coordinates representing the user's current location.
     * @private {?google.maps.LatLng}
     */
    this.currentLocation_ = null;
    /**
     * The DirectionsRenderer object that displays directions from
     * the given request.
     * @private @const {!google.maps.DirectionsRenderer}
     */
    this.directionsRenderer_ = new google.maps.DirectionsRenderer();

    /**
     * A list of the travel modes supported by the Google Maps API.
     * @private @const {!array}
     */
    this.transportMethods_ = [
      this.createTravelOption_("Driving"),
      this.createTravelOption_("Walking"),
      this.createTravelOption_("Bicycling"),
      //Maps API designates Transit as bus, train, tram, light rail, and subway.
      this.createTravelOption_("Transit")
    ];
  }

  /** @override */
  onInit(eventData) {
    this.updateInternalOnInit(eventData);
    this.validateAndParseAdParams_(eventData);
  }

  /**
   * Checks validity of ad parameters and rejects with proper message if invalid.
   * @param eventData an object that contains information details for a particular event
   *   such as event type, unique Ids, creativeData and environmentData.
   * @private 
   */ 
  validateAndParseAdParams_(eventData) {
    if (this.creativeData.adParameters == "") {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.UNSPECIFIED, 
        message: "Ad parameters not found"});
        return;
    }

    let adParams = "";
    try {
      adParams = JSON.parse(this.creativeData.adParameters);
    } catch (exception) {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.CREATIVE_INTERNAL_ERROR, 
        message: "Invalid JSON input for ad parameters"});
        return;
    }
    const buttonLabel = adParams[AdParamKeys.BUTTON_LABEL]; 
    this.searchQuery_ = adParams[AdParamKeys.SEARCH_QUERY];
    this.markerImage_ = adParams[AdParamKeys.MARKER];

    if (!this.searchQuery_) {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.UNSPECIFIED, 
        message: `Required field ${AdParamKeys.SEARCH_QUERY} not found`});
        return;
    }
    this.simidProtocol.resolve(eventData, {});
  }

  /** @override */
  onStart(eventData, buttonLabel) {
    super.onStart(eventData);
    this.specifyButtonFeatures_(buttonLabel);
  }

  /**
   * Sets the text of the Find Nearest button and assigns it a click functionality.
   * @param {string=} buttonLabel Refers to the value given to the BUTTON_LABEL key in 
   *   the AdParamKeys object. The value should be representative of the advertised product's 
   *   category and can be specified by the advertisers. If the value is not specified, 
   *   then BUTTON_LABEL's value will default to Location.
   * @private 
   */ 
  specifyButtonFeatures_(buttonLabel = DEFAULT_BUTTON_LABEL) {
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.innerText = FIND_NEAREST_TEMPLATE_TEXT + buttonLabel;
    findNearest.onclick = () => this.prepareCreative_();
  }

  prepareCreative_() {
    //ToDo(kristenmason@): implement the Google Maps request access functionality
    findNearest.classList.add("hidden");
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_PAUSE).then(() => {
      this.createMapState_();
    }).catch(() => {
        const pauseErrorMessage = {
          message: "WARNING: Request to pause ad failed",
        };
        this.simidProtocol.sendMessage(CreativeMessage.LOG, pauseErrorMessage);
    });
  }

  /**
   * Creates the Skip To Content and Return To Ad buttons once the user
   *   grants permission to access their location and the map appears.
   * @private 
   */
  createMapState_() {
    const returnToAdButton = document.createElement("button");
    returnToAdButton.textContent = "Return To Ad";
    returnToAdButton.id = "returnToAd";
    returnToAdButton.onclick = () => this.playAd_(returnToAdButton); 

    const skipAdButton = document.createElement("button");
    skipAdButton.textContent = "Skip Ad";
    skipAdButton.id = "skipAd";
    skipAdButton.onclick = () => this.playContent_();

    const adContainer = document.getElementById('adContainer');
    adContainer.appendChild(returnToAdButton);
    adContainer.appendChild(skipAdButton);

    this.displayMap_();
  }

  /**
   * Continues to play the ad if user clicks on Return To Ad button.
   * @param {!Element} returnToAdButton Refers to the button that takes
   *   a user back to the video ad. 
   * @private 
   */
  playAd_(returnToAdButton) {
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_PLAY);
    returnToAdButton.classList.add("hidden");
    const mapDiv = document.getElementById("map");
    mapDiv.classList.add("hidden");
  }

  /**
   * Returns to video content if user clicks on Skip To Content button.
   * @private 
   */
  playContent_() {
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
  }

  /**
   * Loads a map object that currently defaults to a hardcoded location.
   * @param {!google.maps.LatLng=} coordinates The LatLng object of user's current location.
   * @private 
   */
  displayMap_(coordinates = new google.maps.LatLng(DEFAULT_MAP_LAT, DEFAULT_MAP_LNG)) {
    this.currentLocation_ = coordinates;
    this.map_ = new google.maps.Map(document.getElementById('map'), {
      zoom: DEFAULT_ZOOM,
      center: coordinates
    });
    new google.maps.Marker({
      position: coordinates,
      map: this.map_,
      title: 'Current Position'
    });
    this.findNearby_(this.searchQuery_, coordinates);
  }

  /**
   * Searches for the closest corresponding locations based off of the given search parameter,
   * and places pins on the map that represent the 4 closest locations.
   * @param {String} searchParameter A string with the advertiser's name to use in the query.
   * @param {!google.maps.LatLng} coordinates The LatLng object of user's current location.
   * @private 
   */
  findNearby_(searchParameter, coordinates) {
    const request = {
      location: coordinates,
      name: searchParameter,
      openNow: true,
      rankBy: google.maps.places.RankBy.DISTANCE
    };
    const placeService = new google.maps.places.PlacesService(this.map_);
    placeService.nearbySearch(request, this.displayResults_.bind(this));
    this.createTravelChoices_();
  }

  /**
   * Displays the closest advertisement's locations to a user's current location.
   * @param {!Object} results An array of Place Results from the search query.
   * @param {!google.maps.places.PlacesServiceStatus} status The status returned 
   *  by the PlacesService on the completion of its searches.
   * @private 
   */
  displayResults_(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < DEFAULT_LOCATION_NUM_DISPLAYED; i++) {
        this.placeMapMarker_(results[i]);
      }
      this.activeLocation_ = results[0].geometry.location;
      this.displayDirections_(this.currentLocation_, this.activeLocation_);
    } else {
      const statusErrorMessage = {
        message: "ERROR: Places Service Status was: "+status,
      };
      this.simidProtocol.sendMessage(CreativeMessage.LOG, statusErrorMessage);
      this.playContent_();
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
    ///Recalculate directions if new marker is clicked.
    placeMarker.addListener('click', () => {
      this.activeLocation_ = place.geometry.location;
      this.displayDirections_(this.currentLocation_, this.activeLocation_);
    });
  }

  /**
   * Displays the route between the starting loaction and destination
   * based off of the selected travel mode.
   * @param {!google.maps.LatLng} startingLocation The LatLng coordinates of the start location.
   * @param {!google.maps.LatLng} destination The LatLng coordinates of the destination.
   * @private 
   */
  displayDirections_(startingLocation, destination) {
    this.directionsRenderer_.setMap(this.map_);
    this.calculateRoute_(startingLocation, destination);
    this.calculateTravelTime_(startingLocation, destination);
    //If travel method changes, recalculate directions.
    document.getElementById("travel_method").addEventListener("change", () => {
      this.calculateRoute_(startingLocation, destination);
      this.calculateTravelTime_(startingLocation, destination);
    });
  }

  /**
   * Creates a drop down menu where users can choose between
   * different modes of travel to display directions for.
   * @private 
   */
  createTravelChoices_() {
    const mainContainer = document.getElementById("adContainer");
    const travelChoicesContainer = document.createElement('div');
    travelChoicesContainer.id = "travel_display";
    const travelMethod = document.createElement('select');
    travelMethod.id = "travel_method";
    for(let i = 0; i < this.transportMethods_.length; i++) {
      travelMethod.add(this.transportMethods_[i]);
    }
    travelMethod.classList.add("travel_method");
    travelChoicesContainer.append(travelMethod);
    mainContainer.appendChild(travelChoicesContainer);
  }

  /**
   * Creates an option element representing a mode of travel.
   * @param {!string} travelMode A string representing the
   *   given mode of travel.
   * @private 
   */
  createTravelOption_(travelMode) {
    const travelOption = document.createElement("option");
    travelOption.value = travelMode.toUpperCase();
    travelOption.text = travelMode;
    return travelOption;
  }

  /**
   * Displays the route between the starting location and destination
   * based off of the selected travel mode.
   * @param {!google.maps.LatLng} start The LatLng coordinates of the start location.
   * @param {!google.maps.LatLng} end The LatLng coordinates of the end location.
   * @private 
   */
  calculateRoute_(start, end) {
    const dirService = new google.maps.DirectionsService();
    const selectedMode = document.getElementById("travel_method").value;
    dirService.route(
      {
        origin: start,
        destination: end,
        travelMode: [selectedMode]
      },
      (response, status) => {
        if (status == "OK") {
          this.directionsRenderer_.setDirections(response);
        } else {
          const directionsErrorMessage = {
            message: "ERROR: Directions request failed due to " + status,
          };
          this.simidProtocol.sendMessage(CreativeMessage.LOG, directionsErrorMessage);
        }
      }
    );
  }

  displayTravelTimes_(timeString){
    document.getElementById("travel_method");
  }

  calculateTravelTime_(origin, destination) {
    const travelMode = document.getElementById("travel_method").value;
    const matrixService = new google.maps.DistanceMatrixService();
    matrixService.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: [travelMode],
        unitSystem: google.maps.UnitSystem.IMPERIAL
      }, this.getTravelTime_);
    }

    getTravelTime_(response, status) {
      if (status == 'OK') {
        let distance = -1;
        let duration = -1;
        const results = response.rows[0].elements;
        for (let j = 0; j < results.length; j++) {
          const element = results[j];
          distance = element.distance.text;
          duration = element.duration.text;
        }
        console.log(distance + " " + duration);
      }
    }
}

