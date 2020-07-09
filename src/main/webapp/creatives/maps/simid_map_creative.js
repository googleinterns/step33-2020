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

/**
 * A sample SIMID ad that shows a map of nearby locations.
 */
export default class SimidMapCreative extends BaseSimidCreative {

  constructor() {
    super();
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
    const searchQuery = adParams[AdParamKeys.SEARCH_QUERY];

    if (!searchQuery) {
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
 
  /**
   * Requests player to pause, if accepted generate map.
   * @private 
  */
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
    skipAdButton.id = "skipToContent";
    skipAdButton.onclick = () => this.playContent_();

    const adContainer = document.getElementById('adContainer');
    adContainer.appendChild(returnToAdButton);
    adContainer.appendChild(skipAdButton);

    this.loadMap_();
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
    //ToDo(kristenmason@): hide map
  }

  /**
   * Returns to video content if user clicks on Skip To Content button.
   * @private 
  */
  playContent_() {
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
  }

  /**
   * Loads a map object that currently displays a hardcoded location.
   * @param {!google.maps.LatLng=} coordinates The LatLng object of user's current location.
   * TODO(kristenmason@): implement grant location access and modify
   * function to pass in current position (currently coords default to GooglePlex)
   * @private 
  */
  loadMap_(coordinates = new google.maps.LatLng(37.422004,-122.081402)) { 
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: DEFAULT_ZOOM,
      center: coordinates
    });
    const marker = new google.maps.Marker({
      position: coordinates,
      map: map,
      title: 'Current Position'
    });
  }
}
