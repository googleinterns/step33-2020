/** Tests to see if Find Nearest X button is appending correct text */
import SimidMapCreative from './simid_map_creative.js';
import SimidProtocol from '../simid_protocol.js';

jest.mock('../simid_protocol.js');
let testMap;
let startData;

/**
 * Creates an object containing the test event data used in the SIMID protocol.
 * @param {string=} adParameters Takes in the given string of AdParameters.
 * If the field is left blank, passes in the default parameters.
 * @return {!Object} an object containing the event data and corresponding AdParameters.
 */
function createInitData(adParameters = ""){
    const eventData = {
        args: {
            creativeData: {
                adParameters: '{'+adParameters+'}',
            },
            environmentData: {},
        },
        messageId: 0,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:init",
    };
    return eventData;
}

beforeEach(() => {
    window.google = {
        maps: {
            LatLng: jest.fn(), 
            Map: jest.fn(),
            Marker: jest.fn(),
            Autocomplete: class {}
        }
      };
    SimidProtocol.mockClear();
    testMap = new SimidMapCreative();
    document.body.innerHTML = `
    <button id="findNearest"></button>
    <div id="map"></div>`;
    startData = {
        messageId: 1,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:startCreative",  
    }
});

test('testing button text updates from ad params', () => {
    const eventData = {
        args: {
            creativeData: {
                adParameters: "{'buttonLabel': 'Place'}",
            },
            environmentData: {},
        },
        messageId: 0,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:init",
    };
    testMap.onInit(eventData);

    const buttonLabel = "Place";
    const startData = {
        messageId: 1,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:startCreative",  
    }
    testMap.onStart(startData, buttonLabel);

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

test('instance of map is instantiated on button click', () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));
    expect(window.google.maps.Map.mock.instances.length).toBe(1);
});

test('marker is added to map when map loads', () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));
    expect(window.google.maps.Marker.mock.instances.length).toBe(1);
});

test('LatLng coordinates constructor is called by default', () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));
    expect(window.google.maps.LatLng.mock.instances.length).toBe(1);
});

test('testing that rejection for ad params not found is working', () => {
    const eventData = {
        args: {
            creativeData: {
                adParameters: "",
            },
            environmentData: {},
        },
        messageId: 0,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:init",
    };
    testMap.onInit(eventData);
    
    const instance = SimidProtocol.mock.instances[0];
    const rejectMessageObject = instance.reject.mock.calls[0][1];
    expect(rejectMessageObject.message).toBe("Ad parameters not found");
});

test('testing that rejection for searchQuery not found is working when given empty string', () => {
    const eventData = {
        args: {
            creativeData: {
                adParameters: '{"searchQuery": ""}',
            },
            environmentData: {},
        },
        messageId: 0,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:init",
    };
    testMap.onInit(eventData);
    
    const instance = SimidProtocol.mock.instances[0];
    expect(instance.reject).toHaveBeenCalledTimes(1);
    const rejectMessageObject = instance.reject.mock.calls[0][1];
    expect(rejectMessageObject.message).toBe("Required field searchQuery not found");
});

test('testing that rejection for searchQuery not found is working when search query not included', () => {
    const eventData = {
        args: {
            creativeData: {
                adParameters: '{"buttonLabel": "Location", "marker": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg.png"}'
            },
            environmentData: {},
        },
        messageId: 0,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:init",
    };
    testMap.onInit(eventData);
    
    const instance = SimidProtocol.mock.instances[0];
    expect(instance.reject).toHaveBeenCalledTimes(1);
    const rejectMessageObject = instance.reject.mock.calls[0][1];
    expect(rejectMessageObject.message).toBe("Required field searchQuery not found");
});

test('testing that rejection for JSON parsing errors is working', () => {
    const eventData = {
        args: {
            creativeData: {
                adParameters: 'test',
            },
            environmentData: {},
        },
        messageId: 0,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:init",
    };
    testMap.onInit(eventData);
    
    const instance = SimidProtocol.mock.instances[0];
    const rejectMessageObject = instance.reject.mock.calls[0][1];
    expect(rejectMessageObject.message).toBe("Invalid JSON input for ad parameters");
});

