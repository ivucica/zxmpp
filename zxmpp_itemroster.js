/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */
 
// a class representing a single item on roster
zxmppClass.prototype.itemRoster = function (zxmpp)
{
	this.zxmpp = zxmpp;
	this.classType = "itemRoster";

	this.bareJid = false;
	this.name = false;
	this.subscription = false;
	this.ask = false;
	this.groups = [];

	this.parseXML = function(xml){
		this.zxmpp.util.easierAttrs(xml);

		this.bareJid = xml.attr["jid"]; // required. user's bare jid
		this.name = xml.attr["name"]; // roster nickname, optional!
		this.ask = xml.attr["ask"]; // if ask="subscribe", we sent the request... but it's optional.
		this.subscription = xml.attr["subscription"]; // state of subscription.

/*
subscription (from rfc3921 7.1):
"none" -- the user does not have a subscription to the contact's presence information, and the contact does not have a subscription to the user's presence information
"to" -- the user has a subscription to the contact's presence information, but the contact does not have a subscription to the user's presence information
"from" -- the contact has a subscription to the user's presence information, but the user does not have a subscription to the contact's presence information
"both" -- both the user and the contact have subscriptions to each other's presence information

also:
subscription "remove" is sent and received when we're supposed to REMOVE a contact from our roster
*/

		console.log("Roster: " + this.bareJid);
		console.log(" " + this.zxmpp.util.serializedXML(xml));
		
		for(var i in xml.childNodes)
		{
			var child = xml.childNodes[i];
			if(!child || !child.nodeName) continue;

			switch(child.nodeName)
			{
				case "group":
				if(!child.firstChild)
				{
					// TODO what should we do?
				}
				else
				{
					this.groups.push(child.firstChild.nodeValue);
					console.log(" group: " + child.firstChild.nodeValue);
				}
				break;

				default:
				console.warn("zxmpp::itemRoster::parseXML(): unknown child " + child.nodeName);
				break;
			}
		}
	}
}
