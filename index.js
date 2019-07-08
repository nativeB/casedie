
const fs= require('fs');
const path = require('path');
const changeCase = require('change-case')
const replace = require('replace-in-file');

class Pacman {
    constructor(options){
        this.options = options
        this.fileList = []
        this.innerDirList = []
        if(this.options.renameFiles){
            this.renameFiles(null,this.buildDirectory(this.options.path,null,0),null, null)
        }
    }
    //resorting to sync fns
    //be using glob soon
    buildDirectory(path,cb,level){
        level++
        // console.log(level)
        try {
           let dir = fs.readdirSync(path)
           // if(typeof  cb === 'function')cb(dir)
           if(this.options.deep) {
               for (let i = 0; i < dir.length; i++) {
                   let stat = this.getStats(path, dir[i])
                       if (stat && stat.isDirectory()) {
                       // console.log('found')
                            this.innerDirList.push(stat.dir + '/' + stat.name)
                           this.buildDirectory(stat.dir + '/' + stat.name, null, level)
                       } else {
                            this.fileList.push({dirPath:stat.dir,fileName: stat.name})
                           // cb?cb(stat.dir, stat.name) : Pacman.log('found file', dir[i], 'in', stat.dir,level)

                       }

               }
           }
            level--
           if(level===0) {
               return cb?cb(this.fileList): this.fileList
           }
        }catch(e) {
            return Pacman.err(e)
       }

                   // if (stat && stat.isDirectory() && config.level !== 'top') {
                   //     walk(stat.path + '/' + stat.name);
                   // } else {
                   //     this.dirList.push(stat.path + '/' + stat.name)
                   // }
               // }
           // }
       // })
    }
    renameFiles(casetouse,files,dirpath,cb){
        // if(!files)
        let filesList=files||this.buildDirectory(this.options.path||dirpath,null,0)
        let newFileName = ''
        let toPath = ''
        let fromPath, fileName, extention
        filesList.forEach(file =>{
            fromPath= file.dirPath + '/' + file.fileName
            fileName = path.basename(file.fileName, path.extname(file.fileName))
            extention = path.extname(file.fileName)
            let casing = casetouse||this.options.case
            // console.log(casing)
            switch (casing) {
                case 'camel':
                    newFileName = changeCase.camelCase(fileName)

                    break
                case 'snake':
                    newFileName = changeCase.snakeCase(fileName)
                    break
                default:
                    // console.log('error')
                    break
            }
            if(newFileName) {
                toPath = path.join(file.dirPath, newFileName + extention);
                // console.log(toPath)
                fs.renameSync(fromPath, toPath)
                file.toPath= toPath
                file.newFileName=newFileName
                file.fileName=fileName
                file.extention=extention
                file.case=this.options.case
            }

        })
        if(this.options.replaceInFiles)
            this.replaceInFiles(filesList)
        else if(this.options.cb) this.options.cb(filesList)
        else if(cb) cb()
        else Pacman.log(filesList)

    }
    //prefer to use promise here
    replaceInFiles(fileList,cb) {
        console.log(fileList)
        replace({
            files: fileList.map(file=> file.toPath),
            from: fileList.map(file => new RegExp(file.fileName,'g')),
            to: fileList.map(file => file.newFileName),
            countMatches:true
        }).then(results => {
            for(let i = 0; i <results.length;i++)fileList[i]={...fileList[i],...results[i]}
        if(this.options.cb) this.options.cb(fileList)
            else if(cb) cb()
        }).catch(error => {
            console.error('Error occurred:', error);
        });
    }
    replaceOccurrencesInFiles(){

    }
    logError(){

    }
    static log(){
    console.log(...arguments)
    }
    getStats(dir,name){
        try {
            let stat = fs.statSync(dir + '/' + name)
            stat.dir =dir
            stat.name=name
            return stat
        }catch(e){
            Pacman.err(e)
        }
    }
    static err(err){
        throw new Error(err)
    }

}

// let pac= new Pacman({path:'./components',deep:true,renameFiles:true,case:'camel',replaceInFiles:true,cb:(files)=>{console.log('this renamed',files)}})
