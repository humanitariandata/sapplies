'use-strict';

module.exports = function(grunt) {
  grunt.initConfig({

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    sass: {
      dist: {
        options: {
          style: 'nested'
        },
        files: {
          'app/styles/sapplies.css': 'app/styles/_sapplies.scss'
        }
      }
    },

    watch: {
      sass: {
        files: 'app/styles/_sapplies.scss',
        tasks: 'sass'
      }
    }

  });
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.registerTask('default', ['nodemon', 'watch']);
}
