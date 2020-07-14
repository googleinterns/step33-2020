/** Contains all constants common across SIMID */

/**
 * Messages from the media element.
 * @enum {string}
 */
export const MediaMessage = {
  DURATION_CHANGE: 'Media:durationchange',
  ENDED: 'Media:ended',
  ERROR: 'Media:error',
  PAUSE: 'Media:pause',
  PLAY: 'Media:play',
  PLAYING: 'Media:playing',
  SEEKED: 'Media:seeked',
  SEEKING: 'Media:seeking',
  TIME_UPDATE: 'Media:timeupdate',
  VOLUME_CHANGE: 'Media:volumechange',
};

/**
 * Messages from the player.
 * @enum {string}
 */
export const PlayerMessage = {
  RESIZE: 'Player:resize',
  INIT: 'Player:init',
  START_CREATIVE: 'Player:startCreative',
  AD_SKIPPED: 'Player:adSkipped',
  AD_STOPPED: 'Player:adStopped',
  FATAL_ERROR: 'Player:fatalError',
};

/**
 * Messages from the creative.
 * @enum {string}
 */
export const CreativeMessage = {
  CLICK_THRU: 'Creative:clickThru',
  FATAL_ERROR: 'Creative:fatalError',
  GET_MEDIA_STATE: 'Creative:getMediaState',
  REQUEST_FULL_SCREEN: 'Creative:requestFullScreen',
  LOG: 'Creative:log',
  REQUEST_SKIP: 'Creative:requestSkip',
  REQUEST_STOP: 'Creative:requestStop',
  REQUEST_PAUSE: 'Creative:requestPause',
  REQUEST_PLAY: 'Creative:requestPlay',
  REQUEST_RESIZE: 'Creative:requestResize',
  REQUEST_VOLUME: 'Creative:requestVolume',
  REQUEST_TRACKING: 'Creative:reportTracking',
  REQUEST_CHANGE_AD_DURATION: 'Creative:requestChangeAdDuration',
};


/**
 * A list of reasons a player could stop the ad.
 * @enum {number}
 */
export const StopCode = {
  UNSPECIFIED: 0,
  USER_INITIATED: 1,
  MEDIA_PLAYBACK_COMPLETE: 2,
  PLAYER_INITATED: 3,
  CREATIVE_INITIATED: 4,
};

/**
 * A list of errors the player might send to the creative.
 * @enum {number}
 */
export const PlayerErrorCode = {
  UNSPECIFIED: 1200,
  WRONG_VERSION: 1201,
  UNSUPPORTED_TIME: 1202,
  UNSUPPORTED_FUNCTIONALITY_REQUEST: 1203,
  UNSUPPORTED_ACTIONS: 1204,
  POSTMESSAGE_CHANNEL_OVERLOADED: 1205,
  VIDEO_COULD_NOT_LOAD: 1206,
  VIDEO_TIME_OUT: 1207,
  RESPONSE_TIMEOUT: 1208,
  MEDIA_NOT_SUPPORTED: 1209,
  SPEC_NOT_FOLLOWED_ON_INIT: 1210,
  SPEC_NOT_FOLLOWED_ON_MESSAGES: 1211,
};

/**
 * A list of errors the creative might send to the player.
 * @enum {number}
 */
export const CreativeErrorCode = {
  UNSPECIFIED: 1100,
  CANNOT_LOAD_RESOURCE: 1101,
  PLAYBACK_AREA_UNUSABLE: 1102,
  INCORRECT_VERSION: 1103,
  TECHNICAL_ERROR: 1104,
  EXPAND_NOT_POSSIBLE: 1105,
  PAUSE_NOT_HONORED: 1106,
  PLAYMODE_NOT_ADEQUATE: 1107,
  CREATIVE_INTERNAL_ERROR: 1108,
  DEVICE_NOT_SUPPORTED: 1109,
  MESSAGES_NOT_FOLLOWING_SPEC: 1110,
  PLAYER_RESPONSE_TIMEOUT: 1111,
};

/** A list of server routes that keep track of each interaction when fetched. */
export const Urls = {
  INITIALIZE: "initialize",
  FIND_NEAREST_LOCATION: "find-location",
  GRANT_LOCATION_DATA: "grant-location",
  MAP_INTERACT: "map-interact",
  SKIP_TO_CONTENT: "skip-to-content",
  RETURN_TO_AD: "return-to-ad",
}
