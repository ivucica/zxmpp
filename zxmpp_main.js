/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * DOCUMENTATION ON BOSH: http://xmpp.org/extensions/xep-0124.html 
 */
 
function zxmppClass() 
{
	this.util = new this.util(this);
	this.stream = new this.stream(this);
}

zxmppClass.prototype.init = function(uiOwner, configDict)
{
	/****************************
	 * store received variables *
	 ****************************/
	this.uiOwner = uiOwner; // html element that will serve as ZXMPP UI's root
	this.cfg = configDict; // configuration
}

zxmppClass.prototype.main = function(uiOwner, configDict)
{	
	alert("execing main");
	this.init(uiOwner, configDict);
	
}
