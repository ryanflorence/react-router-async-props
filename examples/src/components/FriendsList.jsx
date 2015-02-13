import Promise from 'bluebird'
import React from 'react'
import {Link} from 'react-router'
import {RouteHandler} from '../../../modules/index'

const FRIENDS = [
  {id: 1, name: 'Alice', age: 28},
  {id: 2, name: 'Bob', age: 31}
]

var FriendsList = React.createClass({
  statics: {
    asyncProps: {
      friends: {
        load (info) {
          return Promise.resolve(FRIENDS)
        }
      }
    }
  },

  render () {
    var friends = this.props.friends.map(friend =>
      <li key={friend.id}>
        <Link
          to="friend"
          params={{id: friend.id}}
        >
          {friend.name} (age: {friend.age})
        </Link>
      </li>
    )
    return (
      <div>
        <ul>{friends}</ul>
        <RouteHandler />
      </div>
    )
  }
})

export default FriendsList
