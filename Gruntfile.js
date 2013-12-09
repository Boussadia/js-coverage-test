'use strict';

module.exports = function(grunt) {

  // Start JSCover Server
  var childProcess = require('child_process');
  var JSCOVER_PORT = "9999";
  var JAVA_HOME = process.env.JAVA_HOME;


  grunt.registerTask('jscover_server','Running JSCover Server', function(){
    var phantomjs;
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
      // If this value is set and an error occurs, it will be used as the value
      // and null will be passed as the error value.
      fallback: function(e){
        grunt.log.writeln('erre')
      }
    };
    function doneFunction(error, result, code) {
      grunt.log.writeln(error);
      grunt.log.writeln(result);
      grunt.log.writeln(code);
      done();
    }
    var jsCoverProc = grunt.util.spawn(options, doneFunction);
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

    var runner = grunt.util.spawn({
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
            ]},
        // If this value is set and an error occurs, it will be used as the value
        // and null will be passed as the error value.
        fallback: function(e){
          grunt.log.writeln('erre')
        }
      },doneFunction);

    runner.stdout.on('data', function(buf) {
        grunt.log.writeln(String(buf));
    });

    runner.on('exit', function (code) {
        // Tests have finished, so clean up the process
        var success = (code === 0) ? true : false;
        jsCoverProc.kill(); // kill the JSCover server now that we are done with it

        done(success);
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
    jscover_server:{}
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task.
  grunt.registerTask('default', ['clean', 'jscover_server']);

};