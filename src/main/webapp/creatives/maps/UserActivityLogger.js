
import {generateSessionId} from './utils.js';
import {Urls} from '../constants.js';

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
   * @param {string} path A URL to send the request to.
   */
  sendRequest_(path) {
    fetch(`${Urls.BASE_URL}/${path}?correlator=${this.correlator_}`);
  }

  userInitializes() {
    this.sendRequest_(Urls.INITIALIZE);
  }

  userClicksFindNearestLocation() {
    this.sendRequest_(Urls.FIND_NEAREST_LOCATION);
  }

  userGrantsLocationData() {
    this.sendRequest_(Urls.GRANT_LOCATION_DATA);
  }

  userInteractsWithMap() {
    this.sendRequest_(Urls.MAP_INTERACT);
  }

  userClicksSkipToContent() {
    this.sendRequest_(Urls.SKIP_TO_CONTENT);
  }

  userClicksReturnToAd() {
    this.sendRequest_(Urls.RETURN_TO_AD);
  }
}