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
				if(child.nodeName == "mechanisms" && child.attr["xmlns"]=="urn:ietf:params:xml:ns:xmpp-sasl")
				{
					this.parseMechanisms(child);
				}
				
			}
		}
	}
	
	
	this.parseMechanisms = function(xml)
	{
		for(var i in xml.childNodes)
		{
			var child = xml.childNodes[i];
			if(child.nodeName=="mechanism")
			{
				this.zxmpp.saslMechanisms[child.firstChild.nodeValue.toUpperCase()] = true;
			}
		}
	}
	
}