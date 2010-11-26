<!DOCTYPE html>
<!--
 * (c) 2010 Ivan Vucica
 * License is located in the LICENSE file
 * in Z-XMPP distribution/repository.
 * Use not complying to those terms is a
 * violation of various national and
 * international copyright laws.
-->

<html>
<head>
<title>Z-XMPP</title>

<link href="application.css" rel="stylesheet" type="text/css">

<!--<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js"></script>-->
<script src="jquery.min.js"></script>
<script src="deepCopy.js"></script>

<?php
// while you could manually list all required scripts,
// to facilitate easier upgrade, you should prefer using
// scriptlist.php which returns list of scripts as a handy
// php array. 
//
// if you don't use php, then just add the script references
// manually.
//
// for default GUI, there's also a list of stylesheets that
// need to be included.
require_once 'scriptlist.php';
$zxp = "./"; // zxmpp path, including trailing slash
foreach(zxmppGetStylesheets() as $fn)
{
	echo '<link href="' . $zxp . $fn . '" rel="stylesheet" type="text/css">' . "\n";
}

foreach(zxmppGetAllScripts() as $fn)
{
	echo '<script type="text/javascript" src="' . $zxp . $fn . '"></script>' . "\n";
}

?>
</head>
<body onunload="unloadhandler();" onload="loadhandler();">
<div id="zxmpp_root"></div>

<a href="?a=<?=$_GET["a"] ? int($_GET["a"])+1 : ""?>">advance</a><br>

<input id="usr" value="perica"><input type="password" id="pwd" value="123">

<button onclick="go();">go</button>
<button onclick="dumppresences();">dump presences</button>
<button onclick="dumpstreamfeatures();">dump stream features</button>
<button onclick="logoff();">logoff</button>
<button onclick="serialize();">serialize</button>
<button onclick="reserialize();">reserialize</button>
<button onclick="restore();">restore</button>
<button onclick="terminate();">unclean terminate</button>
<textarea cols="80" rows="15" id="serialized_output"></textarea>
<script defer="defer">
var zxmpp;
function createzxmpp()
{
	var zatecfg = {
		"bind-url": "punjab-bind", //"z-http-bind/",
		"route": "xmpp:zatemas.zrs.hr:5222",
		"domain": "zatemas.zrs.hr"
	};
	var relativecfg = {
		"bind-url": "http-bind/",
		"route": "xmpp:" + window.location.hostname + ":5222",
		"domain": window.location.hostname
	};
	var gtalkcfg = {
		"bind-url": "punjab-bind/",
		"route": "xmpp:talk.google.com:5222",
		"domain": "gmail.com"
	}
	var cfg = relativecfg;

	zxmpp = new zxmppClass();
	zxmpp.onConnectionTerminate.push(handler_connectionterminate);
	zxmpp.onPresenceUpdate.push(handler_presenceupdate);
	zxmpp.onRosterUpdate.push(handler_rosterupdate);
	zxmpp.onMessage.push(handler_message);

	window.zxmppui = new zxmpp.ui;
	window.zxmppui.backend = zxmpp;
	window.zxmppui.inject('body');
	
	return cfg;
}

function go()
{
	var cfg = createzxmpp();
	zxmpp.main(cfg, document.getElementById("usr").value, document.getElementById("pwd").value);
	//var pack = new zxmpp.packet(zxmpp);



}
function restore()
{
	createzxmpp();
	zxmpp.deserialize(document.getElementById("serialized_output").value);
}

function unloadhandler()
{
	if(window.sessionStorage)
	{
		if(zxmpp) window.sessionStorage["zxmpp"] = zxmpp.serialized();
		else {
			window.sessionStorage["zxmpp"] = undefined;
			delete window.sessionStorage["zxmpp"];
		}
	}
}
function loadhandler()
{
	if(window.sessionStorage)
	{
		if(window.sessionStorage["zxmpp"] && window.sessionStorage["zxmpp"]!="undefined")
		{
			createzxmpp();
			zxmpp.deserialize(window.sessionStorage["zxmpp"]);
			return;
		}
		//go();
	}
	else
	{
		console.log("No session storage");
	}
}
function terminate()
{
	zxmpp.stream.terminate();
}
function dumppresences()
{
	zxmpp._debugDumpPresences();
}
function dumpstreamfeatures()
{
	zxmpp._debugDumpStreamFeatures();
}


function logoff()
{
	try {
		zxmpp.stream.logoff();
	} catch(e) { }
	zxmpp = undefined;
}

function serialize()
{
	if(zxmpp)
		document.getElementById("serialized_output").value = zxmpp.util.prettyJson(zxmpp.serialized());
}
function reserialize()
{
	document.getElementById("serialized_output").value = zxmpp.util.prettyJson(JSON.stringify(zxmpp.deserializeInternal(document.getElementById("serialized_output").value)));
}

function handler_connectionterminate(sender, code, humanreadable)
{
	codesplit=code.split("/");
	switch(codesplit[0])
	{
		case "terminate":
		switch(codesplit[1])
		{
			default:
			alert("Server-side termination with code \'" + code + "\'\n\n" + humanreadable);
			break;
		}
		break;
		
		case "saslfailure":
		switch(codesplit[1])
		{
			case "not-authorized":
			alert("Wrong username or password!\n\n" + humanreadable);
			break;
			
			default:
			alert("Login error with code \'" + code + "\'\n\n" + humanreadable);

		}
		break;
		
		default:
		alert("Termination with code \'" + code + "\'\n\n" + humanreadable);
		break;
	}
}
function handler_presenceupdate(sender, presence)
{
/*	console.log("INDEX.PHP: Presence update: ");
	console.log(" -> " + presence.fullJid);
	console.log("   Icon: " + presence.show);
	console.log("   Status: " + presence.status);
*/

	var toppresence = sender.getTopPresenceForBareJid(presence.bareJid);
	if(toppresence)
	{
		//console.log("Updating " + toppresence.bareJid);
		zxmppui.presenceUpdate(toppresence.bareJid, toppresence.show, false, toppresence.status);
	}
}
function handler_rosterupdate(sender, item)
{
/*	console.log("INDEX.PHP: Roster update: ");
	console.log(" -> " + item.bareJid);
	console.log("   Subscription: " + item.subscription); 
	console.log("   Groups:");

	for(var i in item.groups)
	{
		console.log("     " + item.groups[i]);
	}
	*/
	var presence = sender.getTopPresenceForBareJid(item.bareJid);
/*	if(presence)
	{
		console.log("Presence icon: " + presence.show);
	}
*/
	if(item.subscription != "removed" && item.subscription != "none")
	{
		zxmppui.rosterAdded(item.bareJid, presence ? presence.show : "unavailable", item.name ? item.name : item.bareJid, presence ? presence.status : "");
		
	}
	else
	{
		zxmppui.rosterRemoved(item.bareJid);
	}
}
function handler_message(sender, messagestanza)
{
	console.log("> " + messagestanza.from + ": " + messagestanza.body);
	if(messagestanza.body)
		zxmppui.messageReceived(messagestanza.from, messagestanza.body);
}
//go();
</script>
</body>
</html>
