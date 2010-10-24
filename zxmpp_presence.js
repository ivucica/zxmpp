/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */
 
// a class representing a single full-jid's presence
zxmppClass.prototype.presence = function (zxmpp)
{
	this.zxmpp = zxmpp;

	this.fullJid = false;
	this.bareJid = false;
	this.resource = false;
	
	this.show = "unavailable";
	// possible states:
	// * avail (wire: no <show/> defined)
	// * chat
	// * away
	// * xa
	// * dnd
	// * unavailable (wire: type="unavailable")
	
	this.status = "";
	
	this.priority = 0;
	
	this.caps = new this.zxmpp.caps(this.zxmpp);
}