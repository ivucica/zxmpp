<!DOCTYPE html>
<html>
<head>
<title>Z-XMPP</title>
<script src="zxmpp_main.js"></script>
<script src="zxmpp_util.js"></script>
<script src="zxmpp_stream.js"></script>
<script src="zxmpp_packet.js"></script>

<script src="zxmpp_stanzastreamfeatures.js"></script>
</head>
<body>
<div id="zxmpp_root">Loading zxmpp</div>
<button onclick="go();">go</button>
<script defer="defer">
function go()
{
	var cfg = {
		"bind-url": "http-bind/",
		"server": window.location.hostname
	};
	
	var zxmpp = new zxmppClass();
	zxmpp.main(document.getElementById("zxmpp_root"), cfg, "perica", "123");
	//var pack = new zxmpp.packet(zxmpp);
}

go();
</script>
</body>
</html>
