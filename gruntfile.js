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
          'app/styles/sapplies.css': 'app/styles/sapplies.scss'
        }
      }
    },

    watch: {
      sass: {
        files: 'app/styles/_sapplies.scss',
        tasks: 'sass'
      }
    },

    concurrent: {
      tasks: ['nodemon', 'watch'],
      options: {
          //limit: 5,
          logConcurrentOutput: true
      }
  }

  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.registerTask('default', ['concurrent']);
}
