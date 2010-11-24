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
 
// a class representing a vcard-temp associated with a presence
zxmppClass.prototype.vCard = function (zxmpp)
{
	this.zxmpp = zxmpp;
	this.type = "vCard";

	this.vcardXML = false;

	this.parseXML = function(xml){
		this.zxmpp.util.easierAttrs(xml);

		this.vcardXML = xml;
	}
	this.toJSON = function(key)
	{
		this.vcardXML = this.zxmpp.util.serializedXML(this.vcardXML);

		oldzxmpp = this.zxmpp;
		delete this.zxmpp;

		var ret = oldzxmpp.util.cloneObject(this);

		this.zxmpp = oldzxmpp;

		doc = this.zxmpp.newXMLDocument("some_tag_name", "vcard-temp");
		doc.laod(this.vcardXML);
		this.vcardXML = doc;
		return ret;
	}
}
