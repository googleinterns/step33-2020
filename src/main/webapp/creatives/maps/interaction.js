
import {generateSessionId} from '../maps/utils.js';

const URL = {
  INITIALIZE: "initialize",
  FIND_NEAREST_LOCATION: "find-location",
  GRANT_LOCATION_DATA: "grant-location",
  MAP_INTERACT: "map-interact",
  SKIP_TO_CONTENT: "skip-to-content",
  RETURN_TO_AD: "return-to-ad"
}

class Logger {
  constructor() {
    this.correlator = generateSessionId();
  }

  sendRequest_(url) {
    fetch(`/${url}?correlator="${this.correlator}"`).then(() => console.log("success"));
  }

  userInitializes() {
    this.sendRequest_(URL.INITIALIZE);
  }

  userClicksFindNearestLocation() {
    this.sendRequest_(URL.FIND_NEAREST_LOCATION);
  }

  userGrantsLocationData() {
    this.sendRequest_(URL.GRANT_LOCATION_DATA);
  }

  userInteractsWithMap() {
    this.sendRequest_(URL.MAP_INTERACT);
  }

  userClicksSkipToContent() {
    this.sendRequest_(URL.SKIP_TO_CONTENT);
  }

  userClicksReturnToAd() {
    this.sendRequest_(URL.RETURN_TO_AD);
  }
}