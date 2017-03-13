/*!
 * handlebars-source-locators <https://github.com/nknapp/handlebars-source-locators>
 *
 * Copyright (c) 2017 Nils Knappmeier.
 * Released under the MIT license.
 */
var Handlebars = require('handlebars')

module.exports = addSourceLocators
/**
 * Adds source-locators so a Handlebars instance.
 * This is rejected, if Handlebars is the original Handlebars-environment.
 * Please use "Handlebars.create" to create a new environment and
 * pass that to this function.
 *
 * @param {Handlebars} a Handlebars environment
 *
 *
 * @public
 */
function addSourceLocators (handlebarsEnvironment) {
  if (handlebarsEnvironment === Handlebars) {
    throw new Error('Refusing to apply source-locators to the default Handlebars environment. Please use "Handlebars.create()"')
  }

  handlebarsEnvironment.JavaScriptCompiler = SourceMapCompiler
  handlebarsEnvironment.registerHelper('createSourceLocator', function (sourceLine, sourceColumn, partial) {
    return `<sl line="${sourceLine}" col="${sourceColumn}" partial="${partial}"></sl>`
  })

  return handlebarsEnvironment
}

class SourceMapCompiler extends Handlebars.JavaScriptCompiler {
  constructor () {
    super()
    this.compiler = SourceMapCompiler
  }

  appendToBuffer (source, location, explicit) {
    var result = super.appendToBuffer(source, location, true)
    return [
      super.appendToBuffer(`'<sl line="${result[1].line}" col="${result[1].column}">'`, location, true),
      result
    ]
  }
}
