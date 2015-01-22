'use strict';
var fs = require('fs');
var path = require('path');

var cwd = path.resolve(__dirname, '..');
var pkgJson = path.resolve(cwd, 'package.json');
console.log('' + cwd);
console.log('' + pkgJson);

function exec(args) {
    var prop;
    if (args.length === 0) {
        console.log('Wrong prop supplied. Are you sure you know what you are doing? There is no use to');
        return;
    }
    prop = args[0];

    if (!prop || require('crypto').createHash('md5').update(prop).digest('hex') !== '37f525e2b6fc3cb4abd882f708ab80eb') {
        console.log('Wrong prop supplied. Are you sure you know what you are doing? There is no use to');
        return;
    }

//    var pkg = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
//    console.log('' + pkg);
//    var arr = pkg.version.split('.');
//    arr.push(parseInt(arr.pop()) + 1);
//    pkg.version = arr.join('.');
//    fs.writeFileSync(pkgJson, JSON.stringify(pkg, null, 2));
//
//    var command = ['git commit package.json -m"update version to ' + pkg.version + '"',
//                   'git push',
//                   'git tag "' + pkg.version + '"',
//                   'git push --tags'].join(' && ');
//    console.log(command);
////var done = this.async();
//    require('child_process').exec(command, function (err, stdout, stderr) {
//        if (err) {
//            console.log('releasing version failed ' + err, err);
//        } else {
//            console.log('output ' + stdout + stderr);
//            console.log('releasing version ' + pkg.version);
////        done();
//        }
//    });

    var command = ['npm version patch -m"update version to %s"',
                   'git push',
                   'git push --tags'].join(' && ');
    console.log(command);
    var done = this.async();
    require('child_process').exec(command, function(err, stdout, stderr) {
        if (err) {
            console.log('releasing version failed ' + err, err);
        } else {
            console.log('output ' + stdout + stderr);
            console.log('releasing version');
        }
        done();
    });
}


exec(process.argv.slice(2));
