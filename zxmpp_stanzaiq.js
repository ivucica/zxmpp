/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * DOCUMENTATION ON BOSH: http://xmpp.org/extensions/xep-0124.html 
 */
 
zxmppClass.prototype.stanzaIq = function(zxmpp)
{
	this.zxmpp = zxmpp;
	
	this.iq = false;
	this.query = false;

	var appendQueryToPacket = function(packet, namespace)
	{
		// For a given packet initialized with an <iq>,
		// append a <query>, initializing this.query
		
		// Also, attach that <iq> to this class, 
		// initializing this.iq
		var iq = this.iq = packet.iq;
		var query = this.query = packet.createElementNS(namespace, "query");
		iq.appendChild(query);	
	}

	var setType = function(aType)
	{
		// sets the type: get, set, result
		// requires this.iq to be valid
		
		if(!iq)
		{
			console.error("zxmpp::stanzaIq::setType(): iq not set");
			return;
		}
		switch(aType)
		{
			case "set":
			case "get":
			case "result":
			break;
			
			default:
			console.error("zxmpp::stanzaIq::setType(): invalid type " + aType);
			return;
		}
		
		iq.setAttribute("type", aType);
	}
	
	var setFrom = function(from)
	{
		// sets the "from" jid
		
		if(!iq)
		{
			console.error("zxmpp::stanzaIq::setFrom(): iq not set");
			return;
		}
		
		if(from && from != zxmpp.stream.fullJid)
		{
			console.warn("zxmpp::stanzaIq::setFrom(): setting from to non-own jid");
			iq.setAttribute("from", from);
			return;
		}
		
		iq.setAttribute("from", zxmpp.stream.fullJid);
	}
	
	
	var setTo = function(to)
	{
		// sets the "to" jid
		
		if(!iq)
		{
			console.error("zxmpp::stanzaIq::setTo(): iq not set");
			return;
		}
		
		iq.setAttribute("to", zxmpp.stream.fullJid);
	}
}

