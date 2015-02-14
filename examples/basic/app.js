var React = require('react');
var Router = require('react-router');
var AsyncProps = require('react-router-async-props');
var App = require('./components/App');
var FriendsHandler = require('./components/FriendsHandler');
var { Route, DefaultRoute } = Router;

var routes = (
  <Route handler={App}>
    <DefaultRoute name="friends" handler={FriendsHandler} />
  </Route>
);

AsyncProps.run(routes, (Handler) => {
  React.render(<Handler/>, document.body);
});

