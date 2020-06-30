
import BaseSimidCreative from '../base_simid_creative.js';
import {CreativeErrorCode} from '../constants.js';

const AdParamKeys = {
  BUTTON_LABEL: 'buttonLabel',
  SEARCH_QUERY: 'searchQuery',
  MARKER: 'marker',
};

const FIND_NEAREST_TEMPLATE_TEXT = "Find Nearest ";
const DEFAULT_BUTTON_LABEL = "Location";

/**
 * A sample SIMID ad that shows a map of nearby locations.
 */
export default class SimidMapCreative extends BaseSimidCreative {

  constructor() {
    super();
  }

  /** @override */
  onInit(eventData) {
    this.creativeData = eventData.args.creativeData;
    this.environmentData = eventData.args.environmentData;


    this.videoState = {
      currentSrc:'',
      currentTime: -1, // Time not yet known
      duration: -1, // duration unknown
      ended: false,
      muted: this.environmentData.muted,
      paused: false,
      volume: this.environmentData.volume,
      fullscreen: false,
    }

    /**
     * Error handeling for empty or incorrect ad paramters.
     */
    let adParams = "";
    if (this.creativeData.adParameters == "") {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.UNSPECIFIED, 
        message: "Ad parameters not found"});
    }

    try {
      adParams = JSON.parse(this.creativeData.adParameters);
    } catch (exception) {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.MESSAGES_NOT_FOLLOWING_SPEC, 
        message: "Invalid JSON input"});
    }
    const buttonLabel = adParams[AdParamKeys.BUTTON_LABEL]; 
    const searchQuery = adParams[AdParamKeys.SEARCH_QUERY];

    if (searchQuery == undefined) {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.UNSPECIFIED, 
        message: "Required field 'SearchQuery' not found"});
    }

    const marker = adParams[AdParamKeys.MARKER];
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
    findNearest.onclick = () => this.grantLocationAccess_();
  }
 
  /**
   * Prompts the users to grant or deny access to their current location.
   * @private 
  */
  grantLocationAccess_() {
    //ToDo(kristenmason@): implement map
  }
}
