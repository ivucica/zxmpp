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
			
			{
				var code = "saslfailure";
				if(xml.firstChild)
				{
					code+="/"+xml.firstChild.nodeName;
				}
				
				var humanreadable = "A SASL authentication failure has occured. ";
				if(xml.firstChild)
				{
					switch(xml.firstChild.nodeName)
					{
						case "not-authorized":
						humanreadable += "Provided authentication details do not give you access.";
						break;

						case "account-disabled":
						humanreadable += "Your account has been disabled.";
						break;
					}
				}
				this.zxmpp.notifyConnectionTerminate(code, humanreadable);
			}
			
		}
		else
		{
			console.warn("zxmpp::stanzaSaslResult::parseXML(): Unhandled nodename " + xml.nodeName);
		}
	}
	
	
	this.toJSON = function()
	{
		// TODO
		console.warn("skipping encoding of stanzaSaslResult");
		return "< not encoding stanzaSaslResult >";
	}	
}
