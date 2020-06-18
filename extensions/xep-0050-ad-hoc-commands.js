/* -*- Mode: Javascript; indent-tabs-mode: t; tab-width: 4 -*- */
/*
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * XEP-0050: Ad-hoc commands extension
 *
 * (c) 2019 Ivan Vucica
 * License is located in the LICENSE file
 * in Z-XMPP distribution/repository.
 * Use not complying to those terms is a
 * violation of various national and
 * international copyright laws.
 */

function zxmpp_xep0050_init(zxmpp)
{
	zxmpp.clientFeatureExtensions["x-commands"]=[
		"http://jabber.org/protocol/commands", 
	];
	zxmpp.disableClientFeatureExtension("x-commands"); // We do not currently support this. If we do, we'll still disable this serving-side extension announcement by default.

	// TODO: If we want to support the serving side, we FIRST care about disco#items, not about command#
	//zxmpp.addIqParser("command#http://jabber.org/protocol/commands", zxmpp_xep0050_iqhandler);
}

function zxmpp_xep0050_iqhandler(zxmpp, iqstanza, xml)
{
	if(iqstanza.xep0050_abort_processing)
		return false;

	console.log(xml);

	// Returning false will send an error reply. This is fine.
	// We don't support server side at this time.
	return false;
}

function zxmpp_xep0050_cmdlist(zxmpp, destination, cb_list, cb_error)
{
	var packet = new zxmpp.packet(zxmpp);
	var iq = new zxmpp.stanzaIq(zxmpp);
    iq.appendIqToPacket(packet, "cmdlistinquiry", "get", destination);
	iq.appendQueryToPacket(packet, "http://jabber.org/protocol/disco#items", "http://jabber.org/protocol/commands");

	var onReplyFunc = function(zxmpp, original, response)
	{
		if(response.type == "error")
		{
			console.error("Error in getting command list");
			console.error(response);
			console.log(iq);
			iq.xep0050_abort_processing = true;
			cb_error(response);
			return true;
		}
		else
		{
			console.log(response);
			return cb_list(response);
		}
	}

	iq.onReply.push(onReplyFunc);

	//var jingleNode = packet.xml.createElementNS("urn:xmpp:jingle:1", "jingle");
	//packet.iqXML.appendChild(jingleNode);
	//jingleNode.setAttribute("action", "session-initiate");
	//jingleNode.setAttribute("initiator", zxmpp.getOwnPresence().fullJid);
	//jingleNode.setAttribute("sid", sessionId);

	// Use old or new way to build the packet?
	// The new one looks messier, but shorter.
	var useOldPacketBuild = true;
	
	if(useOldPacketBuild)
		packet.send("poll");
	else
	{
		var forced_id = zxmpp.stream.uniqueId("cmdlistinquiry");
		zxmpp.stream.sendIqQuery("http://jabber.org/protocol/disco#items", "get", destination, false, {"node": "http://jabber.org/protocol/commands"}, forced_id, on_reply=[onReplyFunc]);
	}

}
