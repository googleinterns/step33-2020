/**
 * Contains logic for sending mesages between the SIMID creative and the player.
 * Note: Some browsers do not support promises and a more complete implementation
 *       should consider using a polyfill.
 * Note: File originally from https://github.com/InteractiveAdvertisingBureau/SIMID/tree/master/examples
 */

import {PlayerMessage, CreativeMessage} from './constants.js';
import {generateSessionId} from '../creatives/maps/utils.js';

export default class SimidProtocol {

  constructor() {
    /*
     * A map of messsage type to an array of callbacks.
     * @private {Map<String, Array<Function>>}
     */
    this.listeners_ = new Map();

    /*
     * The session ID for this protocol.
     * @private {String}
     */
    this.sessionId_ = '';

    /**
     * The next message ID to use when sending a message.
     * @private {number}
     */
    this.nextMessageId_ = 1;

    /**
     * The window where the message should be posted to.
     * @private {!Element}
     */
    this.target_ = window.parent;

    this.resolutionListeners_ = {};

    window.addEventListener('message',
        this.receiveMessage.bind(this), false);
  }

  /* Reverts this protocol to its original state */
  reset() {
    this.listeners_.clear();
    this.sessionId_ = '';
    this.nextMessageId_ = 1;
    // TODO: Perhaps we should reject all associated promises.
    this.resolutionListeners_ = {};
  }

  /**
   * Sends a message using post message.  Returns a promise
   * that will resolve or reject after the message receives a response.
   * @param {string} messageType The name of the message
   * @param {?Object} messageArgs The arguments for the message, may be null.
   * @return {!Promise} Promise that will be fulfilled when client resolves or rejects.
   */
  sendMessage(messageType, messageArgs) {
    // Incrementing between messages keeps each message id unique.
    const messageId = this.nextMessageId_ ++;
    // Only create session does not need to be in the SIMID name space
    // because it is part of the protocol.
    const nameSpacedMessage = 
        messageType == ProtocolMessage.CREATE_SESSION ?
            messageType : 'SIMID:' + messageType;

    // The message object as defined by the SIMID spec.
    const message = {
      'sessionId': this.sessionId_,
      'messageId': messageId,
      'type': nameSpacedMessage,
      'timestamp': Date.now(),
      'args': messageArgs
    }

    if (EventsThatRequireResponse.includes(messageType)) {
      // If the message requires a callback this code will set
      // up a promise that will call resolve or reject with its parameters.
      return new Promise((resolve, reject) => {
        this.addResolveRejectListener_(messageId, resolve, reject);
        this.target_.postMessage(JSON.stringify(message), '*');
      });
    }
    // A default promise will just resolve immediately.
    // It is assumed no one would listen to these promises, but if they do
    // it will "just work".
    return new Promise((resolve, reject) => {
      this.target_.postMessage(JSON.stringify(message), '*');
      resolve();
    });
	}

  /**
   * Adds a listener for a given message.
   */
  addListener(messageType, callback) {
    if (!this.listeners_[messageType]) {
      this.listeners_[messageType] = [callback];
    } else {
      this.listeners_[messageType].push(callback);
    }
  }

  /**
   * Sets up a listener for resolve/reject messages.
   * @private
   */
  addResolveRejectListener_(messageId, resolve, reject) {
    const listener = (data) => {
      const type = data['type'];
      const args = data['args']['value'];
      if (type == 'resolve') {
        resolve(args);
      } else if (type == 'reject') {
        reject(args);
      }
    }
    this.resolutionListeners_[messageId] = listener.bind(this);
  }

  /**
   * Recieves messages from either the player or creative.
   */
  receiveMessage(event) {
    if (!event || !event.data) {
      return;
    }
    const data = JSON.parse(event.data);
    if (!data) {
      // If there is no data in the event this is not a SIMID message.
      return;
    }
    const sessionId = data['sessionId'];

    const type = data['type'];
    // A sessionId is valid in one of two cases:
    // 1. It is not set and the message type is createSession.
    // 2. The session ids match exactly.
    const isCreatingSession = this.sessionId_ == '' && type == ProtocolMessage.CREATE_SESSION;
    const isSessionIdMatch = this.sessionId_ == sessionId;
    const validSessionId = isCreatingSession || isSessionIdMatch;

    if (!validSessionId || type == null) {
      // Ignore invalid messages.
      return;
    }

    // There are 2 types of messages to handle:
    // 1. Protocol messages (like resolve, reject and createSession)
    // 2. Messages starting with SIMID:
    // All other messages are ignored.
    if (Object.values(ProtocolMessage).includes(type)) {
      this.handleProtocolMessage_(data);
    } else if (type.startsWith('SIMID:')) {
      // Remove SIMID: from the front of the message so we can compare them with the map.
      const specificType = type.substr(6);
      const listeners = this.listeners_[specificType];
      if (listeners) {
        listeners.forEach((listener) => listener(data));
      }
    }
  }

