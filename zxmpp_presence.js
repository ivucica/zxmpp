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
	// * chat
	// * away
	// * xa
	// * dnd
	
	this.status = "";
	
	this.priority = 0;
}