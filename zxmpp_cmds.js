/* -*- Mode: Javascript; indent-tabs-mode: t; tab-width: 4 -*- */
/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2019 Ivan Vucica
 * License is located in the LICENSE file
 * in Z-XMPP distribution/repository.
 * Use not complying to those terms is a
 * violation of various national and
 * international copyright laws.
 */
 
// storage for ad-hoc commands (XEP-0050) on a single jid
//
// interaction implementation in extensions/xep-0050-ad-hoc-commands.js.
// this will require zxmpp_xep0050_init() to be called first.
// this requires zxmpp_xep0050_*() functions to be made available.
zxmppClass.prototype.cmds = function(zxmpp)
{
	this.zxmpp = zxmpp;
 	this.type = "cmds";

	this.ownerJid = false; // full jid

	// Prerequisite: caps should contain <feature var='http://jabber.org/protocol/commands'/>
	this.discoverCommands = function zxmppCmds_discoverCommands()
	{
		var presence = this.zxmpp.getPresence(this.ownerJid);
		if (!presence.caps.supports("http://jabber.org/protocol/commands"))
		{
			zxmppConsole.log("No announced support for commands in " + this.ownerJid)
			return;
		}
		zxmppConsole.log("Asking " + this.ownerJid + " about commands");
		zxmpp_xep0050_cmdlist(this.zxmpp, this.ownerJid, function zxmppCmds_cmdlistList(response_iq) {
			console.log("got cmd list");
		}, function zxmppCmds_cmdlistError(response_iq) {
			console.log("got cmd error");
		})
	}

	this.toJSON = function zxmppCmds_toJSON(key)
	{
		zxmppConsole.log("zxmppCmds_toJSON()");
		var oldzxmpp = this.zxmpp;
		var oldtojson = this.toJSON; // firefox4 beta7; when we return cloned, cleaned copy of this object, it attempts to stringify once again using this same function, causing this.zxmpp to be undefined. we need to remove the function too
		delete this.zxmpp;
		delete this.toJSON;
		
		var ret = oldzxmpp.util.cloneObject(this);
		
		this.zxmpp = oldzxmpp;
		this.toJSON = oldtojson;

		this.zxmpp.util.describeWhatCantYouStringify("zxmppCaps_toJSON()", ret)
		return ret;
	}

};

