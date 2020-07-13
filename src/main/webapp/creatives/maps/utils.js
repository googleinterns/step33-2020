
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