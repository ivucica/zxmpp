# BUGS #

## No user input sanitization ##

User can send whatever we want, and we interpret and just print out whatever we
get. That's doubleplusungood.

Result: how about some javascript sent in a <message><body></body></message>? 
How about breaking the XML?

 - - -

## Callbacks are not wrapped in try/catch ##

If the programmer that maintains the html/javascript that makes use of ZXMPP is 
not extra careful, entire ZXMPP can be brought down by a poorly written 
callback.

Result: make a mistake in main php/html/js file, entire zxmpp connection breaks down

