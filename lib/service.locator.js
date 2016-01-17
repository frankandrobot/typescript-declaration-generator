const fs = require('fs')
const stringify = require('json-stringify-safe')
const typescript = require('typescript')
const P = require('bluebird')
const _ = require('lodash')

const bindTs = require('./ts.js').bindTs
const bindAstVisitors = require('./ast.visitors.js').bindAstVisitors
const bindGenerators = require('./generators.js').bindGenerators

const ts = bindTs({ts: typescript, fs, P, _})
const astVisitors = bindAstVisitors({ts, stringify})
const generators = bindGenerators({ts, stringify, astVisitors})

module.exports = {

  ts,
  astVisitors,
  generators
}
