var React = require('react');
var PureRender = require('react/lib/ReactComponentWithPureRenderMixin');
var FakeAPI = require('../utils/FakeAPI');

var Friend = React.createClass({

  mixins: [ PureRender ],

  propTypes: {
    friend: React.PropTypes.object
  },

  edit () {
    var name = prompt('New name?');
    this.props.onEdit({ name });
  },

  render () {
    var { friend } = this.props;
    return (
      <li>
        <button onClick={this.edit}>edit</button> {' '}
        {friend.name}
      </li>
    );
  }
});

module.exports = Friend;

