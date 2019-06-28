
const fs = require('fs');
const path = require('path');
const changeCase = require('change-case')
const replace = require('replace-in-file');
// let changeCase = require('change-case')
let walkPath = './components';
const config = {
    case:'snake',
    level:'sub',//sub
    findandreplaceusage:true,
    replaceCasesInFiles:false,
    ignore:['node_modules','gitkeep']
}

let renamed=[]
let fileList=[]
function getStats(path,name) {
    let stat = fs.statSync(path+'/'+name)
    stat.path=path
    stat.name=name
    return stat
}
//using synchronous fns so we can build a full list including nested files
function walk (dir) {
    let list = fs.readdirSync(dir)
    for (let i = 0; i < list.length; i++) {
        // console.log(list[i])
        let stat = getStats(dir, list[i])
        if (stat && stat.isDirectory() && config.level !== 'top') {
            walk(stat.path + '/' + stat.name);
        } else {

            let filePath = stat.path + '/' + stat.name
            let fileName = path.basename(stat.name, path.extname(stat.name))
            let extention = path.extname(stat.name)
            if (!stat.name && config.ignore.includes(stat.name)) {
                return
            }
            let newFileName = ''
            let toPath = ''

            switch (config.case) {
                case 'camel':
                    newFileName = changeCase.camelCase(fileName)

                    break
                case 'snake':
                    newFileName = changeCase.snakeCase(fileName)

                    break
            }
            toPath = path.join(stat.path, newFileName + extention);
            fs.renameSync(filePath, toPath)

            renamed.push({oldName: fileName, newName: newFileName})
            fileList.push(toPath)
            //find occurrences of renamed in files if only replace filenames is opted
            console.log("Renamed file '%s' to '%s'.", stat.name, newFileName);


        }
    }
}

function replaceInFiles() {
    console.log(renamed)
    replace({
        files: fileList,
        from: renamed.map(names => new RegExp(names.oldName,'g')),
        to: renamed.map(names => names.newName),
        countMatches:true
    }).then(results => {
        console.log('Replacement results:', results);
    }).catch(error => {
            console.error('Error occurred:', error);
        });
}
// optional command line params
//      source for walk path
// process.argv.forEach(function (val, index, array) {
//     if (val.indexOf('source') !== -1) {
//         walkPath = val.split('=')[1];
//     }
// });

console.log('-------------------------------------------------------------');
console.log('processing...');
console.log('-------------------------------------------------------------');

walk(walkPath);
console.log('-------------------------------------------------------------');
console.log('done renaming files...');
console.log('-------------------------------------------------------------');

if(config.findandreplaceusage) {
    console.log('-------------------------------------------------------------');
    console.log('renaming in files...');
    console.log('-------------------------------------------------------------');

    replaceInFiles()
}
