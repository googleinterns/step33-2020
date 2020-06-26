/** Examples tests showing how Jest works */

import BaseSimidCreative from './base_simid_creative.js';
import SimidProtocol from './simid_protocol.js';

jest.mock('../simid_protocol.js');

let baseCreative;

beforeEach(() => {
  SimidProtocol.mockClear();
  baseCreative = new BaseSimidCreative();
});

test('testOnInitSetsVideoState', () => {
  baseCreative.onInit({
    args: {
      creativeData: 'creativeData',
      environmentData: {
        muted: false,
        volume: 10,
      }
    }
  });
  expect(baseCreative.videoState.currentSrc).toBe('');
  expect(baseCreative.videoState.currentTime).toBe(-1);
  expect(baseCreative.videoState.duration).toBe(-1);
  expect(baseCreative.videoState.ended).toBe(false);
  expect(baseCreative.videoState.muted).toBe(false);
  expect(baseCreative.videoState.paused).toBe(false);
  expect(baseCreative.videoState.volume).toBe(10);
  expect(baseCreative.videoState.fullscreen).toBe(false);
});

test('testOnDurationChangeUpdatesDuration', () => {
  baseCreative.onDurationChange({
    args: {
      duration: 10,
    }
  });
  expect(baseCreative.videoState.duration).toBe(10);
});

test('testReadyCallsCreateSession', () => {
  baseCreative.ready();
  expect(SimidProtocol).toHaveBeenCalledTimes(1);
  const instance = SimidProtocol.mock.instances[0];
  expect(instance.createSession).toHaveBeenCalledTimes(1);
});
