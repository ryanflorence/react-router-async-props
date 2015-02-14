var React = require('react');
var FriendList = require('./FriendList');
var PureRender = require('react/lib/ReactComponentWithPureRenderMixin');

var FriendsHandler = React.createClass({

  mixins: [ PureRender ],

  statics: {
    asyncProps: {
      friends: FriendList.asyncProps.friends
    }
  },

  render () {
    return (
      <div>
        <h2>Friends</h2>
        <FriendList friends={this.props.friends}/>
      </div>
    );
  }
});

module.exports = FriendsHandler;

