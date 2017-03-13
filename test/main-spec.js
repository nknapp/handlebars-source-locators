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
    const env = sourceLocators(Handlebars.create())

    const template = env.compile(deindent`
      a{{a}}
      bb{{b}}
      ccc{{c}}d
      `)
    expect(template({ a: 1, b: 2, c: 3 })).to.equal(deindent`
      <sl line="1" col="0"></sl>a<sl line="1" col="1"></sl>1<sl line="1" col="6"></sl>
      bb<sl line="2" col="2"></sl>2<sl line="2" col="7"></sl>
      ccc<sl line="3" col="3"></sl>3<sl line="3" col="8"></sl>d<sl line="3" col="9"></sl>
      `)
  })

  it('should include the partial-name, if the source is located in a partial', function () {
    const env = sourceLocators(Handlebars.create())

    var template = env.compile(deindent`
      partial-output:
      ----
      {{> myPartial}}
      
      ----
      
      `)

    env.registerPartial('myPartial', deindent`
      a{{a}}
      bb{{b}}
      ccc{{c}}d
      
      `)

    expect(template({ a: 1, b: 2, c: 3 })).to.equal(deindent`
      <sl line="1" col="0"></sl>partial-output:
      ----
      <sl line="3" col="0"></sl><sl line="1" col="0" partial="myPartial"></sl>a<sl line="1" col="1" partial="myPartial"></sl>1<sl line="1" col="6" partial="myPartial"></sl>
      bb<sl line="2" col="2" partial="myPartial"></sl>2<sl line="2" col="7" partial="myPartial"></sl>
      ccc<sl line="3" col="3" partial="myPartial"></sl>3<sl line="3" col="8" partial="myPartial"></sl>d
      <sl line="4" col="0" partial="myPartial"></sl><sl line="3" col="15"></sl>
      ----
      <sl line="6" col="0"></sl>
      `)
  })

  it('should work with multiple partial-registration', function () {
    const env = sourceLocators(Handlebars.create())

    var template = env.compile(deindent`
      partial-output:
      ----
      {{> partial1}}
      
      ----
      {{> partial2}}
      
      ----
      
      `)

    env.registerPartial({
      partial1: deindent`
        a{{a}}
        bb{{b}}
        
        `,
      partial2: deindent`
        c{{c}}
        dd{{c}}
        
        `
    })

    expect(template({a: 1, b: 2, c: 3, d: 4})).to.equal(deindent`
      <sl line="1" col="0"></sl>partial-output:
      ----
      <sl line="3" col="0"></sl><sl line="1" col="0" partial="partial1"></sl>a<sl line="1" col="1" partial="partial1"></sl>1<sl line="1" col="6" partial="partial1"></sl>
      bb<sl line="2" col="2" partial="partial1"></sl>2<sl line="2" col="7" partial="partial1"></sl>
      <sl line="3" col="0" partial="partial1"></sl><sl line="3" col="14"></sl>
      ----
      <sl line="6" col="0"></sl><sl line="1" col="0" partial="partial2"></sl>c<sl line="1" col="1" partial="partial2"></sl>3<sl line="1" col="6" partial="partial2"></sl>
      dd<sl line="2" col="2" partial="partial2"></sl>3<sl line="2" col="7" partial="partial2"></sl>
      <sl line="3" col="0" partial="partial2"></sl><sl line="6" col="14"></sl>
      ----
      <sl line="9" col="0"></sl>
      `)
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
