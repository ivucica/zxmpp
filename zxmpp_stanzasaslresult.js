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
			
			this.zxmpp.stream.terminate();
			
			if(this.zxmpp.onConnectionTerminate)
			{
				var code = "saslfailure";
				if(xml.firstChild)
				{
					code+="/"+xml.firstChild.nodeName;
				}
				
				var humanreadable = "A SASL authentication failure has occured.";
				if(xml.firstChild)
				{
					switch(xml.firstChild.nodeName)
					{
						case "not-authorized":
						humanreadable = "Provided authentication details do not give you access.";
						break;
					}
				}
				this.zxmpp.onConnectionTerminate(code, humanreadable);
			}
			
		}
		else
		{
			console.warn("zxmpp::stanzaSaslResult::parseXML(): Unhandled nodename " + xml.nodeName);
		}
	}
	
	
	
}