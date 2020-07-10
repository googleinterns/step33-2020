
import {generateSessionId, URL} from './utils.js';

export class UserActivityLogger {

  constructor() {
    /**
     * Each instance gets a correlator to uniquely identify it.
     * @private @const {string}
     */
    this.correlator_ = generateSessionId();
  }

  /**
   * Makes a GET request to the given URL with the correlator as a parameter.
   * @param {string} url A URL to send the request to.
   */
  sendRequest_(url) {
    fetch(`${URL.BASE_URL}/${url}?correlator=${this.correlator_}`);
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