'use strict';

module.exports = function (grunt) {
    grunt.registerTask('release', function (prop) {
        if (!prop || require('crypto').createHash('md5').update(prop).digest('hex') !== '37f525e2b6fc3cb4abd882f708ab80eb') {
            grunt.fail.warn('Wrong prop supplied. Are you sure you know what you are doing? There is no use to');
        }

        //var pkg = grunt.file.readJSON('package.json');
        //var arr = pkg.version.split('.');
        //arr.push(parseInt(arr.pop()) + 1);
        //pkg.version = arr.join('.');
        //grunt.file.write('package.json', JSON.stringify(pkg, null, 2));

        var command = ['npm version patch -m"update version to %s"',
                       'git push',
                       'git push --tags'].join(' && ');
        grunt.log.writeln(command);
        var done = this.async();
        require('child_process').exec(command, function(err, stdout, stderr) {
            if (err) {
                grunt.fail.warn('releasing version failed ' + err, err);
            }
            grunt.log.writeln('output ' + stdout + stderr);
            grunt.log.ok('releasing version');
            done();
        });
    });
};
