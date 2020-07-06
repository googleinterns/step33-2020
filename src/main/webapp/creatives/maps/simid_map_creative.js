
import BaseSimidCreative from '../base_simid_creative.js';
import { CreativeMessage } from '../constants.js';

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
    //ToDo(juliareichel@): handle invalid JSON and param errors
    const adParams = JSON.parse(this.creativeData.adParameters);
    const buttonLabel = adParams[AdParamKeys.BUTTON_LABEL]; 
    //ToDo(juliareichel@): handle case where searchQuery is undefined
    const searchQuery = adParams[AdParamKeys.SEARCH_QUERY];
    const marker = adParams[AdParamKeys.MARKER];
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
    //ToDo(kristenmason@): implement the Google Maps request access functionality
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_PAUSE).then(() => {
      findNearest.classList.add("hidden");
      //ToDo(kristenmason@): display map
      this.createButtons_();
    })
  }

  /**
   * Creates the Skip To Content and Return To Ad buttons once the user
   *   grants permission to access their location and the map appears.
   * @private 
  */
  createButtons_() {
    const returnToAdButton = document.createElement("button");
    returnToAdButton.innerHTML = "Return To Ad";
    returnToAdButton.id = "returnToAd";
    returnToAdButton.onclick = () => this.playAd_(returnToAdButton); 

    const skipToContentButton = document.createElement("button");
    skipToContentButton.innerHTML = "Skip To Content";
    skipToContentButton.id = "skipToContent";
    skipToContentButton.onclick = () => this.playContent_();

    const container = document.getElementById('container');
    container.appendChild(returnToAdButton);
    container.appendChild(skipToContentButton);
  }

  /**
   * Continues to play the ad if user clicks on Return To Ad button.
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
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_STOP);
  }
}
