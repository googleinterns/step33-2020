
import BaseSimidCreative from './base_simid_creative.js';

test('testOnInitSetsVideoState', () => {
  const baseCreative = new BaseSimidCreative();
  baseCreative.onInit({
    args: {
      creativeData: 'creativeData',
      environmentData: {
        muted: false,
        volume: 10,
      }
    }
  });
  expect(baseCreative.videoState.volume).toBe(10);
});
