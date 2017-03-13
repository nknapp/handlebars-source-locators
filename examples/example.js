const Handlebars = require('handlebars')
const addSourceLocators = require('../')

// Create a new Handlebars environment and add source-locators
const hbs = addSourceLocators(Handlebars.create())

hbs.registerPartial('info', `
Name: {{name}}
City: {{city}}
`)

hbs.registerPartial('hobbies', `
{{#each hobbies}}
- {{.}}
{{/each}}
`)

const template = hbs.compile(`
Info:
-----
{{> info}}

Hobbies:
-----
{{> hobbies}}
`)

console.log(template({
  name: 'Nils Knappmeier',
  city: 'Darmstadt',
  hobbies: [
    'Aikido',
    'Programming',
    'Theater',
    'Music'
  ]
}))
