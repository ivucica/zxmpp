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
 
// a class representing a single full-jid's presence
zxmppClass.prototype.presence = function (zxmpp)
{
	this.zxmpp = zxmpp;
	this.type = "presence";

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

	this.toJSON = function(key)
	{
		oldzxmpp = this.zxmpp;
		delete this.zxmpp;

		var ret = oldzxmpp.util.cloneObject(this);
		
		this.zxmpp = oldzxmpp;

		return ret;
	}
}
