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

  // Wrap "registerPartial":
  // Register the parsed AST of the partial and make sure the the 'source'-property is set on all node
  // so that we can pass the partial-name of to the source-locator
  const originalRegisterPartial = handlebarsEnvironment.registerPartial.bind(handlebarsEnvironment)
  handlebarsEnvironment.registerPartial = function registerPartialWithSourceLocators (name, value) {
    console.log(name, value)
    if (Object.prototype.toString.call(name) === '[object Object]') {
      var partials = name
      Object.keys(partials).forEach((name) => this.registerPartial(name, partials[name]))
    } else {
      // create AST
      const parse = this.parse(value, { srcName: name })
      // call wrapped function
      originalRegisterPartial(name, parse)
    }
  }
  return handlebarsEnvironment
}

class SourceMapCompiler extends Handlebars.JavaScriptCompiler {
  constructor () {
    super()
    this.compiler = SourceMapCompiler
  }

  formatSourceLocator (position, srcName) {
    return srcName
      ? `<sl line="${position.line}" col="${position.column}" partial="${srcName}"></sl>`
      : `<sl line="${position.line}" col="${position.column}"></sl>`
  }

  appendToBuffer (source, location, explicit) {
    if (!location) {
      return super.appendToBuffer(source, location, explicit)
    }
    return [
      super.appendToBuffer(`'${this.formatSourceLocator(location.start, location.source)}'`, location, true),
      super.appendToBuffer(source, location, true),
      super.appendToBuffer(`'${this.formatSourceLocator(location.end, location.source)}'`, location, true)
    ]
  }
}
