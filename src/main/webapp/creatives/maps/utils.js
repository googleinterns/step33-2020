

/**
 * Sets the session ID, this should only be used on session creation.
 */
export function generateSessionId_() {
  let dt = new Date().getTime();
  const generateRandomHex = (c) => {
    const r = (dt + Math.random()*16)%16 | 0;
    dt = Math.floor(dt/16);
    return (c=='r' ? r :(r&0x3|0x8)).toString(16);
  };
  const uuidFormat = 'rrrrrrrr-rrrr-4rrr-yrrr-rrrrrrrrrrrr';
  const uuid = uuidFormat.replace(/[ry]/g, generateRandomHex);

  return uuid;
}