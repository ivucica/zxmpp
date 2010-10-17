/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * DOCUMENTATION ON BOSH: http://xmpp.org/extensions/xep-0124.html 
 */

zxmppClass.prototype.stream = function (zxmpp)
{
	this.zxmpp = zxmpp;

	/* initialize request id */
	var maxRequestId=9007199254740991; // magic number from xep-0124, max number that some languages can accurately represent
	this.requestId = Math.floor(Math.random()*maxRequestId/2); // div2 so that we dont realistically reach max request id
	
	/* connections and packet queue */
	this.connectionsHold = new Array(); // these are "holding" connections, those that wait for response idly
	this.connectionsPoll = new Array(); // these are "polling" connections, those that are used to send stuff to server
	this.packetQueue = new Array(); // this queue holds packets that we tried to send while we had no free poll slot

	/* set of unique ids that we already used */
	this.uniqueIds = {};

	/* prepare connections */
	this.connectionsHold.push(new XMLHttpRequest());
	this.connectionsPoll.push(new XMLHttpRequest());
	this.connectionsPoll.push(new XMLHttpRequest());
	
	/* state handling functions */
	this.uniqueId = function(idType)
	{
		// return a unique id with type "idType"
		
		var id = 1;
		while(this.uniqueIds["zxmpp" + idType + '_' + id]) // as long as array element is not undefined
		{
			id++;
		}
		this.uniqueIds["zxmpp" + idType + "_" + id]=true;
		return "zxmpp" + idType + "_" + id;
	}
	
	
	/* connection/stream functions */
	this.establish = function()
	{
		var packet = new this.zxmpp.packet(this.zxmpp);
		var body = packet.xml_body;
		
		body.setAttribute('ver','1.6');
		body.setAttribute('wait','60');
		body.setAttribute('xmlns:xmpp','urn:xmpp:xbosh');
		body.setAttribute('xmpp:version','1.0');
		body.setAttribute('hold','1');
		body.setAttribute('secure','false');
		body.setAttribute('to',this.zxmpp.cfg['server']);
		body.setAttribute('route',this.zxmpp.cfg['server'] + ':5222');

		packet.send();
	}
	
	

}