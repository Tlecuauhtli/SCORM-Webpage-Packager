const glob = require("glob");
const fs = require('fs');
const JSZip = require('jszip');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var
    listOfFiles = "";
var getDirectories = function(src, callback) {
    glob(src + '/**/*.*', callback);
};
rl.question('Title: ', function(title = "Titulo") {
    rl.question('Save location / name: ', function(save = "scorm") {
        rl.question('Author: ', function(author = "Author") {
            getDirectories('./scorm/res', function(err, res) {
                if (err) {
                    console.log('Error', err);
                } else {
                    save = save + ".zip";
                    res.forEach(f => {
                        let fp = "<file href=\" " + f + " \"/>\n";
                        fp = fp.replace('./scorm/', '');
                        listOfFiles = listOfFiles + fp;
                    });
                    fs.copyFile("imsmanifest_template.xml", "./scorm/imsmanifest.xml", (err) => {
                        if (err) {
                            console.log("Error Found:", err);
                        }
                        fs.readFile("./scorm/imsmanifest.xml", 'utf8', function(err, data) {
                            if (err) {
                                return console.log(err);
                            }
                            var result = data.replace(/(-- title --)+/g, title);
                            result = result.replace(/(-- Author --)+/g, author);
                            result = result.replace(/(-- files --)+/g, listOfFiles);
                            fs.writeFile("./scorm/imsmanifest.xml", result, 'utf8', function(err) {
                                if (err) return console.log(err);
                                getDirectories('./scorm', function(err, filescorm) {
                                    if (err) {
                                        console.log('Error', err);
                                    } else {
                                        const zip = new JSZip();
                                        for (let i = 0; i < filescorm.length; i++) {
                                            let dataF = fs.readFileSync(filescorm[i]);
                                            var nd = filescorm[i].replace('./scorm/', '');
                                            zip.file(nd, dataF);

                                        }
                                        zip
                                            .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                                            .pipe(fs.createWriteStream(save));
                                    }
                                });
                            });
                        });
                    });
                }
            });
        })
    });
});