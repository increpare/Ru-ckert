#! /usr/bin/env node

var fs = require('fs')
var path = require('path')
var RSS = require('rss')
var striptags = require('striptags');
var getSlug = require('speakingurl');
var colorConvert = require('color-convert');
var exec = require('child_process').execSync
var execAsync = require('child_process').exec


exec("rm -rf output")
exec("mkdir output")

var trace = console.log

var content = fs.readFileSync('poems.txt','utf8')
var template = fs.readFileSync('index.template.html','utf8')

var poems = content.split(/---*/);

var poems_en = []
var poems_de = []

var titles_en = []
var titles_de = []

function gzipFile(path){
	execAsync(`gzip -cf  --best ${path} > ${path}.gz`)
}

function tag_to_urlsafe(desc){
	return getSlug(desc.split(" ")[0].toLowerCase(),{
	    custom: {'#':"sharp"}
	});
}



function generatePage(title,indexpage,i){
	/*template braucht
	 *
	 *	title
	 *	indexpage
	 *	leftpage
	 *	rightpage
	 */

	var poemtable = "<table>";
	var poem_de = poems_de[i];
	var poem_en = poems_en[i];

	for (var j=0;j<Math.min(poem_de.length,poem_en.length);j++){
		if (j===0){
			poemtable+=`<tr><td class="poemtitle">${poem_de[j]}</td><td class="poemtitle">${poem_en[j]}</td></tr>`
		} else {
			poemtable+=`<tr><td>${poem_de[j]}</td><td>${poem_en[j]}</td></tr>`			
		}
	}

	poemtable+="</table>"

	var result = eval('`'+template+'`');
	return result;
}

function titleToPagename(title){
	var safeName = getSlug(title)
	var pageName = tag_to_urlsafe(safeName)+".html";
	return pageName
}

function replaceIndentation(poem){
	for (var i=0;i<poem.length;i++){
		poem[i]=poem[i].replace(/^\s+/, '&emsp;');
	}
}
function trimEmptyentries(ar){
	for (var i=0;i<ar.length;i++){
		if (ar[0].trim()===""){
			ar.shift();			
		} else {
			break;
		}
	}
	for (var i=0;i<ar.length;i++){
		if (ar[ar.length-1].trim()===""){
			ar.pop();			
		} else {
			break;
		}
	}
}
 for (var i=0;i<poems.length;i++){
 	var poem = poems[i].trim();
 	poem = poem.replace(/\n[ \t\f\v]+/g,'\n')
	
	lines = poem.split("\n")
 	trimEmptyentries(lines)

 	//find mid-point
 	//var splitPoint = poem.indexOf("\n\n\n")
 	//if (splitPoint===-1){
 		var l = lines.length;
 		var halfway=Math.floor(lines.length/2);
 		splitPoint=halfway;
 	//}

	var title = titleToPagename;

	var poem_en=lines.slice(0,splitPoint)
	var poem_de = lines.slice(splitPoint);

	trimEmptyentries(poem_en)
	trimEmptyentries(poem_de)

	if (poem_en.length!=poem_de.length){
		console.log(poem_en[0])
	}
	titles_en.push(poem_en[0])

	titles_de.push(poem_de[0])

	replaceIndentation(poem_en)
	replaceIndentation(poem_de)

 	poems_en.push(poem_en);
 	poems_de.push(poem_de); 	
 }

var indexList_en = "";
for (var i=0;i<titles_en.length;i++) {
	var t = titles_en[i];
	var slug = titleToPagename(t);
	indexList_en+=`<a class="indexLink" title="${t}" href="${slug}">${t}</a><br>\n`;
}

for (var i=0;i<titles_en.length;i++) {
	var t = titles_en[i];
	var page = generatePage(titles_en[i],indexList_en,i);
	var relativepath = "output/"+titleToPagename(t);
	fs.writeFileSync(relativepath,page)/*, function(err) {
	    if(err) return console.log("ER " +err);
	    gzipFile( relativepath )
		});*/
}
// console.log(`found midpoint of poem of length ${poem.length} at point ${splitPoint}.`)


