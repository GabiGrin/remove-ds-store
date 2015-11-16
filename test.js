'use strict';

var test = require('ava');
var childProcess = require('child_process');
var glob = require('glob');
var ncp = require('ncp');
var del = require('del');
var path = require('path');

var pattern = 'fixture/.DS_Store';
var recursivePattern = 'fixture/**/.DS_Store';

var fixturesLocation = path.resolve(__dirname, 'fixture');

function runCli(args, cb) {
  childProcess.execFile('../index.js', args, {cwd: fixturesLocation}, cb);
}

test.beforeEach(function (t) {
  ncp('_fixture', 'fixture', function () {
    t.end();
  });
});

test.serial('should remove when not recursive', function (t) {
  t.plan(4);
  runCli([], function (err, stdout) {
    t.ifError(err);
    t.ok(stdout.match(/deleted.*1.*files.*/i));
    t.ok(stdout.match(/\.DS_Store/));
    t.is(glob.sync(pattern).length, 0);
  });
});


test.serial('should remove when recursive', function (t) {
  t.plan(6);
  runCli(['-r'], function (err, stdout) {
    t.ifError(err);
    t.ok(stdout.match(/deleted.*3.*files.*/i));
    t.ok(stdout.match(/inner\/further\/\.DS_Store/));
    t.ok(stdout.match(/inner\/\.DS_Store/));
    t.ok(stdout.match(/\.DS_Store/));
    t.is(glob.sync(pattern).length, 0);
  });
});

test.serial('should remove when with path and recursive', function (t) {
  t.plan(5);
  runCli(['inner', '-r'], function (err, stdout) {
    t.ifError(err);
    t.ok(stdout.match(/deleted.*2.*files.*/i));
    t.ok(stdout.match(/further\/\.DS_Store/));
    t.ok(stdout.match(/\.DS_Store/));
    t.is(glob.sync('fixture/inner/**.DS_Store').length, 0);
  });
});

test.serial('should show files on dry run and do not delete anything', function (t) {
  t.plan(4);

  runCli(['-d'], function (err, stdout) {
    t.ifError(err);
    t.ok(stdout.match(/found.*1.*files.*/i));
    t.ok(stdout.match(/\.DS_Store/));
    t.is(glob.sync(pattern).length, 1);
  });
});


test.serial('should show files on dry run and do not delete anything -r', function (t) {
  t.plan(6);

  runCli(['-r', '-d'], function (err, stdout) {
    t.ifError(err);
    t.ok(stdout.match(/found.*3.*files.*/i));
    t.ok(stdout.match(/inner\/further\/\.DS_Store/));
    t.ok(stdout.match(/inner\/\.DS_Store/));
    t.ok(stdout.match(/\.DS_Store/));
    t.ok(glob.sync(recursivePattern).length, 3);
  });
});

test.afterEach(function () {
  return del('fixture');
});
