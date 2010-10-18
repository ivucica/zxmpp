/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */
 
function zxmppClass() 
{
	// Setup session-specific singletons
	
	// this.util, this.stream, etc, are classes.
	// We need instances of these classes that know
	// who their creator (this) is.
	// Let's replace classes with their instances.
	 
	this.util = new this.util(this);
	this.stream = new this.stream(this);
	
	// supported auth mechanisms
	this.saslMechanisms = {};

}

zxmppClass.prototype.init = function(uiOwner, configDict)
{
	/****************************
	 * store received variables *
	 ****************************/
	this.uiOwner = uiOwner; // html element that will serve as ZXMPP UI's root
	this.cfg = configDict; // configuration
	
}

zxmppClass.prototype.setUsername = function(username)
{
	this.username = username;
	this.bareJid = username + "@" + this.cfg["server"];
}
zxmppClass.prototype.setPassword = function(password)
{
	this.password = password;
}

zxmppClass.prototype.main = function(uiOwner, configDict, username, password)
{	
	this.init(uiOwner, configDict);
	
	this.setUsername(username);
	this.setPassword(password);
	
	this.stream.establish();	
}
