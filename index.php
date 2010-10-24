<!DOCTYPE html>
<html>
<head>
<title>Z-XMPP</title>

<link href="application.css" rel="stylesheet" type="text/css">

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js"></script>
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
	var cfg = {
		"bind-url": "z-http-bind/",
		"server": 'zatemas.zrs.hr'//window.location.hostname
	};
	zxmpp = new zxmppClass();
	zxmpp.onConnectionTerminate.push(handler_connectionterminate);
	zxmpp.onPresenceUpdate.push(handler_presenceupdate);
	zxmpp.onRosterUpdate.push(handler_rosterupdate);
	zxmpp.main(document.getElementById("zxmpp_root"), cfg, "perica", "123");
	ui = (new zxmpp.ui).inject('body');//.onPresenceUpdate(['perica', 'matija']);
	//var pack = new zxmpp.packet(zxmpp);
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

function handler_connectionterminate(code,humanreadable)
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
function handler_presenceupdate(presence)
{
	console.log("INDEX.PHP: Presence update: ");
	console.log(" -> " + presence.fullJid);
	console.log("   Icon: " + presence.show);
	console.log("   Status: " + presence.status);
}
function handler_rosterupdate(item)
{
	console.log("INDEX.PHP: Roster update: ");
	console.log(" -> " + item.bareJid);
	console.log("   Subscription: " + item.subscription); 
	console.log("   Groups:");
	for(var i in item.groups)
	{
		console.log("     " + item.groups[i]);
	}
	
	var presence = zxmpp.getTopPresenceForBareJid(item.bareJid);
	if(presence)
	{
		console.log("Presence icon: " + presence.show);
	}
}
go();
</script>
</body>
</html>
