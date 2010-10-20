/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */
 
// typically represents caps of a single entity on xmpp network,
// but can also be cached in a node
zxmppClass.prototype.caps = function(zxmpp)
{
	this.zxmpp = zxmpp;
	
	this.node = false;
	this.ver = false;
	this.ext = false;
	this.hash = false;
	
	this.features = {};
	this.ownerJid = false;
	this.ownerNode = false;
	
	this.nodeCategory = false;
	this.nodeType = false;
	this.nodeName = false;
	
	this.parseXML = function (xml) // parse "c"
	{
		
		// XEP-0115-3:
		//	<c xmlns='http://jabber.org/protocol/caps' node='http://psi-im.org/caps' ver='caps-b75d8d2b25' ext='ca cs ep-notify html'/>
		// latest XEP-0115-4 (as of oct 2010) also includes hash
		
		this.zxmpp.util.easierAttrs(xml);
		
		this.node = xml.attr["node"];
		this.ver = xml.attr["ver"];
		this.ext = xml.attr["ext"];
		this.hash = xml.attr["hash"];
		
		this.ownerNode = this.node + "#" + this.ver;
		
		// if we already know caps, skip
		if(this.hash)
		{
			// XEP-0115-4
			// we can use node database
			
			if(this.zxmpp.capsNodes[this.ownerNode + "#" + this.hash])
			{
				// replace this instance in its owner zxmpp::presence with
				// the cached zxmpp::caps based on the hash
				
				// TODO must copy, not reference, and then replace ownerJid!
				this.zxmpp.getPresence(this.ownerJid).caps = this.zxmpp.capsNodes[this.ownerNode + "#" + this.hash];
				
				return;
			}
		}
		else
		{
			// XEP-0115-3 legacy format
			// using database is impossible,
			// since we cannot verify caps
			
			// TODO implement "ext" parsing
			
			// TODO decide if we will trust clients that dont serve us hash
			// for now we will trust 
			if(this.zxmpp.capsNodes[this.ownerNode])
			{
				// replace this instance in its owner zxmpp::presence with
				// the cached zxmpp::caps, based on just the node+ver
				
				// TODO must copy, not reference, and then replace ownerJid!
				this.zxmpp.getPresence(this.ownerJid).caps = this.zxmpp.capsNodes[this.ownerNode];
				
				return;
			}

		}

		
		// discover caps by sending disco info
		if(!this.ownerJid)
		{
			console.error("zxmpp::caps::parseXML(): Cannot discover caps since ownerJid is not set");
			return; 
		}
		
		this.zxmpp.stream.sendIqQuery("http://jabber.org/protocol/disco#info", "get", this.ownerJid, false, {"node": this.node + "#" + this.ver});
		
		
		
	}

	this.finishProcessing = function()
	{
		
		// TODO must copy, not reference, and then replace ownerJid with 'false'!

		if(this.hash)
		{
			// TODO add hash spoofing verification!
			
			this.zxmpp.capsNodes[this.ownerNode + "#" + this.hash] = this;
		}
		else
		{
			// TODO decide if we should trust the client without a hash!
			// let's still cache based on ver, and trust
			
			this.zxmpp.capsNodes[this.ownerNode] = this;
		}
	}

};

