var path = require('path'),
	fs = require('fs'),
	readline = require('readline')

var scaffoldsDir = __dirname + path.sep + 'scaffolds'

function error(err){
	throw new Error(err)
	process.exit()
}

function checkArg(arg, type) {
	if (typeof arg === 'undefined'){
		return false
	}
	if (typeof arg === type){
		return arg
	} else {
		error("Argument: " + arg + " is not of type: " + type)
	}
}
	
function addScaffold(newScaffoldPath, cb){ // copy the scaffold into the /scaffolds/ directory for easy scaffold building in the future
	checkArg(newScaffoldPath, 'string')
	checkArg(cb, 'function')
	var name = path.parse(newScaffoldPath).base
	var scaffoldPath = scaffoldsDir + path.sep + name
	var rd = fs.createReadStream(newScaffoldPath)
	rd.on("error", function(err) {
		error(err)
	})
	
	var wr = fs.createWriteStream(scaffoldPath)
	wr.on("error", function(err) {
		error(err)
	})
	wr.on("close", function(ex) {
		console.log("Scaffold " + name + " added")
		cb(scaffoldPath) // returns the path to the newly created scaffold
	})
	rd.pipe(wr)
}

function findScaffold(scaffoldName, dir, cb){ // returns the location of the scaffold to the callback
	checkArg(scaffoldName, 'string')
	checkArg(dir, 'string')
	checkArg(cb, 'function')
	
	dir = dir || __dirname + path.sep + 'scaffolds' // all should be installed in /scaffolds/
	var pName = path.parse(scaffoldName).name // removes .json if it was supplied
	var possib = []
	var perfectMatch
	
	fs.readdir(dir, function(err, files){
		if (err) error(err)
		files.forEach(function(file){
			var fName = path.parse(file).name
			if (path.parse(file).ext == '.json'){
				if (fName === pName){
					perfectMatch = true
					console.log('\r\nScaffold "' + scaffoldName + '" found')
					cb(dir + path.sep + file)
				} else if (fName.toUpperCase().indexOf(pName.toUpperCase()) > -1 || pName.toUpperCase().indexOf(fName.toUpperCase()) > -1){
					possib.push(fName)
				}
			} else {
				// not a .json scaffold
			}
			
		})
		if (possib.length > 0 && !perfectMatch){
			console.log('Possible Matches: ', possib)
		} else if (!perfectMatch) {
			console.log('No scaffold \"' + scaffoldName + '" found')
		}
	})
}

function loadScaffoldFromFile(filePath, cb){
	checkArg(filePath, 'string')
	checkArg(cb, 'function')
	
	fs.readFile(filePath, function(err, data){
		if (err) error(err)
		try {
			data = JSON.parse(data)
			cb(data)
		} catch (e){
			console.log(e)
		}
	})
}
function buildScaffold(info, dir, nocontent, cb){ // info is the JSON data

	checkArg(info, 'object')
	checkArg(cb, 'function')
	
	dir = checkArg(dir, 'string') || process.cwd()
	nocontent = checkArg(nocontent, 'boolean') || false
	var vars = {}
	if (info.vars){
		console.log('\r\nVariables:\r\n')
		var complete = 0
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		})
		for (var variable in info.vars){
			complete++
			if (info.vars[variable].content){
				vars[variable] = info.vars[variable].content
			}
			if (info.vars[variable].prompt){ // prompt is needed, overides anything set by content
				rl.question(info.vars[variable].prompt, (answer) => {
					vars[variable] = answer
					if (Object.keys(info.vars).length === complete){
						rl.close()
						writeFiles()
					}
				})
				//vars[variable] = prm(String(variable + ' (' + info.vars[variable].prompt + '): '), String(info.vars[variable].prompt))// do the prompt here, make it sync
				// doesnt pick up enter on first try
			}
		}
	} else {
		// no vars specified
		writeFiles()
	}
	function writeFiles(){
		var complete = 0
		if (info.files){
			for (var file in info.files){
				if (info.files[file].files){ // a folder
					complete++
					fs.mkdir(dir + path.sep + file, function(err){
						if (err && err.code !== "EEXIST"){
							error(err)
						} else {
							buildScaffold(info.files[file], dir + path.sep + file, nocontent, ()=>{})
						}
					})
				} else {
					var content = info.files[file].content || ''
					if (Object.keys(vars).length > 0){
						for (var variable in vars){ // replace all the vars
							content = content.replace(new RegExp('%%' + variable + '%%', 'g'), vars[variable])
						}
					}
					fs.writeFile(dir + path.sep + file, (!nocontent)?content:'', function(err){
						if (err) error(err)
						complete++
						if (Object.keys(info.files).length === complete){ // last file has been written
							cb()
						}
					})
				}
	
	
			}
		} else {
			console.log('No files specified or incorrect configuration')
			cb()
		}
	}
}

function createScaffoldData(dir, vars, nocontent, cb){ // vars should be an object, scaffold data is returned to cb
	dir = checkArg(dir, 'string') || process.cwd()
	vars = checkArg(vars, 'object') || {}
	nocontent = checkArg(nocontent, 'boolean') || false
	checkArg(cb, 'function')
	
	var scaffold = {"files":{}} // scaffold object
	if (Object.keys(vars).length > 0){
		console.log(scaffold)
		scaffold["vars"] = vars
	}
	var complete = 0
	
	fs.readdir(dir, function(err, files){
		var checkIfLast = function(c){
			if (c == files.length-1 || c == -1){ // when c -1 no files are present
				cb(scaffold) // if its the last file trigger callback
			}
		}
		if (err) error(err)
		if (files.length > 0){
			files.forEach(function(file){
				fs.stat(dir + path.sep + file, function(err, stats){
					if (err) error(err)
					if (stats.isDirectory()){ // a folder
						createScaffoldData(dir + path.sep + file, {}, nocontent, function(data){
							scaffold.files[file] = data
							checkIfLast(complete++)
						})
					} else {
						fs.readFile(dir + path.sep + file, 'utf8', function(err, data){
							if (err) error(err)
							scaffold.files[file] = {"content" : ((!nocontent)?data:"")}
							checkIfLast(complete++)
						})
					}
				})
			})
		} else {
			checkIfLast(-1) // no files so say its done
			console.log('\r\nDirectory ' + dir + ' is empty')
		}
	})
}

function makeScaffoldFile(name, data, dir, cb){
	checkArg(name, 'string')
	checkArg(data, 'object')
	checkArg(cb, 'function')
	
	dir = checkArg(dir, 'string') || (__dirname + path.sep + 'scaffolds') // should
	fs.writeFile(dir + path.sep + name + '.json', JSON.stringify(data), function(err){
		if (err) error(err)
		cb()
	})
}

module.exports.createScaffoldData = createScaffoldData
module.exports.makeScaffoldFile = makeScaffoldFile
module.exports.addScaffold = addScaffold
module.exports.findScaffold = findScaffold
module.exports.loadScaffoldFromFile = loadScaffoldFromFile
module.exports.buildScaffold = buildScaffold