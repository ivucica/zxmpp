/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * DOCUMENTATION ON BOSH: http://xmpp.org/extensions/xep-0124.html 
 */
 
zxmppClass.prototype.packet = function (zxmpp)
{
	this.zxmpp = zxmpp;

	// build a document with httpbind namespace, and root element body 
	this.xml = this.zxmpp.util.newXMLDocument("body","http://jabber.org/protocol/httpbind");


	// set default attributes for body, if needed
	// prefer setting them just before sending
	this.xml_body = this.xml.firstChild;

	//example how to set attrib: 
	//this.xml_body.setAttribute('content','text/html; charset=utf-8');

	
	/* functions */
	var iq(idtype, type, to)
	{
		// generate an iq in this packet
		
		var iq = this.xml.createElementNS("jabber:client", "iq");
		iq.setAttribute("id", this.zxmpp.stream.uniqueID(idtype));
		iq.setAttribute("type", type);
		if(to) 
			iq.setAttribute("to", to);
				
		return iq;
	}
}
