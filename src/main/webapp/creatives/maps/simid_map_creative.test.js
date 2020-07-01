/** Tests to see if Find Nearest X button is appending correct text */
import '@testing-library/jest-dom';
import SimidMapCreative from './simid_map_creative.js';

let testMap, googleMaps;

beforeEach(() => {
    window.google = {
        maps: {
            LatLng: jest.fn(), 
            Map: jest.fn(),
            Marker: jest.fn(),
            Autocomplete: class {}
        }
      };
    testMap = new SimidMapCreative();
    document.body.innerHTML = `
    <button id="findNearest"></button>
    <div id="map"></div>`;
});

test('testing button text updates from ad params', () => {
    const eventData = {
        args: {
            creativeData: {
                adParameters: '{"buttonLabel": "Place"}',
            },
            environmentData: {},
        },
        messageId: 0,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:init",
    };
    testMap.onInit(eventData);

    const startData = {
        messageId: 1,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:startCreative",  
    }
    testMap.onStart(startData);

    const button = document.getElementById("findNearest");
    expect(button.innerText).toBe('Find Nearest Place');
});

test('testing button text updates with default ad params', () => {
    const eventData = {
        args: {
            creativeData: {
                adParameters: '{}',
            },
            environmentData: {},
        },
        messageId: 0,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:init",
    };
    testMap.onInit(eventData);

    const startData = {
        messageId: 1,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:startCreative",  
    }
    testMap.onStart(startData);

    const button = document.getElementById("findNearest");
    expect(button.innerText).toBe('Find Nearest Location');
});

test('Map constructor in Maps API is accessed on button click', () => {
    const eventData = {
        args: {
            creativeData: {
                adParameters: '{"buttonLabel": "Place"}',
            },
            environmentData: {},
        },
        messageId: 0,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:init",
    };
    testMap.onInit(eventData);

    const startData = {
        messageId: 1,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:startCreative",  
    }
    testMap.onStart(startData);

    const findNearestButton = document.getElementById('findNearest');
    const mapDiv = document.getElementById("map");
    findNearestButton.dispatchEvent(new Event('click'));
    expect(window.google.maps.Map.mock.instances.length).toBe(1);

});