import BaseSimidCreative from '../base_simid_creative.js';
import UserActivityLogger from './UserActivityLogger.js';
import GoogleMapsClient from './google_maps_client.js';
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
const TRANSPORT_METHODS = ["Driving", "Walking", "Bicycling", "Transit"];

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
     * A Simid Map object where all of the Maps API calls are handled
     * @private {!SimidMap}
     */ 
    this.googleMapsClient_ = null;
    this.markerUrl_ = null;
    this.query_ = null;
    this.coordinates_ = null;
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
    this.query_ = adParams[AdParamKeys.SEARCH_QUERY];
    this.markerUrl_ = adParams[AdParamKeys.MARKER];
    this.coordinates_ = adParams[AdParamKeys.COORDINATES];
    const baseUrl = adParams[AdParamKeys.BASE_URL];

    if (baseUrl) {
      this.newUserSession_.updateBaseUrl(baseUrl);
    }
    
    if (this.userCoordinates_) {
      this.newUserSession_.userGrantsLocationData();
    }

    if (!this.query_) {
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
      const onMapsClientComplete = () => {this.playAd()};
      this.googleMapsClient_ = new GoogleMapsClient(this.newUserSession_, this.query_,
         this.markerUrl_, this.coordinates_, this.simidProtocol, onMapsClientComplete);
      this.createMapState_();
      this.googleMapsClient_.displayMap(document.getElementById('map'));
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
    this.createTravelDisplay_();
    this.googleMapsClient_.setTravelMethodElement(document.getElementById("travel_method"));
    this.googleMapsClient_.setTimeDisplayElement(document.getElementById("time_display"));
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
     * Creates a drop down menu where users can choose between
     * different modes of travel to display directions for, and
     * creates area for travel time to be displayed.
     * @private 
     */
    createTravelDisplay_() {
      const travelChoicesContainer = document.getElementById("button_container");
      const travelMethod = document.createElement('select');
      travelMethod.id = "travel_method";
      const timeDisplay = document.createElement("div");
      timeDisplay.id = "time_display";
      TRANSPORT_METHODS.forEach((transportType) => {
          const newOption = this.createTravelOption_(transportType);
          travelMethod.add(newOption);
      });
      travelChoicesContainer.append(travelMethod);
      travelChoicesContainer.append(timeDisplay);
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
}

