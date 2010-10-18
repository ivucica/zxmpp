/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
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
		presence.show = "available";
		if(this.type == "unavailable")
		{
			presence.show = "unavailable";
			// TODO should actually REMOVE the presence
		}

		this.presenceNode = presence;
		
		for(var i in xml.childNodes)
		{
			var child = xml.childNodes[i];
			if(!child.nodeName) continue;
			
			switch(child.nodeName)
			{
				case "show":
				presence.show = child.firstChild.nodeValue;
				this.show = child.firstChild.nodeValue;
				break;
			
				case "status":
				presence.status = child.firstChild.nodeValue;
				this.status = child.firstChild.nodeValue;
				break;
				
				case "priority":
				presence.priority = child.firstChild.nodeValue;
				this.priority = child.firstChild.nodeValue;
				break;
				
				case "#text":
				// ignore!
				break;
				
				// TODO handle "c"
				default:
				console.log("zxmpp::stanzapresence::parseXML(): Unhandled child node " + child.nodeName);	
			}
			
		}
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
		else if(type == "available")
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
		
		
		var presenceNode = this.presenceNode = packet.xml.createElement("presence");
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
		
	}
	
	this.addCaps = function()
	{
		var cnode = packet.createElementNS("http://jabber.org/protocol/caps", "c");
		cnode.setAttribute("node", "http://ivan.vucica.net/zxmpp/"); // FIXME move client identifier to global var
		cnode.setAttribute("ver", "1.0"); // TODO implement proper, hashed "ver"
		cnode.setAttribute("ext", ""); // TODO Send some capabilities! Avoid 'ext'
		
	}
	
	
}