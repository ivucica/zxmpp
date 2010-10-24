/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Matija Folnovic
 */

zxmppClass.prototype.ui = function(zxmpp) {
	this.zxmpp = zxmpp;

	this.toString = function() {
		return '<div class="zxmpp_bar">bok</div>';
	}
};
