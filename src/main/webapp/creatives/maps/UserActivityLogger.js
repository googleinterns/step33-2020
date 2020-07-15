
import {generateSessionId} from './utils.js';
import {Urls} from '../constants.js';

export default class UserActivityLogger {

  constructor() {
    /**
     * Each instance gets a correlator to uniquely identify it.
     * @private @const {string}
     */
    this.correlator_ = generateSessionId();

    /** @private @const {string} */
    this.baseUrl_ = Urls.DEFAULT_BASE_URL;
  }

  /**
   * Updates the base URL when advertisers want to send the interactions to
   * their own server.
   * @param {string} newBaseUrl A base URL to send the request to.
   */
  updateBaseUrl(newBaseUrl) {
    this.baseUrl_ = newBaseUrl;
  }

  /**
   * Makes a GET request to the given URL with the correlator as a parameter.
   * @param {string} route A route to send the request to.
   */
  sendRequest_(route) {
    fetch(`${this.baseUrl_}/${route}?correlator=${this.correlator_}`);
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