<!DOCTYPE html>
<html>
<head>
<title>Z-XMPP</title>
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

go();
</script>
</body>
</html>
