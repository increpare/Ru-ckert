#! /usr/bin/env node

var fs = require('fs')
var path = require('path')
var RSS = require('rss')
var striptags = require('striptags');
var getSlug = require('speakingurl');
var colorConvert = require('color-convert');
var exec = require('child_process').execSync
var execAsync = require('child_process').exec
var SpellChecker = require('spellchecker')


exec("rm -rf output")
exec("mkdir output")

var trace = console.log

var content = fs.readFileSync('poems.txt','utf8')
var indextemplate = fs.readFileSync('index.template.html','utf8')
var pagetemplate = fs.readFileSync('page.template.html','utf8')

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



function generatePage(title,i){
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
			poemtable+=`<tr><td class="poemtitle">${poem_de[j]}</td><td class="poemtitle">${poem_en[j]}</td></tr>\n`
		} else {
			poemtable+=`<tr><td>${poem_de[j]}</td><td>${poem_en[j]}</td></tr>\n`			
		}
	}

	poemtable+="</table>"
	var previous="";
	var next="";

	if (i>0){
		var link_title = titles_en[i-1];
		previous = titleToPagename(link_title);
	}

	if (i<titles_en.length-1){
		var link_title = titles_en[i+1];
		next = titleToPagename(link_title);
	}

	var links=`<a href="${previous}">&lt;previous</a> - <a href="index.html">index</a> - <a href="${next}">next&gt;</a>`;	

	if (previous===""){
		var links=`<a href="${previous}" style="display:none;">&lt; previous</a> <span style="display:none;">-</span> <a href="index.html">index</a> - <a href="${next}">next &gt;</a>`;	
	} else if (next===""){
		var links=`<a href="${previous}">&lt; previous</a> - <a href="index.html">index</a> <span style="display:none;">-</span> <a href="${next}" style="display:none;"">next &gt;</a>`;			
	}
	var result = eval('`'+pagetemplate+'`');
	return result;
}

function titleToPagename(title){
	var safeName = getSlug(title)
	var pageName = tag_to_urlsafe(safeName)+".html";
	return pageName
}

function replaceIndentation(poem){
	for (var i=0;i<poem.length;i++){
		if (poem[i][0]===" "||poem[i][0]==="\t"){
			poem[i]='&emsp;&emsp;'+poem[i].trim();
		}
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
 	
	lines = poem.split("\n")
 	trimEmptyentries(lines)

 	//find mid-point
 	//var splitPoint = poem.indexOf("\n\n\n")
 	//if (splitPoint===-1){
 		var l = lines.length;
 		var halfway=Math.floor(lines.length/2);
 		splitPoint=halfway;
 	//}


	var poem_en=lines.slice(0,splitPoint)
	var poem_de = lines.slice(splitPoint);

	trimEmptyentries(poem_en)
	trimEmptyentries(poem_de)

	//spellcheck code. too many false positives so just uncomment every now and then to check
	// for(var j=0;j<poem_en.length;j++){
	// 	var errors = SpellChecker.checkSpelling(poem_en[j]);
	// 	if (errors.length>0){
	// 		console.log("SPELLCHECK ERROR " + poem_en[j])

	// 		for( var k=0;k<errors.length;k++){
	// 			console.log("\t" + poem_en[j].substr(errors[k].start,errors[k].end));
	// 		}
	// 	}
	// }

	replaceIndentation(poem_en)
	replaceIndentation(poem_de)


	if (poem_en.length!=poem_de.length){
		console.log(poem_en[0])
	}
	titles_en.push(poem_en[0])

	titles_de.push(poem_de[0])

 	poems_en.push(poem_en);
 	poems_de.push(poem_de); 	
 }


for (var i=0;i<titles_en.length;i++) {
	var t = titles_en[i];
	var page = generatePage(titles_en[i],i);
	var relativepath = "output/"+titleToPagename(t);
	fs.writeFileSync(relativepath,page)/*, function(err) {
	    if(err) return console.log("ER " +err);
	    gzipFile( relativepath )
		});*/
}

function generateIndexPage(){

	var links = "<ol>";
	for (var i=0;i<titles_en.length;i++) {
		var t = titles_en[i];
		var slug = titleToPagename(t);
		links+=`<li><a class="indexLink" title="${t}" href="${slug}">${t}</a>\n`;
	}
	links+="</ol>"

	var result = eval('`'+indextemplate+'`');
	return result;
}

var indexPage = generateIndexPage();
fs.writeFileSync("output/index.html",indexPage)/*, function(err) {
	    if(err) return console.log("ER " +err);
	    gzipFile( relativepath )
		});*/
// console.log(`found midpoint of poem of length ${poem.length} at point ${splitPoint}.`)


