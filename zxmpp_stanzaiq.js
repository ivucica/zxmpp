/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */

zxmppClass.prototype.stanzaIq = function(zxmpp)
{
	this.zxmpp = zxmpp;
	
	this.iqXML = false;
	
	this.query = false;
	this.bind = false;
	this.session = false;

	this.to = false;
	this.from = false;
	this.type = false,
	this.id = false;

	this.parseXML = function(xml)
	{
		this.zxmpp.util.easierAttrs(xml);
		
		this.from = xml.attr["from"];
		this.to = xml.attr["to"];
		this.type = xml.attr["type"];
		this.id = xml.attr["id"];
		
		for(var i in xml.childNodes)
		{
			var child = xml.childNodes[i];
			if(!child.nodeName) continue;
			
			this.zxmpp.util.easierAttrs(child);
				
			switch(child.nodeName)
			{
				case "bind":
				this.parseBindXML(child);
				break;
				
				case "query":
				this.parseQueryXML(child);
				break;
				
				case "error":
				console.error("zxmpp::stanzaIq::parseXML(): error node received: " + this.zxmpp.util.serializedXML(child));
				if(this.zxmpp.stream.iqsAwaitingReply[this.id])
				{
					var orig = this.zxmpp.stream.iqsAwaitingReply[this.id];
					console.error("zxmpp::stanzaIq::parseXML(): original stanza: " + this.zxmpp.util.serializedXML(orig.iqXML));
				}
				else
				{
					console.error("zxmpp::stanzaIq::parseXML(): original stanza with id " + this.id + " not found");
				}
				break;
				
				default:
				console.warn("zxmpp::stanzaIq::parseXML(): Unknown child " + child.nodeName);
			}
		}
	}
	
	this.parseBindXML = function(xml)
	{
		if(xml.attr["xmlns"] && xml.attr["xmlns"] != "urn:ietf:params:xml:ns:xmpp-bind")
		{
			this.iqFail();
			return;
		}
		
		switch(this.type)
		{
			case "result":
			// grab jid
			for(var i in xml.childNodes)
			{
				var child = xml.childNodes[i];
				if(!child) continue;
				
				switch(child.nodeName)
				{
					case "jid":
					if(child.firstChild)
					{
						this.zxmpp.fullJid = child.firstChild.nodeValue;
						this.zxmpp.getPresence(this.zxmpp.fullJid);
					}
					break;
				}
			}
			
			break;
		}
	}
	
	this.parseQueryXML = function(xml)
	{
		switch(this.type)
		{
			case "result":
			
			switch(xml.attr["xmlns"])
			{
				case "jabber:iq:roster":
				this.parseQueryRosterXML(xml);
				break;
				
				default:
				console.warn("zxmpp::stanzaIq::parseQueryXML(): Unknown namespace " + xml.attr["xmlns"]);

			}
			
			break;
		}
	}
	
	this.parseQueryRosterXML = function(xml)
	{
		for(var i in xml.childNodes)
		{
			var child = xml.childNodes[i];
			if(!child.nodeName) continue;
			
			this.zxmpp.util.easierAttrs(child);
			
			switch(child.nodeName)
			{
				case "item":
				// FIXME should actually have a class "rosteritem"
				// which would parse this and serve as representation
				// in the roster
				// but oh well...
				
				var jid = child.attr["jid"];
				console.log("Roster: " + jid);				
				break;
				
				default:
				console.warn("zxmpp::stanzaIq::parseQueryRosterXML(): Unknown namespace " + xml.attr["xmlns"]);

			}
		}
	}
	
	
	this.iqFail = function()
	{
		console.error("zxmpp::stanzaIq::iqFail(): a failure parsing IQ stanza has occured");
			
		switch(this.type)
		{
			case "result":
			// failure to parse requires no transmission
			// towards server
			break;
			
			default:
			case "get":
			case "set":
			// FIXME implement failure response to server
			console.warn("zxmpp::stanzaIq::iqFail(): responding to " + this.type + "-type iq failure is unimplemented");
			
			break;
		}
		
	}
	
	this.appendIqToPacket = function(packet, idtype, type, to)
	{
		// generate an iq in this packet
		
		var iq = packet.xml.createElementNS("jabber:client", "iq");
		iq.setAttribute("id", this.id=this.zxmpp.stream.uniqueId(idtype));
		iq.setAttribute("type", this.type=type);
		if(to) 
			iq.setAttribute("to", this.to=to);
			
		packet.xml_body.appendChild(iq);
		
		packet.iqXML = iq;
		this.iqXML = iq;
		packet.iqStanza = this;
	}

	this.appendQueryToPacket = function(packet, namespace)
	{
		// For a given packet initialized with an <iq>,
		// append a <query>, initializing this.query
		
		// Also, attach that <iq> to this class, 
		// initializing this.iqXML
		var iq = this.iqXML = packet.iqXML;
		var query = this.query = packet.xml.createElementNS(namespace, "query");
		iq.appendChild(query);
		
		packet.iqStanza = this;
		
	}
	this.appendBindToPacket = function(packet, resource)
	{
		// For a given packet initialized with an <iq>,
		// append a <bind><resource>txt</resource></bind>, 
		// initializing this.bind
		
		// Also, attach that <iq> to this class, 
		// initializing this.iqXML
		var iq = this.iqXML = packet.iqXML;
		var bind = this.bind = packet.xml.createElementNS("urn:ietf:params:xml:ns:xmpp-bind", "bind");
		iq.appendChild(bind);
		
		var resource_node = packet.xml.createElement("resource");
		bind.appendChild(resource_node);
		
		var resource_value = packet.xml.createTextNode(resource);
		resource_node.appendChild(resource_value);
		
		packet.iqStanza = this;
	}

	this.appendSessionToPacket = function(packet, resource)
	{
		// For a given packet initialized with an <iq>,
		// append a <session/>, 
		// initializing this.session
		
		// Also, attach that <iq> to this class, 
		// initializing this.iqXML
		var iq = this.iqXML = packet.iqXML;
		var session = this.session = packet.xml.createElementNS("urn:ietf:params:xml:ns:xmpp-session", "session");
		iq.appendChild(session);
	}


	this.setType = function(aType)
	{
		// sets the type: get, set, result
		// requires this.iqXML to be valid
		
		if(!this.iqXML)
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
		
		this.type = aType;
		this.iqXML.setAttribute("type", aType);
	}
	
	this.setFrom = function(from)
	{
		// sets the "from" jid
		
		if(!this.iqXML)
		{
			console.error("zxmpp::stanzaIq::setFrom(): iq not set");
			return;
		}
		
		if(from && from != zxmpp.fullJid)
		{
			console.warn("zxmpp::stanzaIq::setFrom(): setting from to non-own jid");
			this.iqXML.setAttribute("from", from);
			this.from = from;
			return;
		}
		this.from = zxmpp.fullJid;
		
		this.iqXML.setAttribute("from", zxmpp.fullJid);
	}
	
	
	this.setTo = function(to)
	{
		// sets the "to" jid
		
		if(!this.iqXML)
		{
			console.error("zxmpp::stanzaIq::setTo(): iq not set");
			return;
		}
		this.to = to;
		
		this.iqXML.setAttribute("to", zxmpp.fullJid);
	}
}

