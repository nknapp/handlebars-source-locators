/*!
 * handlebars-source-locators <https://github.com/nknapp/handlebars-source-locators>
 *
 * Copyright (c) 2017 Nils Knappmeier.
 * Released under the MIT license.
 */

/* eslint-env mocha */

const sourceLocators = require('../')
const Handlebars = require('handlebars')
const chai = require('chai')
const expect = chai.expect

describe('handlebars-source-locators', function () {
  it('should reject the original Handlebars environment', function () {
    expect(function () {
      sourceLocators(Handlebars)
    }).to.throw(Error, 'Refusing to apply source-locators to the default Handlebars environment.')
  })

  it('should not reject an environment created by Handlebars.create() ', function () {
    expect(function () {
      sourceLocators(Handlebars.create())
    }).not.to.throw()
  })

  it('should return the modified environment', function () {
    const handlebarsEnvironment = Handlebars.create()
    expect(sourceLocators(handlebarsEnvironment)).to.equal(handlebarsEnvironment)
  })

  it('should add source locators to output of the main template', function () {
    const templateString = deindent`
      a{{a}}
      bb{{b}}
      ccc{{c}}d
      `
    const exppectedResult = deindent`
      <sl line="1" col="0">a<sl line="1" col="1">1<sl line="1" col="6">
      bb<sl line="2" col="2">2<sl line="2" col="7">
      ccc<sl line="3" col="3">3<sl line="3" col="8">d
      `
    const env = sourceLocators(Handlebars.create())
    const output = env.compile(templateString)({ a: 1, b: 2, c: 3 })
    expect(output).to.equal(exppectedResult)
  })
})

/**
 * Remove indents and the first and last line from a multiline string
 * The last line defines the amount of indentation to be removed.
 * The first line is always expected to be empty
 * The list line is expected to consist only of spaces
 * @param strings
 * @param values
 */
function deindent (strings, ...values) {
  const result = String.raw.apply(String, arguments)
  const lines = result.split('\n')
  // Remote last and first line (both should be empty)
  const lastLine = lines.pop()
  if (!lastLine.match(/ +/)) {
    throw new Error('Last line is expected to consist only of spaces (at least one)')
    // ... or de-indentation is not needed
  }
  const firstLine = lines.shift()
  if (firstLine !== '') {
    throw new Error('First line is expected to be empty')
  }
  // The last line defines the mount of de-indentation
  return lines.map((line) => line.substr(lastLine.length))
    .join('\n')
}
