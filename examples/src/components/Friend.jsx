import Promise from 'bluebird'
import React from 'react'

const FRIEND = {id: 3, name: 'John', age: 40}

var Friend = React.createClass({
  statics: {
    asyncProps: {
      friend: {
        load (routerState) {
          return Promise.resolve(FRIEND)
        }
      }
    }
  },

  render () {
    return <div>Hello, {this.props.friend.name}</div>
  }
})

export default Friend
