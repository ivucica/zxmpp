/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Matija Folnovic
 */

zxmppClass.prototype.ui = function() {
	this.bar = undefined,
	this.userlist = undefined,

	this.toString = function() {
		return $('<div class="zxmpp_bar"></div>');
	}

	this.inject = function(where) {
		this.bar = $(this.toString()).appendTo(where);
		this.bar.delegate('.zxmpp_title', 'click', this.changeWindowStatus);
		this.userlist = this.openWindow('Online');
		this.openWindow('bok');
		this.rosterAdded('matija');
		this.rosterAdded('ivucica');
		this.rosterAdded('perica');
		this.rosterAdded('jeej');
		this.adjustWindows();
	}

	this.openWindow = function(title) {
		return $('<div class="zxmpp_window"><div class="zxmpp_content"></div><div class="zxmpp_title">' + title + '</div></div>').appendTo(this.bar);
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

	this.rosterAdded = function(id) {
		this.userlist.children('.zxmpp_content').append('<div class="user' + id + '">' + id + '</div>');
	}

	this.rosterRemoved = function(id) {
		this.userlist.find('.zxmpp_content > .user' + id).remove();
	}
};
