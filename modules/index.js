var React = require('react');
var assign = require('react/lib/Object.assign');
var Router = require('react-router');
var warning = require('react/lib/warning');
var { RouteHandlerMixin } = Router;

var getAsyncProps = (components, info) => {
  var loaders = components.reduce(function(loaders, component) {
    if (component.hasOwnProperty('asyncProps')) {
      Object.keys(component.asyncProps).forEach(function(propName) {
        loaders.push(component.asyncProps[propName].load(info));
      });
    }

    return loaders;
  }, []);

  return Promise.all(loaders).then(function(result) {
    var cursor = 0;

    return components.reduce(function(propSet, component) {
      var props = {};

      if (component.hasOwnProperty('asyncProps')) {
        props = Object.keys(component.asyncProps).reduce(function(props, propName) {
          props[propName] = result[cursor++];
          return props;
        }, {});
      }

      return propSet.concat(props);
    }, []);
  });
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

var warnAboutDuplicateProps = (userProps, asyncProps) => {
  if (asyncProps)
    Object.keys(userProps).forEach((propName) => {
      warning(
        !asyncProps[propName],
        'You passed in a prop to a route handler that is already defined in '+
        '`asyncProps`, your prop will be ignored in favor of the async prop.'
      );
    });
};

var RouteHandler = React.createClass({

  mixins: [ RouteHandlerMixin ],

  contextTypes: {
    asyncPropsState: React.PropTypes.object
  },

  componentDidMount () {
    var route = this.context.getRouteAtDepth(this.getRouteDepth());
    // TODO: do we really need this? surfacing in ember migration app
    if (route && route.handler) {
      runHooks('setup', route.handler, this.context.asyncPropsState);
      this.lastHandler = route.handler;
    }
  },

  componentDidUpdate() {
    var route = this.context.getRouteAtDepth(this.getRouteDepth());
    var lastHandler = this.lastHandler;
    var currHandler;

    if (route && route.handler) {
      currHandler = route.handler;

      if (lastHandler !== currHandler) {
        runHooks('teardown', lastHandler, this.context.asyncPropsState);
        runHooks('setup', currHandler, this.context.asyncPropsState);
        this.lastHandler = currHandler;
      }
    }
  },

  componentWillUnmount () {
    var route = this.context.getRouteAtDepth(this.getRouteDepth());
    if (route && route.handler)
      runHooks('teardown', route.handler, this.context.asyncPropsState);

    this.lastHandler = null;
  },

  render () {
    var asyncProps = this.context.asyncPropsState.props[this.getRouteDepth()];
    warnAboutDuplicateProps(this.props, asyncProps);
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
      var route = state.routerState.routes[0];
      if (route && route.handler)
        runHooks('setup', route.handler, state);
    },

    componentWillUnmount () {
      var route = state.routerState.routes[0];
      if (route && route.handler)
        runHooks('teardown', route.handler, state);
    },

    render () {
      warnAboutDuplicateProps(this.props, state.props[0]);
      return React.createElement(RouterHandler, assign({}, this.props, state.props[0]));
    }
  });

  var run = () => {
    var { routerState } = state;
    var handlers = routerState.routes.map(route => route.handler);
    getAsyncProps(handlers, routerState).then((props) => {
      setState({ props });
      callback(Root, routerState, state.props);
    });
  };

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
