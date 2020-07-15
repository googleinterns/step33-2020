import BaseSimidCreative from '../base_simid_creative.js';
import UserActivityLogger from './UserActivityLogger.js';
import {CreativeErrorCode, CreativeMessage} from '../constants.js';

const AdParamKeys = {
  BUTTON_LABEL: 'buttonLabel',
  SEARCH_QUERY: 'searchQuery',
  MARKER: 'marker',
  COORDINATES: 'userCoordinates',
  BASE_URL: 'baseUrl',
};

const FIND_NEAREST_TEMPLATE_TEXT = "Find Nearest ";
const DEFAULT_BUTTON_LABEL = "Location";
const DEFAULT_ZOOM = 13;
const DEFAULT_LOCATION_NUM_DISPLAYED = 4;
const MARKER_SIZE = 25;
const DEFAULT_MAP_LAT = 37.422004;
const DEFAULT_MAP_LNG = -122.081402;
const TRANSPORT_METHODS = ["Driving","Walking","Bicycling","Transit"];

/**
 * A sample SIMID ad that shows a map of nearby locations.
 */
export default class SimidMapCreative extends BaseSimidCreative {
  constructor() {
    super();

    /**
     * An instance of a user session
     * @private @const {!UserActivityLogger}
     */
    this.newUserSession_ = new UserActivityLogger();
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
     * The LatLng object representing the user's current position.
     * @private {?google.maps.LatLng}
     */
    this.userCoordinates_ = null;
  }
  
  /** @override */
  onInit(eventData) {
    this.updateInternalOnInit(eventData);
    this.validateAndParseAdParams_(eventData);
    this.newUserSession_.userInitializes();
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
    this.buttonLabel_ = adParams[AdParamKeys.BUTTON_LABEL]; 
    this.searchQuery_ = adParams[AdParamKeys.SEARCH_QUERY];
    this.markerImage_ = adParams[AdParamKeys.MARKER];
    this.userCoordinates_ = adParams[AdParamKeys.COORDINATES];
    const baseUrl = adParams[AdParamKeys.BASE_URL];

    if (baseUrl){
      this.newUserSession_.updateBaseUrl(baseUrl);
    }

    if (!this.searchQuery_) {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.UNSPECIFIED, 
        message: `Required field ${AdParamKeys.SEARCH_QUERY} not found`});
        return;
    }
    this.simidProtocol.resolve(eventData, {});
  }

  /** @override */
  onStart(eventData) {
    super.onStart(eventData);
    this.specifyButtonFeatures_(this.buttonLabel_);
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
    findNearestButton.focus();
    findNearestButton.onclick = () => this.prepareCreative_();
  }

  prepareCreative_() {
    this.newUserSession_.userClicksFindNearestLocation();
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
    returnToAdButton.focus();
    returnToAdButton.onclick = () => this.playAd_(returnToAdButton); 

    const skipAdButton = document.createElement("button");
    skipAdButton.id = "skipAd";
    skipAdButton.textContent = "Skip Ad";
    skipAdButton.onclick = () => this.playContent_();

    const adContainer = document.getElementById('adContainer');
    adContainer.appendChild(returnToAdButton);
    adContainer.appendChild(skipAdButton);

    this.displayMap_(this.userCoordinates_);
  }

  /**
   * Continues to play the ad if user clicks on Return To Ad button.
   * @param {!Element} returnToAdButton Refers to the button that takes
   *   a user back to the video ad. 
   * @private 
   */
  playAd_(returnToAdButton) {
    this.newUserSession_.userClicksReturnToAd();
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
    this.newUserSession_.userClicksSkipToContent();
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
    this.addMapListener_(this.map_);
  }

  /**
   * Searches for the closest corresponding locations based off of the given search parameter,
   * and places pins on the map that represent the closest locations.
   * @param {String} searchParameter A string with the location's name to use in the query.
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
    const service = new google.maps.places.PlacesService(this.map_);
    service.nearbySearch(request, this.displayResults_.bind(this));
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
      this.activeLocation_ = results[0].geometry.location;
      for (let i = 0; i < DEFAULT_LOCATION_NUM_DISPLAYED; i++) {
        this.placeMapMarker_(results[i]);
      }
      this.displayDirections_();
    } else {
      const statusErrorMessage = {
        message: "ERROR: Failed to complete search: "+status,
      };
      this.simidProtocol.sendMessage(CreativeMessage.LOG, statusErrorMessage);
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
   * Displays the directions between the user's current location and current active location.
   * @private 
   */
  displayDirections_() {
    this.directionsRenderer_.setMap(this.map_);
    this.calculateRoute_();
  }

  /**
   * Creates a drop down menu where users can choose between
   * different modes of travel to display directions for.
   * @private 
   */
  createTravelChoices_() {
    const travelChoicesContainer = document.getElementById("button_container")
    const travelMethod = document.createElement('select');
    travelMethod.id = "travel_method";
    TRANSPORT_METHODS.forEach((transportType) =>{
      const newOption = this.createTravelOption_(transportType);
      travelMethod.add(newOption);
    });
    travelMethod.classList.add("travel_method");
    travelMethod.addEventListener("change", () => {
      this.calculateRoute_();
    });
    travelChoicesContainer.append(travelMethod);
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
   * Calculates the route between the user's current location and current
   * active location based off of the selected travel mode.
   * @private 
   */
  calculateRoute_() {
    const directionsService = new google.maps.DirectionsService();
    const selectedMode = document.getElementById("travel_method").value;
    directionsService.route(
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
          this.simidProtocol.sendMessage(CreativeMessage.LOG, directionsErrorMessage);
        }
      }
    );
  }

  /**
   * Adds map listeners to the map displayed.
   * @param {!Object} map A Google Maps object.
   * @private 
   */
  addMapListener_(map) {
    const eventsArray = ['zoom_changed', 'click', 'drag'];
    eventsArray.forEach(event => map.addListener(event, () => {
      this.newUserSession_.userInteractsWithMap();
    })); 
  }
}

