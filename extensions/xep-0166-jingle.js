/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * XEP-0166: Jingle extension
 *
 * (c) 2012 Ivan Vucica
 * License is located in the LICENSE file
 * in Z-XMPP distribution/repository.
 * Use not complying to those terms is a
 * violation of various national and
 * international copyright laws.
 */

var zxmpp_xep0166_PeerConnection = false;
function zxmpp_xep0166_init(zxmpp)
{
	/*
	try
	{
		new PeerConnection("", function(){});
		zxmpp_xep0166_PeerConnection = PeerConnection;
	}
	catch (e)
	{
		zxmpp_xep0166_PeerConnection = webkitDeprecatedPeerConnection;
	}

	try
	{
		new zxmpp_xep0166_PeerConnection("", function(){});
	}
	catch (e)
	{
		zmpp_xep0166_PeerConnection = false;
	}
	*/



	zxmpp.clientFeatureExtensions["jingle"]=[
		"urn:xmpp:jingle:1", 
	];
	if(zxmpp_xep0166_PeerConnection)
	{
		zxmpp.clientFeatureExtensions["jingle-ice"] = ["urn:xmpp:jingle:transports:ice-udp:1"];
		zxmpp.clientFeatureExtensions["jingle-rtp"] = ["urn:xmpp:jingle:apps:rtp:1"];
	}
	
	zxmpp.clientFeatureExtensions["jingle-audio"]=["urn:xmpp:jingle:apps:rtp:audio"];
	zxmpp.clientFeatureExtensions["jingle-video"]=["urn:xmpp:jingle:apps:rtp:video"];
	zxmpp.disableClientFeatureExtension("jingle-audio");
	zxmpp.disableClientFeatureExtension("jingle-video");

	zxmpp.addIqParser("jingle#urn:xmpp:jingle:1", zxmpp_xep0166_iqhandler); // we could also register just "jingle", but this is more specific!
}

function zxmpp_xep0166_iqhandler(zxmpp, iqstanza, xml)
{
	console.log(xml);
	return true;
}

function zxmpp_xep0166_sessioninitiate(zxmpp, destination, sessionId, contentXMLGenerator)
{
	if(destination.indexOf("/") >= 0)
		destination = destination.substr(0,destination.indexOf("/"));
	var topPresence = zxmpp.getTopPresenceForBareJid(destination);
	if(topPresence && topPresence.fullJid)
		destination = topPresence.fullJid;
	console.log(topPresence);
	console.log(destination);
	var packet = new this.zxmpp.packet(this.zxmpp);
	var iq = new this.zxmpp.stanzaIq(this.zxmpp);
	iq.appendIqToPacket(packet, "jingle", "set", destination);
	iq.onReply.push(function(zxmpp, original, response)
		{
			console.error("////////////////// Call being negotiated");
		}
	);

	var jingleNode = packet.xml.createElementNS("urn:xmpp:jingle:1", "jingle");
	packet.iqXML.appendChild(jingleNode);
	jingleNode.setAttribute("action", "session-initiate");
	jingleNode.setAttribute("initiator", zxmpp.getOwnPresence().fullJid);
	jingleNode.setAttribute("sid", sessionId);


	var contentXML = contentXMLGenerator(zxmpp, destination, sessionId, packet);
	jingleNode.appendChild(contentXML);

	packet.send("poll");
}

