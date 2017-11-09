'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const configFilePath = path.resolve(process.argv[2] || 'README_CONFIG.js')

const contextPath = path.resolve(configFilePath, '..')

function resolve (file) {
  return path.resolve(contextPath, file)
}

function genSnippetDoc (info, config) {
  if (_.isString(info)) {
    return `${info}\n`
  } else if (_.isObject(info)) {
    let snippets = _.toArray(require(resolve(info.filePath)))
    let doc = `${info.title}\n\n`
    doc += '| Prefix | Snippet Content |\n'
    doc += '| --- | --- |\n'
    if (config.sortSnippetsByPrefix) {
      snippets.sort((a, b) => {
        return a.prefix > b.prefix ? 1 : -1
      })
    }
    for (let snippet of snippets) {
      let body = ''
      for (let line of snippet.body) {
        body += _.escape(line
          .replace(/(\$\d+)|(?:\$\{\d+(?:|(?::|\|)([^{]+?))})/g, '`|``$2`'))
          .replace(/`\|`/g, '<code>&#124;</code>')
          .replace(/``/g, '')
          .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') + '<br />'
      }
      doc += `|\`${snippet.prefix}\`|${body}|\n`
    }
    return doc
  } else {
    return ''
  }
}

const config = require(configFilePath)

let template = fs.readFileSync(resolve(config.template)) + ''

let snippets = ''
for (let info of config.snippets) {
  snippets += `${genSnippetDoc(info, {
    sortSnippetsByPrefix: config.sortSnippetsByPrefix
  })}\n`
}

template = template.replace(/\{\{Snippets}}/, snippets)

fs.writeFileSync(resolve(config.output), template)
