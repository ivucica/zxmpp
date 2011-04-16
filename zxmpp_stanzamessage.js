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
 
// handling of "message"
zxmppClass.prototype.stanzaMessage = function(zxmpp)
{
	this.zxmpp = zxmpp;
	
	this.from = false;
	this.to = false;
	this.type = false;

	this.body = false;
	
	this.parseXML = function (xml)
	{
		
		this.zxmpp.util.easierAttrs(xml);
		
		this.from = xml.attr["from"];
		this.to = xml.attr["to"];
		this.type = xml.attr["type"];

		for(var i in xml.childNodes)
		{
			var child = xml.childNodes[i];
			if(!child.nodeName) continue;
			
			switch(child.nodeName)
			{
				case "body":
				if(child.firstChild)
					this.body = child.firstChild.nodeValue;
				else
					this.body = "";
				break;

				case "#text":
				// ignore!
				break;
				
				default:
				console.log("zxmpp::stanzaMessage::parseXML(): Unhandled child node " + child.nodeName);	
			}
			
		}
		this.zxmpp.notifyMessage(this);

	}
		
	// 'body' can be false/null, to prevent appending <body>
	this.appendToPacket = function(packet, from, to, type, body)
	{
		this.from = from;
		this.to = to;
		this.body = body;
		this.type = type;
		
		var messageNode = this.messageNode = packet.xml.createElementNS("jabber:client", "message");
		if(this.from) messageNode.setAttribute("from", this.from);
		if(this.to) messageNode.setAttribute("to", this.to);
		if(this.type)
		{
			messageNode.setAttribute("type", this.type);
		}
		packet.xml_body.appendChild(messageNode);
	
		console.log("body: " + this.body);	
		if(this.body)
		{
			console.log("appending " + this.body);
			var bodyNode = packet.xml.createElementNS("jabber:client", "body");
			var bodyText = packet.xml.createTextNode(this.body);
			bodyNode.appendChild(bodyText);
			messageNode.appendChild(bodyNode);
		}
		
		packet.messageXML = messageNode;
		packet.messageStanza = this;
	}
	
	
	
}
