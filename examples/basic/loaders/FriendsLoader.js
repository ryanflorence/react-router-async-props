var FakeAPI = require('../utils/FakeAPI');

exports.load = (routerState) => {
  return FakeAPI.getFriends();
};

exports.setup = (onChange) => {
  FakeAPI.addChangeListener(onChange);
};

exports.teardown = (onChange) => {
  FakeAPI.removeChangeListener(onChange);
};

