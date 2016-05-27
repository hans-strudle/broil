#!/usr/bin/env node
var broil = require('../broil.js'),
	path = require('path')
	
if (process.argv.length < 3) usage()
	
function usage(){
	console.log("\r\nusage: broil [--add] [--gen] [--no-content] scaffold")
	process.exit()
}

var generate,
	nocontent,
	add,
	scaffoldName,
	dir = process.cwd()
process.argv.forEach(function(arg,ind){
	if (ind < 2) return // skip over [node.exe, cli.js]
	if (arg.trim().indexOf("-") == 0){
		if (arg == "--gen"){
			generate = true
		} else if (arg == "--no-content"){
			nocontent = true
		} else if (arg == '--add') {
			add = true
		} else {
			console.log("arg '" + arg + "' is not valid")
			usage()
		}
	} else if (!scaffoldName){ // scaffoldName isnt set
		scaffoldName = arg
	} else {
		console.log("Too many args, arg '" + arg + "' has been dropped")
	}
})

if (!scaffoldName){
	console.log("\r\nNo scaffoldName specified!")
	usage()
}

if (add){
	broil.addScaffold(scaffoldName, function(scaffoldPath){
		console.log('Scaffold "' + scaffoldName + '" added to /scaffolds/')
		console.log(scaffoldPath)
	})
} else if (generate){
	broil.createScaffoldData(dir, {}, nocontent, function(data){
		broil.makeScaffoldFile(scaffoldName, data, '', (e)=>{
			console.log('Scaffold ' + scaffoldName + ' Created')
		})
	})
} else {
	broil.findScaffold(scaffoldName, '', function(scaffoldPath){
		broil.loadScaffoldFromFile(scaffoldPath, function(data){
			broil.buildScaffold(data, dir, nocontent, function(e){
				console.log("Scaffold Completed")
			})
		})
	})
}