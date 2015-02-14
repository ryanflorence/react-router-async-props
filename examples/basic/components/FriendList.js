var React = require('react');
var PureRender = require('react/lib/ReactComponentWithPureRenderMixin');
var Friend = require('./Friend');
var FriendsLoader = require('../loaders/FriendsLoader');
var FakeAPI = require('../utils/FakeAPI');

var FriendList = React.createClass({

  mixins: [ PureRender ],

  statics: {
    asyncProps: {
      friends: FriendsLoader
    }
  },

  handleEditFriend (id, updates) {
    FakeAPI.updateFriend(id, updates);
  },

  render () {
    return (
      <ul>
        {this.props.friends.map((friend) => <Friend
          onEdit={this.handleEditFriend.bind(this, friend.id)}
          key={friend.id}
          friend={friend}
        />)}
      </ul>
    );
  }
});

module.exports = FriendList;

