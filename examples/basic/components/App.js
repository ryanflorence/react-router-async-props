var React = require('react');
var { RouteHandler } = require('react-router-async-props');

var App = React.createClass({
  render () {
    return (
      <div>
        <h1>App</h1>
        <RouteHandler/>
      </div>
    );
  }
});

module.exports = App;

