#!/usr/bin/env node
/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sassExtract = require('sass-extract');

/**
 * Simple Promiseify function that takes a Node API and return a version that supports promises.
 * We use promises instead of synchronized functions to make the process less I/O bound and
 * faster. It also simplify the code.
 */
function promiseify(fn) {
  return function() {
    const args = [].slice.call(arguments, 0);
    return new Promise((resolve, reject) => {
      fn.apply(this, args.concat([function (err, value) {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      }]));
    });
  };
}

const readFile = promiseify(fs.readFile);
const writeFile = promiseify(fs.writeFile);


function inlineResources(globs) {
  console.log('globs : ' + globs);
  if (typeof globs == 'string') {
    globs = [globs];
  }

  /**
   * For every argument, inline the templates and styles under it and write the new file.
   */
  return Promise.all(globs.map(pattern => {
    console.log('globs.map : pattern ' + pattern);
    if (pattern.indexOf('*') < 0) {
      // Argument is a directory target, add glob patterns to include every files.
      pattern = path.join(pattern, '**', '*');
    }

    const files = glob.sync(pattern, {})
      .filter(name => /\.js$/.test(name));  // Matches only JavaScript files.
    console.log('files : ' + files);
    // Generate all files content with inlined templates.
    return Promise.all(files.map(filePath => readFile(filePath, 'utf-8')
      .then(content => inlineResourcesFromString(content, url => path.join(path.dirname(filePath), url)))
      .then(content => writeFile(filePath, content))
      .then(content => console.log('done', filePath))
      .catch(err => {
        console.error('An error occured: ', err);
      })));
  }));
}

/**
 * Inline resources from a string content.
 * @param content {string} The source file's content.
 * @param urlResolver {Function} A resolver that takes a URL and return a path.
 * @returns {string} The content with resources inlined.
 */
function inlineResourcesFromString(content, urlResolver) {
  // Curry through the inlining functions.

  return [
    inlineTemplate,
    inlineStyle,
    removeModuleId
  ].reduce((content, fn) => fn(content, urlResolver), content);
}

if (require.main === module) {
  inlineResources(process.argv.slice(2));
}


/**
 * Inline the templates for a source file. Simply search for instances of `templateUrl: ...` and
 * replace with `template: ...` (with the content of the file included).
 * @param content {string} The source file's content.
 * @param urlResolver {Function} A resolver that takes a URL and return a path.
 * @return {string} The content with all templates inlined.
 */
function inlineTemplate(content, urlResolver) {
  return content.replace(/templateUrl:\s*'([^']+?\.html)'/g, function(m, templateUrl) {
    console.log('template', templateUrl);
    const templateFile = urlResolver(templateUrl);
    const templateContent = fs.readFileSync(templateFile, 'utf-8');
    const shortenedTemplate = templateContent
      .replace(/([\n\r]\s*)+/gm, ' ')
      .replace(/"/g, '\\"');
    return `template: "${shortenedTemplate}"`;
  });
}


/**
 * Inline the styles for a source file. Simply search for instances of `styleUrls: [...]` and
 * replace with `styles: [...]` (with the content of the file included).
 * @param urlResolver {Function} A resolver that takes a URL and return a path.
 * @param content {string} The source file's content.
 * @return {string} The content with all styles inlined.
 */
function inlineStyle(content, urlResolver) {
  return content.replace(/styleUrls:\s*(\[[\s\S]*?\])/gm, function(m, styleUrls) {
    const urls = eval(styleUrls);
    return 'styles: ['
      + urls.map(styleUrl => {
        const extension = path.extname(styleUrl);
        if(extension === '.scss'){
          console.log('extension sass trouvé', styleUrl);
          const style = sassExtract.renderSync({ file: urlResolver(styleUrl)});
          const shortenedStyle = style.css.toString()
            .replace(/([\n\r]\s*)+/gm, ' ')
            .replace(/"/g, '\\"');
          return `"${shortenedStyle}"`;

        }else{
          const styleFile = urlResolver(styleUrl);
          const styleContent = fs.readFileSync(styleFile, 'utf-8');
          const shortenedStyle = styleContent
            .replace(/([\n\r]\s*)+/gm, ' ')
            .replace(/"/g, '\\"');
          return `"${shortenedStyle}"`;
        }

      })
        .join(',\n')
      + ']';
  });
}


/**
 * Remove every mention of `moduleId: module.id`.
 * @param content {string} The source file's content.
 * @returns {string} The content with all moduleId: mentions removed.
 */
function removeModuleId(content) {
  return content.replace(/\s*moduleId:\s*module\.id\s*,?\s*/gm, '');
}


module.exports = inlineResources;
module.exports.inlineResourcesFromString = inlineResourcesFromString;
