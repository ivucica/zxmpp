/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 * License is located in the LICENSE file
 * in Z-XMPP distribution/repository.
 * Use not complying to those terms is a
 * violation of various national and
 * international copyright laws.
 */
 
// handling of "presence"
zxmppClass.prototype.stanzaPresence = function(zxmpp)
{
	this.zxmpp = zxmpp;
	
	this.from = false;
	this.to = false;
	this.type = false;
	this.show = false;
	this.status = "";
	this.priority = undefined;
	
	this.presenceNode = false;
	
	this.parseXML = function (xml)
	{
		
		//console.log("Presence parsing: " + this.zxmpp.util.serializedXML(xml));
		this.zxmpp.util.easierAttrs(xml);
		
		this.from = xml.attr["from"];
		this.to = xml.attr["to"];
		this.type = xml.attr["type"];

		var presence = this.zxmpp.getPresence(this.from);
		presence.show = "avail";
		if(this.type == "unavailable" || this.type == "error")
		{
			presence.show = "unavailable";
			this.zxmpp.notifyPresenceUpdate(presence);
			this.zxmpp.removePresence(this.from);
			
			
			return; // FIXME we should not return and should continue parsing; showing the <status> upon logout might be fun
		}

		this.presenceNode = presence;
		this.show = presence.show = "avail";
		this.status = presence.status = "";

		//console.log("Got presence from " + this.from);
		for(var i in xml.childNodes)
		{
			var child = xml.childNodes[i];
			if(!child.nodeName) continue;
			
			switch(child.nodeName)
			{
				case "show":
				if(child.firstChild)
					this.show = child.firstChild.nodeValue;
				else
					this.show = "avail";
				if(this.from != this.zxmpp.fullJid)
					presence.show = this.show;
				break;
			
				case "status":
				if(child.firstChild)
					this.status = child.firstChild.nodeValue;
				else
					this.status = "";	
				if(this.from != this.zxmpp.fullJid)
					presence.status = this.status;
					
				break;
				
				case "priority":
				if(child.firstChild)
					this.priority = child.firstChild.nodeValue;
				else
					this.priority = 1;
				if(this.from != this.zxmpp.fullJid)
					presence.priority = this.priority;
				break;
				
				case "c": // TODO check namespace - should be http://jabber.org/protocol/caps
				if(this.from != this.zxmpp.fullJid)
				{
					this.caps = presence.caps = new this.zxmpp.caps(this.zxmpp);
					this.caps.ownerJid = this.from;
					this.caps.parseXML(child);
				}
				else
				{
					this.caps = presence.caps;
				}
				break;

				case "x": // TODO check namespace - should be vcard-temp:x:update
				this.zxmpp.stream.sendIqVCardRequest(presence.bareJid);
				break;

				case "#text":
				// ignore!
				break;
				
				default:
				console.log("zxmpp::stanzapresence::parseXML(): Unhandled child node " + child.nodeName);	
			}
			
		}
		
		this.zxmpp.notifyPresenceUpdate(presence);

	}
	
	
	this.appendToPacket = function(packet, from, to, type, status, priority)
	{
		if(!status) 
			status = "";
		
		this.from = from;
		this.to = to;
		this.status = status;
		if(type == "unavailable")
		{
			this.type = "unavailable";
		}
		else if(type == "avail")
		{
			// both show and type are empty!
		}
		else
		{
			this.show = type;
		}
		if(typeof priority != "undefined")
		{
			this.priority = priority;
		}
		
		
		var presenceNode = this.presenceNode = packet.xml.createElementNS("jabber:client", "presence");
		if(this.from) presenceNode.setAttribute("from", this.from);
		if(this.to) presenceNode.setAttribute("to", this.to);
		if(this.type)
		{
			presenceNode.setAttribute("type", this.type);
		}
		packet.xml_body.appendChild(presenceNode);
		
		if(this.status && this.status != "")
		{
			var statusNode = packet.xml.createElement("status");
			var statusText = packet.xml.createTextNode(this.status);
			statusNode.appendChild(statusText);
			presenceNode.appendChild(statusNode);
		}
		if(this.show && this.show != "")
		{
			var showNode = packet.xml.createElement("show");
			var showText = packet.xml.createTextNode(this.show);
			showNode.appendChild(showText);
			presenceNode.appendChild(showNode);
		}
		if(this.priority && this.priority != "")
		{
			var priorityNode = packet.xml.createElement("priority");
			var priorityText = packet.xml.createTextNode(this.priority);
			priorityNode.appendChild(priorityText);
			presenceNode.appendChild(priorityNode);
		}
		
		// finally, add our caps!
		var presence = this.zxmpp.getPresence(this.from);
		var caps = presence.caps;
		caps.applyThisClientsCaps();
		caps.appendToXML(packet, presenceNode);
		
		packet.presenceXML = presenceNode;
		packet.presenceStanza = this;
	}
	
	this.toJSON = function()
	{
		// TODO
		console.warn("skipping encoding of stanzaPresence");
		return "< not encoding stanzaPresence >";
	}	
	
}