  /**
   * Handles incoming messages specifically for the protocol
   * @param {!Object} data Data passed back from the message
   * @private
   */
  handleProtocolMessage_(data) {
    const type = data['type'];
    switch (type) {
      case ProtocolMessage.CREATE_SESSION:
        this.sessionId_ = data['sessionId'];
        this.resolve(data);
        const listeners = this.listeners_[type];
        if (listeners) {
          // calls each of the listeners with the data.
          listeners.forEach((listener) => listener(data));
        }
        break;
      case ProtocolMessage.RESOLVE:
        // intentional fallthrough
      case ProtocolMessage.REJECT:
        const args = data['args'];
        const correlatingId = args['messageId'];
        const resolutionFunction = this.resolutionListeners_[correlatingId];
        if (resolutionFunction) {
          // If the listener exists call it once only.
          resolutionFunction(data);
          delete this.resolutionListeners_[correlatingId];
        }
        break;
    } 
  }


  /**
   * Resolves an incoming message.
   * @param {!Object} incomingMessage the message that is being resolved.
   * @param {!Object} outgoingArgs Any arguments that are part of the resolution.
   */
  resolve(incomingMessage, outgoingArgs) {
    const messageId = this.nextMessageId_ ++;
    const resolveMessageArgs = {
      'messageId': incomingMessage['messageId'],
      'value': outgoingArgs,
    };
    const message = {
      'sessionId': this.sessionId_,
      'messageId': messageId,
      'type': ProtocolMessage.RESOLVE,
      'timestamp': Date.now(),
      'args': resolveMessageArgs
    }
    this.target_.postMessage(JSON.stringify(message), '*');
  }

  /**
   * Rejects an incoming message.
   * @param {!Object} incomingMessage the message that is being resolved.
   * @param {!Object} outgoingArgs Any arguments that are part of the resolution.
   */
  reject(incomingMessage, outgoingArgs) {
    const messageId = this.nextMessageId_ ++;
    const rejectMessageArgs = {
      'messageId': incomingMessage['messageId'],
      'value': outgoingArgs,
    };
    const message = {
      'sessionId': this.sessionId_,
      'messageId': messageId,
      'type': ProtocolMessage.REJECT,
      'timestamp': Date.now(),
      'args': rejectMessageArgs
    }
    this.target_.postMessage(JSON.stringify(message), '*');
  }

  /**
   * Creates a new session.
   * @param {String} sessionId
   * @return {!Promise} The promise from the create session message.
   */
  createSession() {
    const sessionCreationResolved = () => {
        console.log('Session created.');
    }
    const sessionCreationRejected = () => {
      // If this ever happens, it may be impossible for the ad
      // to ever communicate with the player.
      console.log('Session creation was rejected.');
    }

    this.sessionId_ = generateSessionId();
    this.sendMessage(ProtocolMessage.CREATE_SESSION).then(
      sessionCreationResolved, sessionCreationRejected);
  }

  setMessageTarget(target) {
    this.target_ = target;
  }
}

const ProtocolMessage = {
  CREATE_SESSION: 'createSession',
  RESOLVE: 'resolve',
  REJECT: 'reject'
}

/**
 * These messages require a response (either resolve or reject).
 * All other messages do not require a response and are information only.
 */
const EventsThatRequireResponse = [
  CreativeMessage.GET_MEDIA_STATE,
  CreativeMessage.REQUEST_VIDEO_LOCATION,
  CreativeMessage.READY,
  CreativeMessage.CLICK_THRU,
  CreativeMessage.REQUEST_SKIP,
  CreativeMessage.REQUEST_STOP,
  CreativeMessage.REQUEST_PAUSE,
  CreativeMessage.REQUEST_PLAY,
  CreativeMessage.REQUEST_FULL_SCREEN,
  CreativeMessage.REQUEST_FULL_VOLUME,
  CreativeMessage.REQUEST_FULL_RESIZE,
  CreativeMessage.REQUEST_CHANGE_AD_DURATION,
  CreativeMessage.REPORT_TRACKING,
  PlayerMessage.INIT,
  PlayerMessage.START_CREATIVE,
  PlayerMessage.AD_SKIPPED,
  PlayerMessage.AD_STOPPED,
  PlayerMessage.FATAL_ERROR,
  ProtocolMessage.CREATE_SESSION,
];
