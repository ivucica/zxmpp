/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */
 
// represents caps of a single entity on xmpp network
zxmppClass.prototype.caps = function(zxmpp)
{
	this.zxmpp = zxmpp;
	
	this.node = false;
	this.ver = false;
	this.ext = false;
	this.hash = false;
	
	this.features = {};
	this.ownerJid = false;
	
	this.parseXML = function (xml)
	{
		
		// style one:
		//	<c xmlns='http://jabber.org/protocol/caps' node='http://psi-im.org/caps' ver='caps-b75d8d2b25' ext='ca cs ep-notify html'/>
		
		this.zxmpp.util.easierAttrs(xml);
		
		this.node = xml.attr["node"];
		this.ver = xml.attr["ver"];
		this.ext = xml.attr["ext"];
		this.hash = xml.attr["hash"];
		
		// if we already know caps, skip
		// TODO establish a client+ver database of caps
		
		// discover caps by sending disco info
		if(!this.ownerJid)
		{
			console.error("zxmpp::caps::parseXML(): Cannot discover caps since ownerJid is not set");
			return; 
		}
		
		this.zxmpp.stream.sendIqQuery("http://jabber.org/protocol/disco#info", "get", this.ownerJid);
		
		
		
		/*
		if(this.hash)
		{
			// XEP-0115-4
		}
		else
		{
			// XEP-0115-3 legacy format
			// TODO unimplemented
		}*/

	}

};

