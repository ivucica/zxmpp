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
	}
	
}

