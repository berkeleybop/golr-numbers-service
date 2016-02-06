////
//// Comprehensive for more flexible programmatic replacement for
//// Makefile (which depended to much on weird hard-coded chains of
//// ENV vars).
////
//// Usage: npm install && node ./node_modules/.bin/gulp doc|build|test|watch|clean
////

var us = require('underscore');
var fs = require('fs');
var gulp = require('gulp');
var bump = require('gulp-bump');
var flatten = require('gulp-flatten');
var jsdoc = require("gulp-jsdoc");
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var yaml = require('yamljs');
var tilde = require('expand-home-dir');
var request = require('request');
//var git = require('gulp-git');
//var watch = require('gulp-watch');
//var watchify = require('watchify');
//var concat = require('gulp-concat');
//var sourcemaps = require('gulp-sourcemaps');

///
/// Helpers.
///

function _die(str){
    console.error(str);
    process.exit(-1);
}

function _tilde_expand(ufile){
    return tilde(ufile);
}

function _tilde_expand_list(list){
    return us.map(list, function(ufile){
	//console.log('ufile: ' + ufile);
	return tilde(ufile);
    });
}

function _to_boolean(thing){
    var ret = false;

    if( typeof(thing) === 'string' ){
	if( thing === 'true' ){
	    ret = true;
	}else if( thing === '1' ){
	    ret = true;
	}
    }else if( typeof(thing) === 'number' ){
	if( thing === 1 ){
	    ret = true;
	}
    }

    return ret;
}

function _run_cmd(command_bits){
    var final_command = command_bits.join(' ');
    return ['echo \'' + final_command + '\'', final_command];
}

function _run_cmd_list(commands){
    var final_list = [];

    us.each(commands, function(cmd){
	final_list.push('echo \'' + cmd + '\'');
	final_list.push(cmd);
    });
    
    return final_list;
}

///
/// Bring in the AmiGO and working environment.
///

var paths = {
    // WARNING: Cannot use glob for clients--I use the explicit listing
    // to generate a dynamic browserify set.
    clients: [
	
    ],
    scripts: [
	'scripts/*'
    ],
};

// // Common variables.
// var golr_public_url = a['AMIGO_PUBLIC_GOLR_URL'].value;
// var gns_port = parseInt(a['GNS_PORT'].value);

///
/// Tests (async).
///

gulp.task('tests', ['tests']);

///
/// Docs.
///

gulp.task('docs', shell.task(_run_cmd_list(
    ['naturaldocs --rebuild-output --input ./javascript/lib/amigo --project javascript/docs/.naturaldocs_project/ --output html javascript/docs',
     'naturaldocs --rebuild-output --input ./perl/lib/ --project perl/docs/.naturaldocs_project/ --output html perl/docs']
)));

// // Run the GNS service.
// gulp.task('run-gns', shell.task(_run_cmd(
//     ['node', './lib/gns.js',
//      '-g', golr_public_url,
//      '-p', gns_port]
// )));

///
/// Publishing.
///

gulp.task('patch-bump', function(cb) {
    gulp.src('./package.json')
	.pipe(bump({
	    type: 'patch'
	}))
	.pipe(gulp.dest('./'));
    cb(null);
});

// Release tools for patch release.
gulp.task('release', ['bundle', 'assemble-npm', 'publish-npm', 'patch-bump']);

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['install', 'tests', 'docs']);
