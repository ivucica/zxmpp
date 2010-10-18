/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */
 
// handling of "features" in namespace "http://etherx.jabber.org/streams"
zxmppClass.prototype.stanzaSaslResult = function(zxmpp)
{
	this.zxmpp = zxmpp;
	
	this.parseXML = function (xml)
	{
		if(xml.nodeName == "success")
		{
			this.zxmpp.stream.authSuccess = true;
		}
		else if(xml.nodeName == "failure")
		{
			this.zxmpp.stream.authSuccess = false;
		}
		else
		{
			console.warn("zxmpp::stanzaSaslResult::parseXML(): Unhandled nodename " + xml.nodeName);
		}
	}
	
	
	
}