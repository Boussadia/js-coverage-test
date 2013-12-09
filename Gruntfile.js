'use strict';

module.exports = function(grunt) {

  // Start JSCover Server
  var childProcess = require('child_process');
  var JSCOVER_PORT = "9999";
  var JAVA_HOME = process.env.JAVA_HOME;
 function doneFunction(error, result, code) {
      grunt.log.writeln(error);
      grunt.log.writeln(result);
      grunt.log.writeln(code);
    }

  grunt.registerTask('test','Running JSCover Server', function(){
    var phantomjs, runnerPJS, converter,jsCoverProc;
    // if there's already phantomjs instance tell it to quit
    phantomjs && phantomjs.kill();
    var done = this.async();
    var src_jscover = 'jscover/JSCover-all.jar';
    var jasmine_path = 'src\\test\\lib\\PhantomJS\\run-jscover-jasmine.js';
    var url = 'http://localhost:'+JSCOVER_PORT+'/src/test/SpecRunner.html';
    var jsCoverChildArgs = [
      "-jar", src_jscover,
      "-ws",
      "--port="+JSCOVER_PORT,
      "--document-root=./",
      "--report-dir=target/"
      ];

    var options = {
      // The command to execute. It should be in the system path.
      cmd: "java",
      // If specified, the same grunt bin that is currently running will be
      // spawned as the child command, instead of the "cmd" option. Defaults
      // to false.
      grunt: false,
      // An array of arguments to pass to the command.
      args: jsCoverChildArgs,
      // Additional options for the Node.js child_process spawn method.
      opts: { stdio: [ process.stdin
          , process.stout
          , process.stderr
          ]},
    };
   
    jsCoverProc = grunt.util.spawn(options, function(){
      done()
    });
    jsCoverProc.stdout.on('data', function(buf) {
      grunt.log.writeln(String(buf));
    });

    phantomjs = require('phantomjs');
    var binPath = phantomjs.path;

    var childArgs = [
      '--debug=true',
            jasmine_path,
            url,
            
        ];

    setTimeout(function(){
      runnerPJS = grunt.util.spawn({
        // The command to execute. It should be in the system path.
        cmd: "phantomjs",
        // If specified, the same grunt bin that is currently running will be
        // spawned as the child command, instead of the "cmd" option. Defaults
        // to false.
        grunt: false,
        // An array of arguments to pass to the command.
        args: childArgs,
        // Additional options for the Node.js child_process spawn method.
        opts: { stdio: [ process.stdin
            , process.stout
            , process.stderr
            ]}
      },function (code) {
          // Tests have finished, so clean up the process
          var success = (code === 0) ? true : false;
          jsCoverProc.kill(); // kill the JSCover server now that we are done with it

      });

      runnerPJS.stdout.on('data', function(buf) {
          grunt.log.writeln(String(buf));
      });

    }, 1000)
  })

  grunt.registerTask('convert','Converting ', function(){
    var converter;
    var done = this.async();
    var converterOptions = [
      '-cp',
      'jscover\\JSCover-all.jar',
      'jscover.report.Main',
      '--format=LCOV',
      'target\\phantom',
      'src'
    ]

      converter = grunt.util.spawn({
          // The command to execute. It should be in the system path.
          cmd: "java",
          // If specified, the same grunt bin that is currently running will be
          // spawned as the child command, instead of the "cmd" option. Defaults
          // to false.
          grunt: false,
          // An array of arguments to pass to the command.
          args: converterOptions,
          // Additional options for the Node.js child_process spawn method.
          opts: { stdio: [ process.stdin
              , process.stout
              , process.stderr
              ]}
        },function (code) {
          // Tests have finished, so clean up the process
          var success = (code === 0) ? true : false;
          //runnerPJS.kill(); // kill the JSCover server now that we are done with it

          //done(success);
      });

      converter.stdout.on('data', function(buf) {
          grunt.log.writeln(String(buf));
      });

  })
  
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '',
    // Task configuration.
    clean: {
      src: ['target']
    },
    test:{},
    convert: {},
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task.
  grunt.registerTask('default', ['clean', 'test', 'convert']);

};