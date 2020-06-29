
import BaseSimidCreative from '../base_simid_creative.js';

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
  onStart(eventData){
    super.onStart(eventData);
    try {
      const adParams = JSON.parse(this.creativeData.adParameters);
    } catch (e) {
      this.sendErrorMessage_(CreativeErrorCode.MESSAGES_NOT_FOLLOWING_SPEC);
    }
    const buttonLabel = adParams[AdParamKeys.BUTTON_LABEL]; 
    //ToDo(juliareichel@): handle case where searchQuery is undefined
    const searchQuery = adParams[AdParamKeys.SEARCH_QUERY];
    const marker = adParams[AdParamKeys.MARKER];

    if (searchQuery == undefined) {
      this.sendErrorMessage_(CreativeErrorCode.UNSPECIFIED);
    }

    this.specifyButtonFeatures_(buttonLabel);
  }

  sendErrorMessage_(message) {
    this.simidProtocol.sendMessage(message);
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
