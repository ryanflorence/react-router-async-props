import React from 'react'
import {Route, HistoryLocation} from 'react-router'
import FriendsList from './src/components/FriendsList'
import Friend from './src/components/Friend'
import {run} from '../modules/index'

var routes = (
  <Route handler={FriendsList}>
    <Route name="friend" path="friends/:id" handler={Friend}/>
  </Route>
)

run(routes, '/friends/1', (Handler, state, asyncProps) => {
  React.render(<Handler />, document.getElementById('app'))
})
