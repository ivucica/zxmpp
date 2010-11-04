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
 
zxmppClass.prototype.packet = function (zxmpp)
{
	this.zxmpp = zxmpp;
	this.type = "packet";

	// build a document with httpbind namespace, and root element body 
	this.xml = this.zxmpp.util.newXMLDocument("body","http://jabber.org/protocol/httpbind");


	// set default attributes for body, if needed
	// prefer setting them just before sending
	this.xml_body = this.xml.firstChild;
	this.xml_body.setAttribute('content','text/html; charset=utf-8');
	this.xml_body.setAttribute('xmlns:xmpp','urn:xmpp:xbosh');

	// parsed stanzas
	this.iqStanza = false; this.iqXML = false;
	this.messageStanza = false; this.messageXML = false;
	this.presenceStanza = false; this.presenceXML = false;
	
	// defined namespaces
	// used only when parsing
	this.namespaces = {};
	this.defaultNamespace = "http://jabber.org/protocol/httpbind";
	
	/* functions */
	
	this.finalized = function()
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
		if(keys.key)
			body.setAttribute('key', keys.key);
		if(keys.newKey)
			body.setAttribute('newkey', keys.newKey);
		
		console.log("(finalized: " + this.zxmpp.util.serializedXML(this.xml) + ")");	
		return this.zxmpp.util.serializedXML(this.xml);
		
	}
	
	this.send = function(send_style)
	{	
		
		// queue for wire
		// FIXME ignores send_style!
		if(send_style=="hold")
		{
			this.zxmpp.stream.transmitPacket(this, send_style);
		}
		else
		{
			this.zxmpp.stream.pollPacketQueue.push(this);
			this.zxmpp.stream.tryEmptyingPollQueue();
		}
	}
	
	
	this.parseXML = function(xml)
	{
		if(!xml || !xml.firstChild)
		{
			return false;
		}
		
		
		this.xml = xml;
		
		// root element, xml.firstChild, is <body>
		this.xml_body = xml.firstChild;
		var attrs = this.zxmpp.util.easierAttrs(this.xml_body);

		// check if this is special-type id
		if(attrs["type"])
		{
			switch(attrs["type"])
			{
				case "terminate":
				this.zxmpp.stream.terminate();
				{
					// let's generate an error-identifying code + human readable error
					
					var code = "terminate";
					if(attrs["condition"])
						code+="/"+attrs["condition"];
						
					var humanreadable = "Terminate requested by server with unset condition.";
					switch(attrs["condition"])
					{
						case "host-unknown":
						humanreadable = "Server does not handle the specified hostname.";
						break;
					}
					this.zxmpp.notifyConnectionTerminate(code, humanreadable);
					
					
				}
				return false;
				break;
			}
		}

		// store the sid we received
		if(attrs["sid"])
			this.zxmpp.stream.sid = attrs["sid"];
		
		// we need to extract namespace specs from body
		// just extract those with colon, since by default we
		// presume xmlns to be http://jabber.org/protocol/httpbind
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
			this.zxmpp.util.easierAttrs(child);
			if(child.nodeName.split(":").length>1)
			{
				var ns = child.nodeName.split(":")[0];
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
				if(!child.attr["xmlns"])
					nsurl = this.defaultNamespace;
				else
					nsurl = child.attr["xmlns"];
			}
			
			if(!nsurl)
			{
				console.warn("zxmpp::packet::parseXML(): Stanza " + child.nodeName + " in unknown namespace. Stanza dropped");
				continue;
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
				
				case "urn:ietf:params:xml:ns:xmpp-sasl":
				switch(stanza)
				{
					case "success":
					stanzaInstance = new this.zxmpp.stanzaSaslResult(this.zxmpp);
					break;
					case "failure":
					stanzaInstance = new this.zxmpp.stanzaSaslResult(this.zxmpp);
					break;
				}
				case "http://jabber.org/protocol/httpbind": // COMPAT: Workaround for Prosody 0.7.0
				case "jabber:client":
				switch(stanza)
				{
					case "iq":
					stanzaInstance = new this.zxmpp.stanzaIq(this.zxmpp);
					break;
					case "presence":
					stanzaInstance = new this.zxmpp.stanzaPresence(this.zxmpp);
					break;
					case "message":
					stanzaInstance = new this.zxmpp.stanzaMessage(this.zxmpp);
					break;
					
				}
			
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
		return true;
	}
	this.toJSON = function(key)
	{
		return "";
		oldzxmpp = this.zxmpp;
		delete this.zxmpp;

		var ret = JSON.stringify(this);

		this.zxmpp = oldzxmpp;

		return ret;
	}
}
