<!DOCTYPE html>
<!--
 * (c) 2010 Ivan Vucica
 * License is located in the LICENSE file
 * in Z-XMPP distribution/repository.
 * Use not complying to those terms is a
 * violation of various national and
 * international copyright laws.
-->

<!--
This example is NOT the perfect way to use Z-XMPP, and it in fact uses some
pretty nasty JS code. It is a hack that was created for development purposes.

It should give you the idea of what you can do and where to get started with
Z-XMPP.

I suggest you start looking at the onload handler, the function 'loadhandler()'.
-->

<html>
<head>
<title>Z-XMPP</title>

<link href="application.css" rel="stylesheet" type="text/css">

<!--<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js"></script>-->

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
<button onclick="enablenotifications();" style="display: none;" id="notificationsbtn">enable webkit notifications</button>
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
		if(zxmpp && zxmpp.stream && zxmpp.stream.hasFullConnection) 
		{
			window.sessionStorage["zxmpp"] = zxmpp.serialized();
		}
		else {
			window.sessionStorage["zxmpp"] = undefined;
			delete window.sessionStorage["zxmpp"];
		}
	}
}
function loadhandler()
{
	// by delaying load slightly, we are preventing continuous
	// "loading" display on some browsers such as safari
	setTimeout(function(){loadhandler_delayed();}, 1);
}
function loadhandler_delayed()
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

function enablenotifications()
{
	if(!window.webkitNotifications)
		return;

	// this enables html5 notifications as per 
        //  http://www.html5rocks.com/tutorials/notifications/quick/
	// this function is called from a button handler; above url
	// doesn't want implementations to provide notification
	// api enabled from anything but user input handlers.
	// (chrome does allow you to enable this if you create
	//  a "chrome app" an request permission in manifest file)

	if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
		// all is well, nothing to do except hide btn
		document.getElementById('notificationsbtn').style.display = 'none';
	} else {
		window.webkitNotifications.requestPermission();
	}
}

function shownotification(icon, title, msg)
{
	if(!window.webkitNotifications)
		return;
	if (window.webkitNotifications.checkPermission() == 0) // 0 is PERMISSION_ALLOWED
	{
		// all is well
	}
	else
	{
		// user must enable notifications by clicking a button
		// (otherwise notification permission request won't work)
		// it might be a good idea to display htem a dialog; here we won't :)
		document.getElementById('notificationsbtn').style.display = 'inherit';
		return;
	}

	if(!icon)
		icon = zxmpplogo;

        var popup = window.webkitNotifications.createNotification(icon, title, msg);
        popup.show();
	setTimeout(function(popup)
		{
			popup.cancel(); 
		}, 2000, popup);

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
			shownotification(undefined, "Connection terminated", "Server has disconnected you with code \'" + code + "\'\n\n" + humanreadable);
			alert("Server has disconnected you with code \'" + code + "\'\n\n" + humanreadable);
			break;
		}
		break;
		
		case "saslfailure":
		switch(codesplit[1])
		{
			case "not-authorized":
			shownotification(undefined, "Connection terminated", "Wrong username or password!\n\n" + humanreadable);
			alert("Wrong username or password!\n\n" + humanreadable);
			break;
			
			case "account-disabled":
			shownotification(undefined, "Connection terminated", "Your account has been disabled!\n\n" + humanreadable);
			alert("Your account has been disabled!\n\n" + humanreadable);
			break;

			default:
			shownotification(undefined, "Connection terminated", "Login error with code \'" + code + "\'\n\n" + humanreadable);
			alert("Login error with code \'" + code + "\'\n\n" + humanreadable);
		}
		break;
		
		default:
		shownotification(undefined, "Connection terminated", "Termination with code \'" + code + "\'\n\n" + humanreadable);
		alert("Termination with code \'" + code + "\'\n\n" + humanreadable);
		break;
	}
	window.sessionStorage["zxmpp"] = undefined;
	delete window.sessionStorage["zxmpp"];
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
	
	if(presence.show == "avail")
		shownotification(undefined, presence.fullJid + " is now online", presence.status);
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
		var presenceShow = presence ? presence.show : "unavailable";
		var display = item.name ? item.name : item.bareJid.split('@')[0];
		var presenceStatus = presence ? presence.status : "";

		var vcard = sender.vCards[item.bareJid];
		if(vcard && vcard.fn)
			display = vcard.fn;

		zxmppui.rosterAdded(item.bareJid, presenceShow, display, presenceStatus);
		
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
	{
		var text = messagestanza.body;
		if(messagestanza.type == "error")
			text = "ERROR with message: " + text;
		shownotification(undefined, messagestanza.from, text);
	}

	zxmppui.messageStanzaReceived(messagestanza);
}

// for use in notifications:
var zxmpplogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACx'+
'jwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAQdJREFU'+
'SEvdlUkShSAMRPk39+bKXAnpII3F5lusNPbLzO++73D0iYCjTziqntLzL4AQK7122IhTihaluxnF'+
'2AGEi6hcNeWC2ACkRF0BHFsYRv29TcfIshN0DbwfvqvPIgBVQb4Xs0lM+BtUt8mRZgOjgwFgUX0Y'+
'IAnQChq9rm4ntCu5AEodrgD0UkQA22belwsT2gAb6nU8J1syzo2TOHe52o50gyirgQXYrseANvOq'+
'TRcSmiMTEzf5pbiuASmityPW0asxWBV4p+pF21wzrmD/qN3otVzOWz1jDniAN48O4ztAVqW2pswe'+
'D1D7wFxBKlFyDlhQTwj8sXydXTgsz7PnLtgN6nHAA0wtfhnz+3TSAAAAAElFTkSuQmCC';

//go();
</script>
</body>
</html>
