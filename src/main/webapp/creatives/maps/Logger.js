
import {generateSessionId} from './utils.js';

/** A list of server routes that keep track of each interaction when fetched. */
const URL = {
  INITIALIZE: "initialize",
  FIND_NEAREST_LOCATION: "find-location",
  GRANT_LOCATION_DATA: "grant-location",
  MAP_INTERACT: "map-interact",
  SKIP_TO_CONTENT: "skip-to-content",
  RETURN_TO_AD: "return-to-ad"
}

class Logger {
  /**
   * Each instance gets a correlator to uniquely identify it.
   */
  constructor() {
    this.correlator = generateSessionId();
  }

  /**
   * Makes a GET request to the given URL with the correlator as a parameter.
   * @param {string} url A URL to send the request to.
   */
  sendRequest_(url) {
    fetch(`/${url}?correlator="${this.correlator}"`);
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