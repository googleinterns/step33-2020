
const URL = {
  INITIALIZE: "initialize",
  FIND_NEAREST_LOCATION: "find-location",
  GRANT_LOCATION_DATA: "grant-location",
  MAP_INTERACT: "map-interact",
  SKIP_TO_CONTENT: "skip-to-content",
  RETURN_TO_AD: "return-to-ad"
}

class User {
  constructor() {
    this.correlator = Math.floor(Math.random() * new Date().getTime());
  }

  sendRequest_(url) {
    fetch(`/${url}?correlator="${this.correlator}"`).then(() => console.log("success"));
  }

  initialize() {
    this.sendRequest_(URL.INITIALIZE);
  }

  clicksFindNearestLocation() {
    this.sendRequest_(URL.FIND_NEAREST_LOCATION);
  }

  grantLocationData() {
    this.sendRequest_(URL.GRANT_LOCATION_DATA);
  }

  interactWithMap() {
    this.sendRequest_(URL.MAP_INTERACT);
  }

  clickSkipToContent() {
    this.sendRequest_(URL.SKIP_TO_CONTENT);
  }

  clickReturnToAd() {
    this.sendRequest_(URL.RETURN_TO_AD);
  }
}