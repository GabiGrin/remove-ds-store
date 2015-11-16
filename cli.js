#!/usr/bin/env node

'use strict';
var meow = require('meow');
var del = require('del');
var glob = require('glob');
var path = require('path');

var cli = meow('Usage - $ delete-ds-store [path] [-r] [--dry-run]\n path defaults to cwd', {
  alias: {
    r: 'recursive',
    d: 'dry-run'
  }
});

var isDryRun = cli.flags.d;
var recursive = cli.flags.r;
var pattern = (recursive ? '**/' : '') + '.DS_Store';

var cliPath = cli.input[0] || process.cwd();

if (isDryRun) {
  glob(pattern, {cwd: cliPath}, function (err, files) {
    console.log('found', files.length, 'files:');
    console.log(files.join('\n'));
  });
} else {
  del(path.resolve(cliPath, pattern))
    .then(function (files) {
      console.log('deleted', files.length, 'files');
      console.log(files.join('\n'));
    });
}
