
import BaseSimidCreative from '../base_simid_creative.js';

/**
 * A sample SIMID ad that shows a map of nearby locations
 */
class SimidMapCreative extends BaseSimidCreative {
  constructor() {
    super();
  }
}

const map = new SimidMapCreative();
map.ready();
