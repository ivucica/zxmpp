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
	this.xml_body.setAttribute('content','text/html; charset=utf-8');

	// parsed stanzas
	this.iq = false;
	this.message = false;
	this.presence;
	
	
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
		this.zxmpp.stream.transmitPacket(outxml);
	}
	
	
	this.parseXML = function(xml)
	{
		
	}
}
