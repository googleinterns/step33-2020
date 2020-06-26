/**
 * A sample SIMID ad that shows a map of nearby locations
 */
const AdParamKeys = {
  BUTTON_LABEL: 'buttonLabel',
  SEARCH_QUERY: 'searchQuery',
  MARKER: 'marker',
}
const DEFAULT_BUTTON_LABEL = "Location";

class SimidMapCreative extends BaseSimidCreative {
  constructor() {
    super();
  }

  /** @override */
  onStart(eventData){
    super.onStart(eventData);
    const adParams = this.creativeData.adParameters;
    var buttonLabel = JSON.parse(adParams)[AdParamKeys.BUTTON_LABEL]; 
    if (buttonLabel == undefined) {
      buttonLabel = DEFAULT_BUTTON_LABEL;
    }
    else {
      buttonLabel = JSON.parse(adParams)[AdParamKeys.BUTTON_LABEL];
    }
    var searchQuery = JSON.parse(adParams)[AdParamKeys.SEARCH_QUERY];
    //ToDo(juliareichel@): handle case where searchQuery is undefined
    var marker = JSON.parse(adParams)[AdParamKeys.MARKER];;
    this.specifyButtonFeatures_(buttonLabel);
  }
 
  /** @private */
  specifyButtonFeatures_(buttonLabel) {
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.innerText = "Find Nearest " + buttonLabel;
    findNearest.onclick = () => this.displayMap_();
  }
 
  /** @private */
  displayMap_() {
  //ToDo(kristenmason@): implement map
  }
}
