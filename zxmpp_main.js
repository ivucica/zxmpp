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
	this.onRosterUpdate = [];
	this.onMessage = [];
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
	
}

zxmppClass.prototype.setUsername = function(username)
{
	this.username = username;
	this.bareJid = username + "@" + this.cfg["domain"]; 
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
zxmppClass.prototype.getPresencesForBareJid = function(bareJid)
{
	return this.presences[bareJid];
}
zxmppClass.prototype.getTopPresenceForBareJid = function(bareJid)
{
	var topPresence = false;
	var presences = this.presences[bareJid];
	
	if(!presences)
		return false;

	for(var resource in presences)
	{
		var presence = presences[resource];
		if(!topPresence)
		{
			topPresence = presence;
			continue;
		}
		
		if(presence.priority > topPresence.priority)
		{
			topPresence = presence;
		}
	}

	return topPresence;
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
			terminateHandler.func(terminateHandler.context, this, code, humanreadable);
		else
			terminateHandler(this,code,humanreadable);
	}
}

zxmppClass.prototype.notifyPresenceUpdate = function(presence)
{
	for(var presenceHandlerId in this.onPresenceUpdate)
	{
		var presenceHandler = this.onPresenceUpdate[presenceHandlerId];
		if(presenceHandler.func)
			presenceHandler.func(presenceHandler.context, this, presence);
		else
			presenceHandler(this, presence);
	}
}
zxmppClass.prototype.notifyRosterUpdate = function(rosteritem)
{
	
	for(var rosterUpdateHandlerId in this.onRosterUpdate)
	{
		var rosterUpdateHandler = this.onRosterUpdate[rosterUpdateHandlerId];
		if(rosterUpdateHandler.func)
			rosterUpdateHandler.func(rosterUpdateHandler.context, this, rosteritem);
		else
			rosterUpdateHandler(this, rosteritem);
	}
}

zxmppClass.prototype.notifyMessage = function(messageStanza)
{
	
	for(var rosterUpdateHandlerId in this.onMessage)
	{
		var messageHandler = this.onMessage[rosterUpdateHandlerId];
		if(messageHandler.func)
			messageHandler.func(messageHandler.context, this, messageStanza);
		else
			messageHandler(this, messageStanza);
	}
}


zxmppClass.prototype.sendMessage = function(to, body)
{
	this.stream.sendMessage("poll", this.fullJid, to, "chat", body);
}


zxmppClass.prototype.serialized = function()
{
    var out = new Object();
    
    out.presences = this.presences;
    out.capsNodes = this.capsNodes;
    out.capsNodesExt = this.capsNodesExt;
    out.roster = this.roster;
    out.username = this.username;
    out.bareJid = this.bareJid;
    out.fullJid = this.fullJid;
    out.cfg = this.cfg;

    out.stream = this.stream;
    
    var jsonified = JSON.stringify(out);
    
    
    
    

    return jsonified;
}

zxmppClass.prototype.deserializeInternal = function(json)
{
    var zxmppcontext = this;
    var input = JSON.parse(json, function(key, value)
    {
        // "reviver" function
        
        var type;
	//console.log("restoring " + key + " (a " + (typeof value) + ", classtype " + (value.type) + "): " + value);
        if(value && typeof value === "object")
        {
            type = value.type;
            if(typeof type === "string" && typeof zxmppClass.prototype[type] === "function")
            {
                var ret = new zxmppClass.prototype[type](zxmppcontext);
		for(var i in value)
		{
		    ret[i] = value[i];
		}
                return ret;
            }
        }
	return value;
    });
    
    return input;
}

zxmppClass.prototype.deserialize = function(json)
{
    var input = this.deserializeInternal(json);

    this.presences = input.presences;
    this.capsNodes = input.capsNodes;
    this.capsNodesExt = input.capsNodesExt;
    this.roster = input.roster;
    this.username = input.username;
    this.bareJid = input.bareJid;
    this.fullJid = input.fullJid;
    this.cfg = input.cfg;

    this.stream = input.stream;

    this.stream.wakeUp();
}

