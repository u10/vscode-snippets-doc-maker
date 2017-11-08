'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const configFilePath = path.resolve(process.argv[2] || 'README_CONFIG.js')

const contextPath = path.resolve(configFilePath, '..')

function resolve(file) {
  return path.resolve(contextPath, file)
}

function genSnippetDoc(info) {
  const snippets = require(resolve(info.filePath))
  let doc = `## ${info.title}\n\n`
  doc += '| Prefix | Snippet Content |\n'
  doc += '| --- | --- |\n'
  const keys = _.keys(snippets).sort()
  for (let key of keys) {
    let snippet = snippets[key]
    let body = ''
    for (let line of snippet.body) {
      body += _.escape(line.replace(/(?:\$\d+)|(?:\$\{\d+(?:|(?::|\|)([^{]+))})/g, '$1')).replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') + '<br />'
    }
    doc += `|\`${snippet.prefix}\`|${body}|\n`
  }
  return doc
}

const config = require(configFilePath)

let template = fs.readFileSync(resolve(config.template)) + ''

let snippets = ''
for (let info of config.snippets) {
  snippets += `${genSnippetDoc(info)}\n`
}

template = template.replace(/\{\{Snippets}}/, snippets)

fs.writeFileSync(resolve(config.output), template)
