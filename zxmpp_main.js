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
	
	// Event handlers
	this.onConnectionTerminate = [];
	this.onPresenceUpdate = [];
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
	this.presences = {};
	this.capsNodes = {};
	this.capsNodesExt = {};
	this.roster = {};
	this.rosterGroups = {};
	
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
	presence.caps.ownerJid = fullJid;
	
	this.presences[bareJid][resource] = presence;
	
	return presence;
}
zxmppClass.prototype.removePresence = function(fullJid)
{
	var jid = fullJid.split("/");
	var bareJid = jid[0];
	var resource = jid[1];

	delete this.presences[bareJid][resource];
	if(this.presences[bareJid].length==0) // FIXME this doesnt seem to work
		delete this.presences[bareJid];
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
			var presence = resources[resource];
			var info = "";
			info += presence.caps.nodeType + " " + presence.caps.nodeCategory + " " + presence.caps.nodeName;
			info += " (";
			for(var feature in presence.caps.features)
			{
				info += feature + ", ";
			}
			info += "that's it)"
			
			
			
			console.log(" " + resource + " - " + info);
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

zxmppClass.prototype.notifyConnectionTerminate = function(code,humanreadable)
{
	for(var terminateHandlerId in this.onConnectionTerminate)
	{
		var terminateHandler = this.onConnectionTerminate[terminateHandlerId];
		if(terminateHandler.func)
			terminateHandler.func(terminateHandler.context,code,humanreadable);
		else
			terminateHandler(code,humanreadable);
	}
}

zxmppClass.prototype.notifyPresenceUpdate = function(presence)
{
	for(var presenceHandlerId in this.onPresenceUpdate)
	{
		var presenceHandler = this.onConnectionTerminate[presenceHandlerId];
		if(presenceHandler.func)
			presenceHandler.func(presenceHandler.context, presence);
		else
			presenceHandler(presence);
	}
}

