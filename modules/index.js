var Promise = require('bluebird');
var React = require('react');
var assign = require('react/lib/Object.assign');
var Router = require('react-router');
var { RouteHandlerMixin } = Router;

var getAsyncProps = (components, info) => {
  return Promise.all(components.map((component) => {
    var asyncProps = component.asyncProps || {};
    return Promise.props(Object.keys(asyncProps).reduce((promises, propName) => {
      promises[propName] = asyncProps[propName].load(info);
      return promises;
    }, {}));
  }));
};

var runHooks = (hook, handler, asyncState) => {
  var { asyncProps } = handler;
  var { routerState, onChange } = asyncState;
  if (asyncProps) {
    Object.keys(asyncProps).forEach((propName) => {
      if (asyncProps[propName][hook]) {
        asyncProps[propName][hook](onChange, routerState);
      }
    });
  }
};

var RouteHandler = React.createClass({

  mixins: [ RouteHandlerMixin ],

  contextTypes: {
    asyncPropsState: React.PropTypes.object
  },

  componentDidMount () {
    var handler = this.context.getRouteAtDepth(this.getRouteDepth()).handler;
    runHooks('setup', handler, this.context.asyncPropsState);
  },

  componentWillUnmount () {
    var handler = this.context.getRouteAtDepth(this.getRouteDepth()).handler;
    runHooks('teardown', handler, this.context.asyncPropsState);
  },

  render () {
    var asyncProps = this.context.asyncPropsState.props[this.getRouteDepth()];
    return this.createChildRouteHandler(assign({}, this.props, asyncProps));
  }
});

var runRouter = (router, callback) => {
  var state = {
    props: {},
    routerState: {},
    onChange () { run(); },
    Handler: null
  };

  var RouterHandler = router;

  var setState = (newState) => {
    state = assign({}, state, newState);
  };

  var Root = React.createClass({
    childContextTypes: {
      asyncPropsState: React.PropTypes.object
    },

    getChildContext () {
      return {
        asyncPropsState: state
      };
    },

    componentDidMount () {
      var { handler } = state.routerState.routes[0];
      runHooks('setup', handler, state);
    },

    componentWillUnmount () {
      var { handler } = state.routerState.routes[0];
      runHooks('teardown', handler, state);
    },

    render () {
      return React.createElement(RouterHandler, state.props[0]);
    }
  });

  var run = () => {
    var { routerState } = state;
    var handlers = routerState.routes.map(route => route.handler);
    getAsyncProps(handlers, routerState).then((props) => {
      setState({ props });
      callback(Root, routerState, state.props);
    }).done();
  }

  router.run((Handler, routerState) => {
    setState({ Handler, routerState });
    run();
  });

  return router;
};

var run = (routes, location, callback) => {
  if (!callback) {
    callback = location;
    location = Router.HashLocation;
  }
  var router = Router.create({ routes, location });
  runRouter(router, callback);
  return router;
};

module.exports = {
  run,
  runRouter,
  getAsyncProps,
  RouteHandler
};

