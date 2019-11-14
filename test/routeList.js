const assert = require('assert')

const routeList = require('../src/map-routeList.js')
const Route = require('../src/Route')

let routes = [
  new Route('0', { route: [], coordinates: [ [ 0, 0 ], [ 0, 1 ], [0, 2] ] }),
  new Route('1', { route: [], coordinates: [ [ 1, 0 ], [ 0, 1 ], [1, 2] ] }),
  new Route('2', { route: [], coordinates: [ [ 0, 0 ], [ 0, 1 ], [2, 2] ] }),
  new Route('3', { route: [], coordinates: [ [ 0, 0 ], [ 0, 1 ], [0, 2] ] }),
  new Route('4', { route: [], coordinates: [ [ 1, 0 ], [ 0, 1 ], [0, 2] ] }),
  new Route('5', { route: [], coordinates: [ [-1, -1], [ 0, 0 ], [ 0, 1 ], [0, 2] ] }),
  new Route('6', { route: [], coordinates: [ [-1, -1], [ 0, 0 ], [0, 2] ] }),
]

describe('routeList', function () {
  it('single route', function () {
    list = routeList()
    list.addToIndex(routes[0])

    assert.equal(list.segments.length, 1)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [0, 2] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0' ])
  })

  it('touching routes', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[1])

    assert.equal(list.segments.length, 2)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [0, 2] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0' ])
    assert.deepEqual(list.segments[1].coordinates, [ [ 1, 0 ], [ 0, 1 ], [1, 2] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '1' ])
  })

  it('equal routes', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[3])

    assert.equal(list.segments.length, 1)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [0, 2] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0', '3' ])
  })

  it('sharing first part', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[2])

    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0', '2' ], 'B')
    assert.deepEqual(list.segments[1].coordinates, [ [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '0' ], 'A')
    assert.deepEqual(list.segments[2].coordinates, [ [ 0, 1 ], [ 2, 2 ] ])
    assert.deepEqual(ids(list.segments[2].routes), [ '2' ], 'C')
  })

  it('sharing last part', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[4])

    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0' ], 'A')
    assert.deepEqual(list.segments[1].coordinates, [ [ 1, 0 ], [ 0, 1 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '4' ], 'B')
    assert.deepEqual(list.segments[2].coordinates, [ [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[2].routes), [ '0', '4' ], 'C')
  })

  it('1st route prefix', function () {
    list = routeList()
    list.addToIndex(routes[5])
    list.addToIndex(routes[0])

    assert.deepEqual(list.segments[0].coordinates, [ [ -1, -1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '5' ], 'B')
    assert.deepEqual(list.segments[1].coordinates, [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '5', '0' ], 'A')
  })

  it('2nd route prefix', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[5])

    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0', '5' ], 'A')
    assert.deepEqual(list.segments[1].coordinates, [ [ -1, -1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '5' ], 'B')
  })

  it('short', function () {
    list = routeList()
    list.addToIndex(routes[5])
    list.addToIndex(routes[6])

    assert.deepEqual(list.segments[0].coordinates, [ [ -1, -1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '5', '6' ], 'B')
    assert.deepEqual(list.segments[1].coordinates, [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '5' ], 'A')
    assert.deepEqual(list.segments[2].coordinates, [ [ 0, 0 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[2].routes), [ '6' ], 'A')
  })
})

function ids (list) {
  return list.map(e => e.id)
}
