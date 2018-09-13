#!/usr/bin/env node
const fs = require("fs");
let program = require("commander");
let minimatch = require("minimatch").Minimatch;

let print0Array = [];

program
  .arguments("<path>")
  .option("-n, --name <pattern>", "A glob pattern to match")
  .option("-r, --regex <pattern>", "A regex pattern to match")
  //Consider adding a flag to set using glob AND regex vs glob OR regex, right now it default to AND.
  //.option("-L, --list", "Find and follow symbolic links") Would require research based on cursory testing
  .option("-e, --empty", "Only print files that are empty")
  .option("-m, --maxdepth <depth>", "Maximum recursion depth")
  .option("-p, --print0", "Prints as null termniated string")
  .option("--delete", "deletes the returned files")
  .option("--delete-silent", "silently delete the returned files")
  .action((path, options) => {
    //console.log(options);
    if (fs.existsSync(path)) {
      let opts = getOpts(options);
      findRecursiveSync(path, opts, 1);
      if (opts.print0) {
        console.log(print0Array.join("\0"));
      }
      if (opts.delete || opts.deleteSilent) {
        print0Array.forEach(file => {
          fs.unlink(file, err => {
            if (err) {
              console.log(err);
            } else {
              if (!opts.deleteSilent) console.log(`${file} was deleted`);
            }
          });
        });
      }
    } else {
      console.log("nodefind: '" + path + "': No such file or directory");
    }
  })
  .parse(process.argv);

if (!program.args.length) {
  let opts = getOpts(program);
  findRecursiveSync(".", opts, 1);
  if (opts.print0) {
    console.log(print0Array.join("\0"));
  }
  if (opts.delete || opts.deleteSilent) {
    print0Array.forEach(file => {
      fs.unlink(file, err => {
        if (err) {
          console.log(err);
        } else {
          if (!opts.deleteSilent) console.log(`${file} was deleted`);
        }
      });
    });
  }
}

function getOpts(program) {
  let opts = {};
  //console.log(program);
  if (program.hasOwnProperty("name")) {
    opts.pattern = new minimatch(program.name, { matchBase: true });
  }
  if (program.empty) {
    opts.empty = program.empty;
  }
  if (program.list) {
    opts.list = program.list;
  }
  if (program.maxdepth) {
    opts.maxdepth = program.maxdepth;
  }
  if (program.regex) {
    opts.regex = new RegExp(program.regex);
  }
  if (program.print0) {
    opts.print0 = program.print0;
  }
  if (program.delete) {
    opts.delete = program.delete;
  }
  if (program.deleteSilent) {
    opts.deleteSilent = program.deleteSilent;
  }
  return opts;
}

function findRecursiveSync(dir, opts, depth) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    if ((err.errno = -4052)) {
      return console.log(
        `nodefind: ${dir}: The specified starting path is not a directory`
      );
    }
    return console.log(err);
  }
  if (opts && (opts.pattern || opts.regex)) {
    checkAndPrint(dir, opts);
  } else {
    if (!opts.empty) {
      if (opts.print0 || opts.delete || opts.deleteSilent) {
        print0Array.push(dir);
      } else {
        console.log(dir);
      }
    }
  }
  files.forEach(file => {
    let fstat;
    try {
      fstat = fs.statSync(dir + "/" + file);
    } catch (err) {
      return;
    }
    if (fstat.isSymbolicLink()) {
      console.log(`*** *** ${dir}/${file} is Sym link`);
    }
    if (fstat.isDirectory()) {
      if (opts && opts.maxdepth) {
        if (depth < opts.maxdepth) {
          findRecursiveSync(dir + "/" + file, opts, depth + 1);
        } else {
          if (opts && (opts.pattern || opts.regex)) {
            checkAndPrint(dir + "/" + file, opts);
          } else {
            if (!opts.empty) {
              if (opts.print0 || opts.delete || opts.deleteSilent) {
                print0Array.push(dir + "/" + file);
              } else {
                console.log(dir + "/" + file);
              }
            }
          }
        }
      } else {
        findRecursiveSync(dir + "/" + file, opts, depth + 1);
      }
    } else {
      if (opts && opts.empty) {
        //console.log(fstat.size);
        if (fstat.size != 0) return;
      }
      if (opts && (opts.pattern || opts.regex)) {
        checkAndPrint(dir + "/" + file, opts);
      } else {
        if (opts.print0 || opts.delete || opts.deleteSilent) {
          print0Array.push(dir + "/" + file);
        } else {
          console.log(dir + "/" + file);
        }
      }
    }
  });
}

function checkAndPrint(str, opts) {
  let printIt = true;
  if (opts.pattern) {
    if (!opts.pattern.match(str.substring(2))) {
      printIt = false;
    }
  }
  if (opts.regex) {
    if (!(opts.regex.test(str) || opts.regex.test(str.substring(2)))) {
      printIt = false;
    }
  }
  if (printIt) {
    if (opts.print0 || opts.delete || opts.deleteSilent) {
      print0Array.push(str);
    } else {
      console.log(str);
    }
  }
}
