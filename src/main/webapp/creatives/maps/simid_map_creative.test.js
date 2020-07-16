/** Tests to see if Find Nearest X button is appending correct text */
import SimidMapCreative from './simid_map_creative.js';
import SimidProtocol from '../simid_protocol.js';

const mockSendMessage = jest.fn();
mockSendMessage.mockResolvedValue(true);
const mockReject = jest.fn();
jest.mock('../simid_protocol.js', () => {
    return jest.fn().mockImplementation(() => {
        return {sendMessage: mockSendMessage,
            addListener: () => {},
            reject: mockReject,
            resolve: () => {},
        };
    });
});
jest.mock('./UserActivityLogger.js');
let testMap;
let startData;

/**
 * Makes Jest wait for all asynchronous pending promises to finish executing 
 *  before asserting expectations.
 * @return {!Promise} Promise that is used to break up long running operations 
 *  and run a callback function immediately after the browser has completed other 
 *  operations. 
 */
function drivePromisesToCompletion() {
    const flushPromises = () => new Promise(setImmediate);
}

/**
 * Creates an object containing the test event data used in the SIMID protocol.
 * @param {string=} adParameters Takes in the given string of AdParameters.
 * If the field is left blank, passes in the default parameters.
 * @return {!Object} an object containing the event data and corresponding AdParameters.
 */
function createInitData(adParameters){
    const eventData = {
        args: {
            creativeData: {
                adParameters: adParameters,
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
    const fakeNearbySearch = jest.fn();
    window.google = {
        maps: {
            LatLng: jest.fn(), 
            Map: jest.fn(),
            Marker: jest.fn(),
            Size: jest.fn(),
            Point: jest.fn(),
            InfoWindow: jest.fn(),
            DirectionsRenderer: jest.fn(() => ({setMap: jest.fn()}, {setDirections: jest.fn()})),
            DirectionsService: jest.fn(),
            Autocomplete: class {},
            places: {
                PlacesService: jest.fn(() => ({nearbySearch: fakeNearbySearch})),
                RankBy: jest.fn(),
                PlacesServiceStatus: jest.fn()
            },
            event: {
                addListener: jest.fn()
            }
        }
      };
    SimidProtocol.mockClear();
    mockReject.mockReset();
    testMap = new SimidMapCreative();
    document.body.innerHTML = `
    <div id="adContainer"></div>
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
    testMap.onInit(createInitData("{'buttonLabel': 'Place'}"));

    const buttonLabel = "Place";
    const startData = {
        messageId: 1,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:startCreative",  
    }
    testMap.onStart(startData);
    testMap.specifyButtonFeatures_(buttonLabel)

    const button = document.getElementById("findNearest");
    expect(button.innerText).toBe('Find Nearest Place');
});

test('testing button text updates with default ad params', () => {
    testMap.onInit(createInitData('{}'));

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

test('testing that rejection for ad params not found is working', () => {
    testMap.onInit(createInitData(""));

    expect(mockReject.mock.calls.length).toBe(1);
    const rejectMessageObject = mockReject.mock.calls[0][1];
    expect(rejectMessageObject.message).toBe("Ad parameters not found");
});

test('testing that rejection for searchQuery not found is working when given empty string', () => {
    testMap.onInit(createInitData('{"searchQuery": ""}'));

    expect(mockReject.mock.calls.length).toBe(1);
    const rejectMessageObject = mockReject.mock.calls[0][1];
    expect(rejectMessageObject.message).toBe("Required field searchQuery not found");
});

test('testing that rejection for searchQuery not found is working when search query not included', () => {
    testMap.onInit(createInitData('{"buttonLabel": "Location", "marker": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg.png"}'));

    expect(mockReject.mock.calls.length).toBe(1);
    const rejectMessageObject = mockReject.mock.calls[0][1];
    expect(rejectMessageObject.message).toBe("Required field searchQuery not found");
});

test('testing that rejection for JSON parsing errors is working', () => {
    testMap.onInit(createInitData('test'));

    expect(mockReject.mock.calls.length).toBe(1);
    const rejectMessageObject = mockReject.mock.calls[0][1];
    expect(rejectMessageObject.message).toBe("Invalid JSON input for ad parameters");
});

test('instance of map is instantiated if ad paused', async () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);

    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));

    await drivePromisesToCompletion();

    const returnButton = document.getElementById("returnToAd");
    expect(returnButton.textContent).toBe('Return To Ad');
    const skipButton = document.getElementById("skipAd");
    expect(skipButton.textContent).toBe('Skip Ad');
    expect(window.google.maps.Map.mock.instances.length).toBe(1);
});

test('LatLng coordinates constructor is called by default when map loads', async () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);

    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));

    await drivePromisesToCompletion();

    expect(window.google.maps.LatLng.mock.instances.length).toBe(1);
});

test('PlacesService object is initialized when map loads', async () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));
    await drivePromisesToCompletion();
    expect(window.google.maps.places.PlacesService.mock.instances.length).toBe(1);
});

test('nearbySearch function is called when map loads', async () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));
    await drivePromisesToCompletion();
    expect(window.google.maps.places.PlacesService.mock.results[0].
        value.nearbySearch.mock.instances.length).toBe(1);
});

test('displayDirections function is called when map loads', async () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));
    await drivePromisesToCompletion();
    console.log(window.google.maps.Marker.mock.instances);
    expect(window.google.maps.DirectionsRenderer.mock.results[0].
        value.setMap.mock.instances.length).toBe(1);
});

test('DirectionsService object is initialized when map loads', async () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));
    await drivePromisesToCompletion();
    expect(window.google.maps.DirectionsService.mock.instances.length).toBe(1);
});

test('Starting route is calculated when map loads', async () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));
    await drivePromisesToCompletion();
    expect(window.google.maps.DirectionsRenderer.mock.results[0].value.setDirections.mock.instances.length).toBe(1);
});

test('Confirm that 4 place markers are placed on the map', async () => {
    const eventData = createInitData();
    testMap.onInit(eventData);
    testMap.onStart(startData);
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.dispatchEvent(new Event('click'));
    await drivePromisesToCompletion();
    expect(window.google.maps.Marker.mock.instances.value).toBe(4);
});



