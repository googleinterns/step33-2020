/**
 * A sample SIMID ad that shows a map of nearby locations
 */
class SimidMapCreative extends BaseSimidCreative {
  constructor() {
    super();
  }
  /** @override */
  onStart(eventData){
    super.onStart(eventData);
    this.adParams = JSON.parse(this.creativeData.adParameters);
    console.log("Ad params: ", this.adParams);
    var paramObject = this.adParams[0];
    console.log(paramObject);
    var buttonParam = paramObject["buttonParam"];
    console.log(buttonParam);
    this.specifyButtonText(buttonParam);
  }
 
  specifyButtonText(buttonParam) {
    var findNearestButton = document.getElementById('findNearest');
    findNearestButton.innerText = "Find Nearest " + buttonParam;
    findNearest.onclick = () => displayMap();
  }
 
  displayMap() {
  //To Do -- Kristen implement this 
  }
}
