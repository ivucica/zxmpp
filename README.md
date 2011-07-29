# Z-XMPP #

For more info, visit <http://ivan.vucica.net/zxmpp/>.

## What is it? ##
This is an implementation of an XMPP client in Javascript. It uses BOSH concept 
of HTTP binding as defined by XEP-0124 and XEP-0206. 

It is a semi-structured hack, assembled not so much as a planned effort by 
a Javascript expert; it's more of a thing that's here just to serve its purpose,
and that purpose is luckily for its internals to be pretty. So hacker: beware!

## Goal ##

Goal is to have a backend library for doing XMPP, and a separate GUI that will
allow attaching an overlay over existing webpage, as well as almost transparent
reconnection upon unloading the page and reloading it.

Another goal is to support major standards-based browsers: Safari, Chrome,
Opera, Firefox.

## Compatibility ##

It is expected that the client will cover at least XEP-0242: XMPP Client
Compliance 2009 Core Client profile. Of course, almost anything goes that
doesn't require out of bound connections (since they're a bit... tricky to do
in Javascript, you'll surely agree).

## License ##

Please read the [LICENSE](LICENSE) to see current use terms.

## Installation ##

To see how to set up `demo.php` to work, and to see how to add Z-XMPP to your
web site, see [README](README.md).

These instructions can, of course, be improved, and the author will be
happy to answer your questions on how to get Z-XMPP to connect to your
XMPP server on your web site.

## Contributing ##

Patches and good natured criticism can be directed to <zxmpp@vucica.net>.

- - -

Copyright 2010 Ivan Vučica

