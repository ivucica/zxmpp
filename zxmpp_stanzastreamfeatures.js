/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */
 
// handling of "features" in namespace "http://etherx.jabber.org/streams"
zxmppClass.prototype.stanzaStreamFeatures = function(zxmpp)
{
	this.zxmpp = zxmpp;
	
	this.parseXML = function (xml)
	{
		for(var i in xml.childNodes)
		{
			var child = xml.childNodes[i];
			if(child && child.nodeName)
			{
				this.zxmpp.util.easierAttrs(child);
				
				var feature = false;
				if(child.nodeName == "mechanisms" && child.attr["xmlns"]=="urn:ietf:params:xml:ns:xmpp-sasl")
				{
					feature = this.parseMechanisms(child);
					feature.xmlNS = child.attr["xmlns"];
				}
				else if(child.nodeName == "bind" && child.attr["xmlns"]=="urn:ietf:params:xml:ns:xmpp-bind")
				{
					feature = new Object();
					feature.xmlNS = child.attr["xmlns"];
				}
				else if(child.nodeName == "session" && child.attr["xmlns"]=="urn:ietf:params:xml:ns:xmpp-session")
				{
					feature = new Object();
					feature.xmlNS = child.attr["xmlns"];
				}
				else
				{
					console.warn("zxmpp::stanzaStreamFeatures::parseXML(): Unparsed " + child.nodeName + " in namespace " + child.attr["xmlns"]  + ": " + this.zxmpp.util.serializedXML(child));
				}
				
				
				if(feature)
				{
					feature.nodeName = child.nodeName;
					if(!this.zxmpp.stream.features[child.attr["xmlns"]])
						this.zxmpp.stream.features[child.attr["xmlns"]] = new Array();
					this.zxmpp.stream.features[child.attr["xmlns"]][child.nodeName] = feature;
				}
			}
		}
	}
	
	
	this.parseMechanisms = function(xml)
	{
		var saslMechanisms = [];
		for(var i in xml.childNodes)
		{
			var child = xml.childNodes[i];
			if(child.nodeName=="mechanism")
			{
				saslMechanisms[child.firstChild.nodeValue.toUpperCase()] = true;
			}
		}
		return saslMechanisms;
	}
	
}