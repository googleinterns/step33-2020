
/** A list of server routes that keep track of each interaction when fetched. */
export const URL = {
  BASE_URL: "https://step-capstone-team33-2020.appspot.com",
  INITIALIZE: "initialize",
  FIND_NEAREST_LOCATION: "find-location",
  GRANT_LOCATION_DATA: "grant-location",
  MAP_INTERACT: "map-interact",
  SKIP_TO_CONTENT: "skip-to-content",
  RETURN_TO_AD: "return-to-ad",
}

/**
 * @return {string} A standard UUID conforming to en.wikipedia.org/wiki/Universally_unique_identifier
 */
export function generateSessionId() {
  let date = new Date().getTime();
  const generateRandomHex = (char) => {
    const randomNum = (date + Math.random()*16)%16 | 0;
    date = Math.floor(date/16);
    return (char=='r' ? randomNum :(randomNum&0x3|0x8)).toString(16);
  };

  const uuidFormat = 'rrrrrrrr-rrrr-4rrr-yrrr-rrrrrrrrrrrr';
  const uuid = uuidFormat.replace(/[ry]/g, generateRandomHex);

  return uuid;
}