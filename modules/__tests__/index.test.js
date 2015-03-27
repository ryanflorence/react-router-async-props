console.log(Date.now());
var React = require('react');
var Router = require('react-router');
var expect = require('expect');
var { Route } = Router;
var { EventEmitter } = require('events');

var {
  getAsyncProps,
  run,
  RouteHandler
} = require('../index.js');

var FAKE_DATA = {
  courses: [{id: 1, name: 'proggin 101'}],
  courses2: [
    {id: 1, name: 'proggin 101'},
    {id: 2, name: 'proggin 201'},
  ],
  course: {id: 1, name: 'proggin 101', description: 'the best course ever'}
};


// sorry, this is weird, we just change the key in tests
// so that CourseList.asyncProps.courses returns different
// data sets.
var events = new EventEmitter();
var dataKey = 'courses';
var changeDataKey = (key) => {
  dataKey = key;
  events.emit('CHANGE');
};

beforeEach(() => {
  changeDataKey('courses');
});

var CourseList = React.createClass({
  statics: {
    setupCalls: 0,
    teardownCalls: 0,

    asyncProps: {
      courses: {
        load (info) {
          return Promise.resolve(FAKE_DATA[dataKey]);
        },

        setup (onChange, info) {
          CourseList.setupCalls++;
          events.addListener('CHANGE', onChange);
        },

        teardown (onChange, info) {
          CourseList.teardownCalls++;
          events.removeListener('CHANGE', onChange);
        }
      }
    }
  },

  render () {
    var courses = this.props.courses.map(course => <li key={course.id}>{course.name}</li>);
    return (
      <div>
        <ul>{courses}</ul>
        <RouteHandler/>
      </div>
    );
  }
});

var Course = React.createClass({
  statics: {
    setupCalls: 0,
    teardownCalls: 0,

    asyncProps: {
      course: {
        load (routerState) {
          return Promise.resolve(FAKE_DATA.course);
        },

        setup (onChange, info) {
          Course.setupCalls++;
        },

        teardown (onChange, info) {
          Course.teardownCalls++;
        }
      }
    }
  },

  render () {
    return <div>{this.props.course.description}</div>
  }
});

describe('getAsyncProps', () => {
  it('loads the props for a list of one', () => {
    var components = [CourseList];
    return getAsyncProps(components, {}).then((propList) => {
      expect(propList).toEqual([{courses: FAKE_DATA.courses}]);
    });
  });

  it('loads the props for a list of > 1', () => {
    var components = [CourseList, Course];
    return getAsyncProps(components, {}).then((propList) => {
      expect(propList).toEqual([
        { courses: FAKE_DATA.courses },
        { course: FAKE_DATA.course },
      ]);
    });
  });
});

describe('Handler', () => {
  it('passes application props', (done) => {
    var App = React.createClass({
      render () {
        return <div>{this.props.name}</div>;
      }
    });
    var routes = <Route handler={App}/>;
    run(routes, "/", (Handler, state) => {
      var html = React.renderToString(<Handler name="test" />);
      expect(html).toContain('test');
      done();
    });
  });
});

describe('run', () => {
  var routes = (
    <Route handler={CourseList}>
      <Route path="course/:id" handler={Course}/>
    </Route>
  );

  it('passes data to the handlers', () => {
    run(routes, "/course/1", (Handler, state) => {
      var html = React.renderToString(<Handler />);
      expect(html).toContain(FAKE_DATA.courses[0].name);
      expect(html).toContain(FAKE_DATA.course.description);
    });
  });

  it('calls setup', (done) => {
    var div = document.createElement('div');
    run(routes, "/course/1", (Handler, state, onChange) => {
      var coursesCount = CourseList.setupCalls;
      var courseCount = Course.setupCalls;
      React.render(<Handler />, div, () => {
        setTimeout(() => {
          expect(CourseList.setupCalls).toEqual(coursesCount + 1);
          expect(Course.setupCalls).toEqual(courseCount + 1);
          React.unmountComponentAtNode(div);
          done();
        }, 0);
      });
    });
  });

  it('calls teardown', (done) => {
    var div = document.createElement('div');
    run(routes, "/course/1", (Handler, state, onChange) => {
      var coursesCount = CourseList.teardownCalls;
      var courseCount = Course.teardownCalls;
      React.render(<Handler />, div, () => {
        React.unmountComponentAtNode(div);
        expect(CourseList.teardownCalls).toEqual(coursesCount + 1);
        expect(Course.teardownCalls).toEqual(courseCount + 1);
        done();
      });
    });
  });

  it('rerenders onChange', (done) => {
    var div = document.createElement('div');
    var steps = [];

    steps.push(() => {
      expect(div.innerHTML).toContain(FAKE_DATA.courses[0].name);
      changeDataKey('courses2');
    });

    steps.push(() => {
      expect(div.innerHTML).toContain(FAKE_DATA.courses2[0].name);
      React.unmountComponentAtNode(div);
      done();
    });

    run(routes, "/course/1", (Handler, state, onChange) => {
      React.render(<Handler />, div, () => steps.shift()());
    });
  });
});

