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
  new Route('7', { route: [], coordinates: [ [0, 2], [ 0, 1 ], [ 0, 0 ] ] }),
  new Route('8', { route: [], coordinates: [ [ 0, 0 ], [ 0, 1 ], [0, 2], [0, 3] ] }),
]

describe('routeList', function () {
  it('single route', function () {
    list = routeList()
    list.addToIndex(routes[0])

    assert.equal(list.segments.length, 1)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [0, 2] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0' ])
    assert.deepEqual(list.segments[0].backward, false)
  })

  it('touching routes', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[1])

    assert.equal(list.segments.length, 2)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [0, 2] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0' ])
    assert.deepEqual(list.segments[0].backward, false)
    assert.deepEqual(list.segments[1].coordinates, [ [ 1, 0 ], [ 0, 1 ], [1, 2] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '1' ])
    assert.deepEqual(list.segments[1].backward, false)
  })

  it('equal routes', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[3])

    assert.equal(list.segments.length, 1)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [0, 2] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0', '3' ])
    assert.deepEqual(list.segments[0].backward, false)
    assert.deepEqual(list.segments[0].backward, false)
  })

  it('retour routes', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[7])

    assert.equal(list.segments.length, 1)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [0, 2] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0', '7' ])
    assert.deepEqual(list.segments[0].backward, true)
  })

  it('sharing first part', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[2])

    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0', '2' ], 'B')
    assert.deepEqual(list.segments[0].backward, false)
    assert.deepEqual(list.segments[1].coordinates, [ [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '0' ], 'A')
    assert.deepEqual(list.segments[1].backward, false)
    assert.deepEqual(list.segments[2].coordinates, [ [ 0, 1 ], [ 2, 2 ] ])
    assert.deepEqual(ids(list.segments[2].routes), [ '2' ], 'C')
    assert.deepEqual(list.segments[2].backward, false)
  })

  it('sharing last part', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[4])

    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0' ], 'A')
    assert.deepEqual(list.segments[0].backward, false)
    assert.deepEqual(list.segments[1].coordinates, [ [ 1, 0 ], [ 0, 1 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '4' ], 'B')
    assert.deepEqual(list.segments[1].backward, false)
    assert.deepEqual(list.segments[2].coordinates, [ [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[2].routes), [ '0', '4' ], 'C')
    assert.deepEqual(list.segments[2].backward, false)
  })

  it('1st route prefix', function () {
    list = routeList()
    list.addToIndex(routes[5])
    list.addToIndex(routes[0])

    assert.deepEqual(list.segments[0].coordinates, [ [ -1, -1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '5' ], 'B')
    assert.deepEqual(list.segments[0].backward, false)
    assert.deepEqual(list.segments[1].coordinates, [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '5', '0' ], 'A')
    assert.deepEqual(list.segments[1].backward, false)
  })

  it('2nd route prefix', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[5])

    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0', '5' ], 'A')
    assert.deepEqual(list.segments[0].backward, false)
    assert.deepEqual(list.segments[1].coordinates, [ [ -1, -1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '5' ], 'B')
    assert.deepEqual(list.segments[1].backward, false)
  })

  it('route suffix', function () {
    list = routeList()
    list.addToIndex(routes[0])
    list.addToIndex(routes[8])

    assert.equal(list.segments.length, 2)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '0', '8' ], 'A')
    assert.deepEqual(list.segments[0].backward, false)
    assert.deepEqual(list.segments[1].coordinates, [ [ 0, 2 ], [ 0, 3 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '8' ], 'B')
    assert.deepEqual(list.segments[1].backward, false)
  })

  it('short', function () {
    list = routeList()
    list.addToIndex(routes[5])
    list.addToIndex(routes[6])

    assert.equal(list.segments.length, 3)
    assert.deepEqual(list.segments[0].coordinates, [ [ -1, -1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '5', '6' ], 'B')
    assert.deepEqual(list.segments[0].backward, false)
    assert.deepEqual(list.segments[1].coordinates, [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '5' ], 'A')
    assert.deepEqual(list.segments[1].backward, false)
    assert.deepEqual(list.segments[2].coordinates, [ [ 0, 0 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[2].routes), [ '6' ], 'A')
    assert.deepEqual(list.segments[2].backward, false)
  })

  it('sharing part retour 1', function () {
    list = routeList()
    list.addToIndex(routes[7])
    list.addToIndex(routes[2])

    assert.equal(list.segments.length, 3)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '7', '2' ], 'B')
    assert.deepEqual(list.segments[0].backward, true)
    assert.deepEqual(list.segments[1].coordinates, [ [ 0, 2 ], [ 0, 1 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '7' ], 'A')
    assert.deepEqual(list.segments[1].backward, false)
    assert.deepEqual(list.segments[2].coordinates, [ [ 0, 1 ], [ 2, 2 ] ])
    assert.deepEqual(ids(list.segments[2].routes), [ '2' ], 'C')
    assert.deepEqual(list.segments[2].backward, false)
  })

  it('sharing part retour 2', function () {
    list = routeList()
    list.addToIndex(routes[7])
    list.addToIndex(routes[4])

    assert.equal(list.segments.length, 3)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '7' ], 'A')
    assert.deepEqual(list.segments[0].backward, false)
    assert.deepEqual(list.segments[1].coordinates, [ [ 1, 0 ], [ 0, 1 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '4' ], 'B')
    assert.deepEqual(list.segments[1].backward, false)
    assert.deepEqual(list.segments[2].coordinates, [ [ 0, 2 ], [ 0, 1 ] ])
    assert.deepEqual(ids(list.segments[2].routes), [ '7', '4' ], 'C')
    assert.deepEqual(list.segments[2].backward, true)
  })

  it('1st route prefix retour', function () {
    list = routeList()
    list.addToIndex(routes[5])
    list.addToIndex(routes[7])

    assert.equal(list.segments.length, 2)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '5', '7' ], 'A')
    assert.deepEqual(list.segments[0].backward, true)
    assert.deepEqual(list.segments[1].coordinates, [ [ -1, -1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '5' ], 'B')
    assert.deepEqual(list.segments[1].backward, false)
  })

  it('2nd route prefix retour', function () {
    list = routeList()
    list.addToIndex(routes[7])
    list.addToIndex(routes[5])

    assert.equal(list.segments.length, 2)
    assert.deepEqual(list.segments[0].coordinates, [ [ 0, 2 ], [ 0, 1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[0].routes), [ '7', '5' ], 'A')
    assert.deepEqual(list.segments[0].backward, true)
    assert.deepEqual(list.segments[1].coordinates, [ [ -1, -1 ], [ 0, 0 ] ])
    assert.deepEqual(ids(list.segments[1].routes), [ '5' ], 'B')
    assert.deepEqual(list.segments[1].backward, false)
  })
})

function ids (list) {
  return list.map(e => e.id)
}
