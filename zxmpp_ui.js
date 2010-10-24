/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Matija Folnovic
 */

zxmppClass.prototype.ui = function() {
	this.bar = undefined,
	this.userlist = undefined,

	this.inject = function(where) {
		this.bar = $('<div class="zxmpp_bar"></div>').appendTo(where);
		this.bar.delegate('.zxmpp_title', 'click', this.changeWindowStatus);
		this.userlist = this.openWindow('Online', '_roster');
		/*
		this.openWindow('bok');
		this.rosterAdded('matija');
		this.rosterAdded('ivucica');
		this.rosterAdded('perica');
		this.rosterAdded('jeej');
		*/
		this.adjustWindows();
	}

	this.openWindow = function(title, id) {
		return $('<div class="zxmpp_window" id="zxmpp_window_' + id + '"><div class="zxmpp_content"></div><div class="zxmpp_title"><div>' + title + '</div></div></div>').appendTo(this.bar);
	}

	this.changeWindowStatus = function() {
		$('.zxmpp_content', $(this).parent()).toggle();
	}

	this.adjustWindows = function() {
		var width = 0;

		this.bar.children('div').each(function(i,window) {
			var window = $(window);
			window.css('right', width + 'px').children('*').width(window.width());
			width += window.width();
		});
	}

	this.rosterAdded = function(jid, icon, display, status) {
		var safejid = jid.replace(/[^a-zA-Z 0-9]+/g,'');
		if(!status) 
			status = "";
		this.userlist.children('.zxmpp_content').append('<div class="user' + safejid + ' zxmpp_user zxmpp_status' + icon + '">' + jid + '<div class="zxmpp_statustext">' + status + '</div></div>');
		this.userlist.delegate('.user' + safejid, 'click', this.makeMessageWindow);
	}

	this.rosterRemoved = function(jid) {
		var safejid = jid.replace(/[^a-zA-Z 0-9]+/g,'');
		this.userlist.find('.zxmpp_content > .user' + safejid).remove();
	}

	this.presenceUpdate = function(jid, icon, display, status)
	{
		var safejid = jid.replace(/[^a-zA-Z 0-9]+/g,'');
		var entries = this.userlist.find('.zxmpp_content > .user' + safejid);
		if(!status)
			status = "";

		entries.each(function(i,entry) {
			entry.className="zxmpp_user zxmpp_status" + icon + " user" + safejid;
			entry.innerHTML=display + '<div class="zxmpp_statustext">' + status + '</div>';
		});

	}

	this.showMessage = function(jid, txt) {
		
	}

	this.makeMessageWindow = function(event)
	{
		// FIXME we reference zxmppui!
		
		var jid = this.textContent; // FIXME since jid is not attached to the object, we are currently using button title
		var safejid = jid.replace(/[^a-zA-Z 0-9]+/g,'');

		// FIXME use jquery, not document.getElementById
		if(document.getElementById("zxmpp_window_msg_" + safejid))
			return;

		var msgwin = zxmppui.openWindow(jid, "msg_" + safejid); 

		msgwin.children('.zxmpp_content').append('<input/>');

		zxmppui.adjustWindows();
	}


};
