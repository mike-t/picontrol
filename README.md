# PiControl
PiControl™ is a dashboard for managing OpenElec/Kodi based TV controllers over WebSockets.

It is designed for use with TV's operating as electronic signage, digital billboard or a digital kiosk.

We use Raspberry Pi 2 based devices as a cheap and effective controller, but you can use any OpenElec/Kodi supported hardware.

## Features
* Dashboard displaying a screenshot and details of what is playing on each controller.
* Connection handling and auto-reconnect of multiple WebSocket connections.
* Refresh button - reboots the controller.
* Notify button - displays on-screen notification on controller's TV.
* Skip button - plays next item in playlist / skips the current playing item.
* Content recognition - recognises several media types including video, pictures, music and TV and returns details of what is playing.

## Requirements
1. WebSockets enabled on [OpenElec](http://openelec.tv/) or [Kodi](http://kodi.tv/) controller
2. ffmpeg on web server for thumbnails/screenshots
3. PHP 5.5+
4. MySQL 5.5+ database server
5. Suitable web server, we recommend [nginx](http://nginx.org/en/)
6. Browser with [WebSocket support](http://caniuse.com/#feat=websockets)

## Usage
1. Deploy to your favourite web server.
2. Deploy database using the examples/picontrol.sql data and structure file.
3. Create a credentials.php file in the www root (refer to examples/credentials.php.example).

## Screenshot 
![alt text](http://www.thewaltons.com.au/wp-content/uploads/2015/08/picontrol_1.png "PiControl sample dashboard")
