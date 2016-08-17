#!/usr/bin/env node
var broil = require('../broil.js'),
	path = require('path')
	
if (process.argv.length < 3) usage()
	
function usage(){
	console.log("\r\nusage: broil [--add] [--gen] [--no-content] scaffold");
	console.log("use broil --help for in depth instructions");
	process.exit()
}

function inDepth(){
	console.log("\r\nusage: broil [--add] [--gen] [--no-content] scaffold\r\n");
	console.log("Broil    -    a scaffold generator/manager\r\n");
	console.log("  [arg]            [description]");
	console.log("----------------------------------------------------------------");
	console.log("  --add          add a scaffold file to the global scaffold file");
	console.log("                 [EX] : broil --add newScaffold.json\r\n");
	console.log("  --gen          generate a scaffold from the current directory");
	console.log("                 and add to global scaffold file");
	console.log("                 [EX] : broil --gen nameOfNewScaffold\r\n");	
	console.log("  --no-content   use names of the files/folders, no content");
	console.log("                 can be used with [--add] or [--gen]");
	console.log("                 [EX] : broil --gen --no-content nameOfNewScaffold");
	console.log("                 [EX] : broil --add --no-content newScaffold.json\r\n");	
	console.log("  scaffold       the name of the scaffold to gen/add");
	console.log("                 can be scaffoldName or scaffoldName.json");
	console.log("                 [EX] : broil scaffoldName\r\n");
	console.log("  --help         show this dialog");
	console.log("                 [EX] : broil --help");
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
		if (arg == '--gen'){
			generate = true
		} else if (arg == "--no-content"){
			nocontent = true
		} else if (arg == '--add') {
			add = true
		} else if (arg == '--help') {
			inDepth();
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