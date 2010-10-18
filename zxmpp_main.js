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
	
}

zxmppClass.prototype.init = function(uiOwner, configDict)
{
	/****************************
	 * store received variables *
	 ****************************/
	this.uiOwner = uiOwner; // html element that will serve as ZXMPP UI's root
	this.cfg = configDict; // configuration
	
	
	/****************
	 * client state *
	 ****************/
	this.presences= {};
	
}

zxmppClass.prototype.setUsername = function(username)
{
	this.username = username;
	this.bareJid = username + "@" + this.cfg["server"];
	this.presences[this.bareJid] = {};
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

zxmppClass.prototype.getPresence = function(fullJid)
{
	var jid = fullJid.split("/");
	var bareJid = jid[0];
	var resource = jid[1];
	
	if(!this.presences[bareJid])
		this.presences[bareJid] = {};
	if(this.presences[bareJid][resource])
		return this.presences[bareJid][resource]; // already exists, do nothing
		
	var presence = new this.presence(this);
	presence.fullJid = fullJid;
	presence.bareJid = bareJid;
	presence.resource = resource;
	
	this.presences[bareJid][resource] = presence;
	
	return presence;
}
zxmppClass.prototype.removePresence = function(fullJid)
{
	// TODO
}

zxmppClass.prototype._debugDumpPresences = function()
{
	console.log(" ");
	console.log("======= PRESENCES ======== ");
	for(var bareJid in this.presences)
	{
		console.log(bareJid);
		var resources = this.presences[bareJid];
		for(var resource in resources)
		{
			console.log(" " + resource);
		}
	} 
	console.log(" ");
}

zxmppClass.prototype._debugDumpStreamFeatures = function()
{
	console.log(" ");
	console.log("======= STREAM:FEATURES ======== ");
	for(var xmlns in this.stream.features)
	{
		console.log(xmlns);
		var nodes = this.stream.features[xmlns];
		for(var node in nodes)
		{
			console.log(" " + node);
		}
	} 
	console.log(" ");
}

