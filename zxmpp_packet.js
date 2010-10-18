/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */
 
zxmppClass.prototype.packet = function (zxmpp)
{
	this.zxmpp = zxmpp;

	// build a document with httpbind namespace, and root element body 
	this.xml = this.zxmpp.util.newXMLDocument("body","http://jabber.org/protocol/httpbind");


	// set default attributes for body, if needed
	// prefer setting them just before sending
	this.xml_body = this.xml.firstChild;
	this.xml_body.setAttribute('content','text/html; charset=utf-8');
	this.xml_body.setAttribute('xmlns:xmpp','urn:xmpp:xbosh');

	// parsed stanzas
	this.iq = false;
	this.message = false;
	this.presence;
	
	// defined namespaces
	// used only when parsing
	this.namespaces = {};
	this.defaultNamespace = "http://jabber.org/protocol/httpbind";
	
	/* functions */
	this.addIq = function(idtype, type, to)
	{
		// generate an iq in this packet
		
		var iq = this.xml.createElementNS("jabber:client", "iq");
		iq.setAttribute("id", this.zxmpp.stream.uniqueID(idtype));
		iq.setAttribute("type", type);
		if(to) 
			iq.setAttribute("to", to);
				
		return iq;
	}
	
	
	this.send = function()
	{	
		var body = this.xml_body;
		
		// assign a sequential request id
		this.rid = this.zxmpp.stream.assignRID();
		body.setAttribute('rid', this.rid);
		
		// assign a sid, if it's known
		// (earliest packets don't have a sid)
		if(this.zxmpp.stream.sid)
		{
			body.setAttribute('sid',this.zxmpp.stream.sid);
		}
		
		// assign cryptographic key(s) from 
		// part 15 of XEP-0124
		var keys = this.zxmpp.stream.assignKey();
		body.setAttribute('key', keys.key);
		if(keys.newKey)
			body.setAttribute('newkey', keys.newkey);
		
		
		// serialize xml, for output on wire
		var outxml = this.zxmpp.util.serializedXML(this.xml);
		
		// output to wire
		this.zxmpp.stream.transmitPacket(outxml, "poll");
	}
	
	
	this.parseXML = function(xml)
	{
		this.xml = xml;
		
		// root element, xml.firstChild, is <body>
		this.xml_body = xml.firstChild;
		
		// we need to extract namespace specs from body
		// just extract those with colon, since by default we
		// presume xmlns to be http://jabber.org/protocol/httpbind
		var attrs = this.zxmpp.util.easierAttrs(this.xml_body);
		for(var attr in attrs)
		{
			var colonsplit = attr.split(":");
			if(colonsplit[0]=="xmlns" && colonsplit[1])
			{
				this.namespaces[colonsplit[1]] = attrs[attr];
				//console.log("namespace '" + colonsplit[1] + "': " + attrs[attr]);
			}
		}
		
		
		// now find the stanzas in the body, and parse them
		for(var i in this.xml_body.childNodes)
		{
			var child = this.xml_body.childNodes[i];
			if(!child.nodeName) continue;
			
			var nsurl = false;
			var stanza = false;
			if(child.nodeName.split(":").length>1)
			{
				var ns = child.nodeName.split(":")[0];
				this.zxmpp.util.easierAttrs(child);
			
				stanza = child.nodeName.split(":")[1];
				
				if(child.attr["xmlns:" + ns])
				{
					nsurl = child.attr["xmlns:" + ns];
				}
				else if(this.namespaces[ns])
				{
					nsurl = this.namespaces[ns];
				}
			}
			else
			{
				stanza = child.nodeName;
				nsurl = this.defaultNamespace;
			}
			
			if(!nsurl)
			{
				console.warn("zxmpp::packet::parseXML(): Stanza " + child.nodeName + " in unknown namespace. Stanza dropped");
				return;
			}
			
			// now we have enough data about stanza to start parsing it
			// let's iterate through supported stanzas!
			console.log("zxmpp::packet::parseXML(): Stanza " + stanza + " in namespace " + nsurl);
			var stanzaInstance = false;
			switch(nsurl)
			{
				case "http://etherx.jabber.org/streams":
				switch(stanza)
				{
					case "features":
					stanzaInstance = new this.zxmpp.stanzaStreamFeatures(this.zxmpp);
					break;
				}
				break;
			
			}
			
			if(!stanzaInstance)
			{
				console.warn("zxmpp::packet::parseXML(): Stanza \'" + stanza + "\' in namespace \'" + nsurl + "\' is unknown. Stanza dropped");
			}
			else
			{
				stanzaInstance.parseXML(child);
			}
			
			
		}
	}
}
