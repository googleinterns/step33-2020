/** Tests to see if Find Nearest X button is appending correct text */

import SimidMapCreative from './simid_map_creative.js';

test('testing button given ad params', ()=> {
    document.body.innerHTML = '<button id="findNearest"></button>';

    const exampleMap = new SimidMapCreative();
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
    exampleMap.onInit(eventData);

    const startData = {
        messageId: 1,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:startCreative",  
    }
    exampleMap.onStart(startData);

    const button = document.getElementById("findNearest");
    expect(button.innerText).toBe('Find Nearest Place');
});

test('testing button with default ad params', ()=> {
    document.body.innerHTML = '<button id="findNearest"></button>';

    const exampleMap = new SimidMapCreative();
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
    exampleMap.onInit(eventData);

    const startData = {
        messageId: 1,
        sessionId: "test-session-id",
        timestamp: 0,
        type: "SIMID:Player:startCreative",  
    }
    exampleMap.onStart(startData);

    const button = document.getElementById("findNearest");
    expect(button.innerText).toBe('Find Nearest Location');
});

