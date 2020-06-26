/**
 * A sample SIMID ad that shows a map of nearby locations
 */
const AdParamKeys = {
  BUTTON_LABEL: 'buttonLabel',
  SEARCH_QUERY: 'searchQuery',
  MARKER: 'marker',
};

const FIND_NEAREST = "Find Nearest ";
const DEFAULT_BUTTON_LABEL = "Location";

class SimidMapCreative extends BaseSimidCreative {
  constructor() {
    super();
  }

  /** @override */
  onStart(eventData){
    super.onStart(eventData);
    const adParams = JSON.parse(this.creativeData.adParameters);
    let buttonLabel = adParams[AdParamKeys.BUTTON_LABEL]; 
    //ToDo(juliareichel@): handle invalid JSON and param errors
    const searchQuery = adParams[AdParamKeys.SEARCH_QUERY];
    //ToDo(juliareichel@): handle case where searchQuery is undefined
    const marker = adParams[AdParamKeys.MARKER];
    this.specifyButtonFeatures_(buttonLabel);
  }
 
  /** @private 
   * Sets the text of the initial button and assigns it a click functionality.
   * @param {string=} buttonLabel refers to the default value "location" written on the
   * Find Nearest button. Advertisers have the option of changing the text on button.
  */   
  specifyButtonFeatures_(buttonLabel = DEFAULT_BUTTON_LABEL) {
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.innerText = FIND_NEAREST + buttonLabel;
    findNearest.onclick = () => this.grantLocationAccess_();
  }
 
  /** @private 
   * Prompts the users to grant or deny access to their current location.
  */
  grantLocationAccess_() {
    //ToDo(kristenmason@): implement map
  }
}
