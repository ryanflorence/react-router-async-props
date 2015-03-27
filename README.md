React Router Async Props
========================

Data dependency loading and updating for React Router applications.

WIP
---

This is a work in progress, we're going to try it out in one of our apps
@instructure, see how it goes.

**This library assumes `Promise` is available as a global.**

Usage
-----

```js
// using flux terminology for shared vocabulary, but this library does
// not have any opinion about flux

var {
  RouteHandler, // <-- not the usual RouteHandler!
  run
} = require('react-router-async-props');

var Groups = React.createClass({
  statics: {
    asyncProps: {
      groups: {
        load () {
          return GroupsStore.fetchAll();
        },
        setup (onChange) {
          GroupStore.addChangeListenter(onChange);
        },
        teardown (onChange) {
          GroupStore.removeChangeListenter(onChange);
        }
      }
    }
  },

  render () {
    var groups = this.props.groups.map((group) => <li>{group.name}</li>);
    return <ul>{groups}</ul>;
  }
});

var FriendsHandler = React.createClass({
  statics: {
    asyncProps: {
      friends: {

        // load is called before anything renders, and every time data
        // changes, so you'll probably want caching in the routine here
        load () {
          return FriendStore.fetchAll(); // return a promise (sorry)
        },

        // called when the route handler is first mounted
        setup (onChange) {
          // when onChange is called, the app rerenders from the top,
          // calling "load" on all async props again
          FriendStore.addChangeListenter(onChange);
        },

        // called when the route handler is unmounted
        teardown (onChange) {
          FriendStore.removeChangeListenter(onChange);
        }
      },

      // get child dependencies (a bit like relay minus graphql)
      groups: Groups.asyncProps.groups
    }
  },

  render () {
    // value from `asyncProps[key].load` shows up on `this.props[key]`
    var friends = this.props.friends.map((friend) => <li>{friend.name}</li>);
    return (
      <div>
        <ul>{friends}</ul>
        <Groups groups={this.props.groups}/>
      </div>
    );
  }
});

var AppHandler = React.createClass({
  statics: {
    asyncProps: {
      user: {
        load () {
          return UserStore.fetch();
        }
      }
    }
  },

  render () {
    // only the props that a handler asks for are relayed to it, this
    // `AppHandler` does not get the async props for the FriendList,
    // they aren't coallesced and given to everybody. Each route handler
    // is an entry point into the app and have no dependencies on
    // eachother.
    return (
      <div>
        <h1>Welcome {this.props.user.name}</h1>
        <RouteHandler/> {/* <-- must be from this lib, not the router */}
      </div>
    );
  }
});


var routes = (
  <Route handler={AppHandler}>
    <Route name="friends" handler={FriendsHandler}/>
  </Route>
);

// same signature as Router.run
var { HistoryLocation } = require('react-router');
run(routes, HistoryLocation, (Handler, state, asyncProps) => {
  React.render(<Handler/>, document.body);
});
```

Notes
-----

The error handling from using promises is driving me nuts, so expect the
`load` hook to send a callback instead of ask for a promise in the near
future, but promises make waiting on all the load hooks really trivial.

I'd also like the `onChange` to be smarter and not cause a rerender from
the top, but only on the route handler that has changed data.

Project
-------

```sh
npm install
npm run examples
```

