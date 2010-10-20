<!DOCTYPE html>
<html>
<head>
<title>Z-XMPP</title>

<script src="deepCopy.js"></script>

<script src="zxmpp_main.js"></script>
<script src="zxmpp_util.js"></script>
<script src="zxmpp_stream.js"></script>
<script src="zxmpp_packet.js"></script>
<script src="zxmpp_presence.js"></script>
<script src="zxmpp_caps.js"></script>

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
<script defer="defer">
var zxmpp;
function go()
{
	var cfg = {
		"bind-url": "http-bind/",
		"server": window.location.hostname
	};
	zxmpp = new zxmppClass();
	zxmpp.onConnectionTerminate=handler_connectionterminate;
	zxmpp.main(document.getElementById("zxmpp_root"), cfg, "perica", "123");
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

go();
</script>
</body>
</html>
