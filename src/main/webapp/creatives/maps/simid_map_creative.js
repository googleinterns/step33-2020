
import BaseSimidCreative from '../base_simid_creative.js';
import {CreativeErrorCode} from '../constants.js';

const AdParamKeys = {
  BUTTON_LABEL: 'buttonLabel',
  SEARCH_QUERY: 'searchQuery',
  MARKER: 'marker',
};

const FIND_NEAREST_TEMPLATE_TEXT = "Find Nearest ";
const DEFAULT_BUTTON_LABEL = "Location";
const DEFAULT_ZOOM = 13;



/**
 * A sample SIMID ad that shows a map of nearby locations.
 */
export default class SimidMapCreative extends BaseSimidCreative {
  constructor() {
    super();
  }

  /** @override */
  onInit(eventData) {
    this.updateInternalOnInit(eventData);
    this.validateAndParseAdParams_(eventData);
  }

  /**
   * Checks validity of ad parameters and rejects with proper message if invalid.
   * @param eventData an object that contains information details for a particular event
   *   such as event type, unique Ids, creativeData and environmentData.
   * @private 
  */ 
  validateAndParseAdParams_(eventData) {
    if (this.creativeData.adParameters == "") {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.UNSPECIFIED, 
        message: "Ad parameters not found"});
        return;
    }

    let adParams = "";
    try {
      adParams = JSON.parse(this.creativeData.adParameters);
    } catch (exception) {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.CREATIVE_INTERNAL_ERROR, 
        message: "Invalid JSON input for ad parameters"});
        return;
    }
    const buttonLabel = adParams[AdParamKeys.BUTTON_LABEL]; 
    searchQuery = adParams[AdParamKeys.SEARCH_QUERY];
    marker = adParams[AdParamKeys.MARKER];

    if (!searchQuery) {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.UNSPECIFIED, 
        message: `Required field ${AdParamKeys.SEARCH_QUERY} not found`});
        return;
    }
    
    this.simidProtocol.resolve(eventData, {});
  }

  /** @override */
  onStart(eventData, buttonLabel) {
    super.onStart(eventData);
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
  this.loadMap_();
}

/**
 * Loads a map object that currently defaults to a hardcoded location.
 * @param {!google.maps.LatLng=} coordinates The LatLng object of user's current location.
 * @private 
*/
loadMap_(coordinates = new google.maps.LatLng(37.422004, -122.081402)) {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: DEFAULT_ZOOM,
    center: coordinates
  });
  const marker = new google.maps.Marker({
    position: coordinates,
    map: map,
    title: 'Current Position'
  });
  this.findNearby_(searchQuery, coordinates);
}

/**
 * Searches for the closest corresponding businesses based off of the given search parameter,
 * and places pins on the map that represent the 4 closest locations.
 * @param {!google.maps.LatLng=} coordinates The LatLng object of user's current location.
 * Currently defaults to GooglePlex coords, will take in user's current location.
 * @param {String} searchParameter A string with the business's name to use in the query.
 * @private 
*/
findNearby_(searchParameter, coordinates) {
  const request = {
    location: coordinates,
    name: searchParameter,
    openNow: true,
    rankBy: google.maps.places.RankBy.DISTANCE
  };
  const service = new google.maps.places.PlacesService(map);
  //TODO(kristenmason@) Add helper functions to shorten findNearby_
  service.nearbySearch(request, function(results, status){
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < 4; i++) {
        const place = results[i];
        const placeIcon = {
          url: marker,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };
        const placeMarker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          icon: placeIcon
        });
        google.maps.event.addListener(placeMarker, 'click', function () {
          const infowindow = new google.maps.InfoWindow;
          infowindow.setContent(place.name);
          infowindow.open(map, this);
        });
      }
    }
  });
}
}