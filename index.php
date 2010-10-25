<!DOCTYPE html>
<html>
<head>
<title>Z-XMPP</title>

<link href="application.css" rel="stylesheet" type="text/css">

<!--<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js"></script>-->
<script src="jquery.min.js"></script>
<script src="deepCopy.js"></script>

<script src="zxmpp_main.js"></script>
<script src="zxmpp_util.js"></script>
<script src="zxmpp_ui.js"></script>
<script src="zxmpp_stream.js"></script>
<script src="zxmpp_packet.js"></script>
<script src="zxmpp_presence.js"></script>
<script src="zxmpp_caps.js"></script>
<script src="zxmpp_itemroster.js"></script>

<script src="zxmpp_stanzaiq.js"></script>
<script src="zxmpp_stanzapresence.js"></script>
<script src="zxmpp_stanzastreamfeatures.js"></script>
<script src="zxmpp_stanzasaslresult.js"></script>
<script src="zxmpp_stanzamessage.js"></script>
</head>
<body>
<div id="zxmpp_root">Loading zxmpp</div>
<button onclick="go();">go</button>
<button onclick="dumppresences();">dump presences</button>
<button onclick="dumpstreamfeatures();">dump stream features</button>
<button onclick="logoff();">logoff</button>

<script defer="defer">
var zxmpp;
function go()
{
	var zatecfg = {
		"bind-url": "z-http-bind/",
		"server": 'zatemas.zrs.hr'
	};
	var relativecfg = {
		"bind-url": "http-bind/",
		"server": window.location.hostname
	};

	var cfg = relativecfg;

	zxmpp = new zxmppClass();
	zxmpp.onConnectionTerminate.push(handler_connectionterminate);
	zxmpp.onPresenceUpdate.push(handler_presenceupdate);
	zxmpp.onRosterUpdate.push(handler_rosterupdate);
	zxmpp.onMessage.push(handler_message);
	zxmpp.main(document.getElementById("zxmpp_root"), cfg, "perica", "123");
	//var pack = new zxmpp.packet(zxmpp);



	window.zxmppui = (new zxmpp.ui);//.inject('body');//.onPresenceUpdate(['perica', 'matija']);
	window.zxmppui.inject('body');
	window.zxmppui.backend = zxmpp;
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
	zxmpp.stream.logoff();
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
	console.log("INDEX.PHP: Presence update: ");
	console.log(" -> " + presence.fullJid);
	console.log("   Icon: " + presence.show);
	console.log("   Status: " + presence.status);


	var toppresence = sender.getTopPresenceForBareJid(presence.bareJid);
	if(toppresence)
	{
		console.log("Updating " + toppresence.bareJid);
		zxmppui.presenceUpdate(toppresence.bareJid, toppresence.show, toppresence.bareJid, toppresence.status);
	}
}
function handler_rosterupdate(sender, item)
{
	console.log("INDEX.PHP: Roster update: ");
	console.log(" -> " + item.bareJid);
	console.log("   Subscription: " + item.subscription); 
	console.log("   Groups:");
	for(var i in item.groups)
	{
		console.log("     " + item.groups[i]);
	}
	
	var presence = sender.getTopPresenceForBareJid(item.bareJid);
	if(presence)
	{
		console.log("Presence icon: " + presence.show);
	}

	if(item.subscription != "removed")
	{
		zxmppui.rosterAdded(item.bareJid, presence ? presence.show : "unavailable", presence ? presence.status : "");
		
	}
}
function handler_message(sender, messagestanza)
{
	console.log("> " + messagestanza.from + ": " + messagestanza.body);
	if(messagestanza.body)
		zxmppui.messageReceived(messagestanza.from, messagestanza.body);
}
go();
</script>
</body>
</html>
