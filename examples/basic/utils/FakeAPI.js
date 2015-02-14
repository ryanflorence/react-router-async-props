var Promise = require('bluebird');
var assign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;
var CHANGE_EVENT = 'CHANGE';

var events = new EventEmitter();

var copy = (arr) => {
  return arr.slice(0);
}

var state = {
  friends: [
    { id: 1, name: 'Neil Aboshamaa' },
    { id: 2, name: 'Dane Hansen' },
    { id: 3, name: 'Will Fisher' },
  ]
};

var notify = () => {
  events.emit(CHANGE_EVENT);
};

exports.addChangeListener = (listener) => {
  events.addListener(CHANGE_EVENT, listener);
};

exports.removeChangeListener = (listener) => {
  events.removeListener(CHANGE_EVENT, listener);
};

exports.getFriends = () => {
  return Promise.resolve(copy(state.friends));
};

exports.updateFriend = (id, props) => {
  var friend = state.friends.filter(friend => friend.id === id)[0];
  assign(friend, props);
  notify();
};


