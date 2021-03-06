const fs = require('fs')
const stringify = require('json-stringify-safe')
const typescript = require('typescript')
const P = require('bluebird')
const _ = require('lodash')
const path = require('path')

const bindTsPlus = require('./ts.plus.js').bindTsPlus
const bindAstVisitors = require('./ast.visitors.js').bindAstVisitors
const bindNodeTransformers = require('./node.transformers.js').bindNodeTransformers

const createTsPlus = bindTsPlus({ts: typescript, fs, P, _, path})
const createAstVisitors = bindAstVisitors({stringify})
const createNodeTransformers = bindNodeTransformers({stringify})

module.exports = {

  createTsPlus,
  createAstVisitors,
  createNodeTransformers
}
