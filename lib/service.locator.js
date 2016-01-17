const fs = require('fs')
const stringify = require('json-stringify-safe')
const typescript = require('typescript')
const P = require('bluebird')

const bindTs = require('./ts.js').bindTs
const bindAstVisitors = require('./ast.visitors.js').bindAstVisitors
const bindGenerators = require('./generators.js').bindGenerators

const ts = bindTs({ts: typescript, fs, P})
const astVisitors = bindAstVisitors({ts, stringify})
const generators = bindGenerators({ts, stringify})

module.exports = {

  ts,
  astVisitors,
  generators
}
