# Maquereau
**Maquereau** is a tool to let you use your phone as a remote control for multiple applications opened on your desktop. Use your smartphone as a keyboard extension !

## Installation

- Install npm with [Node.js](https://nodejs.org/en/)
- Run `npm install` in the project's root directory

## Usage

- Run the server on your desktop using `node app.js`. The IP address of your desktop is displayed.
- With your smartphone or another device, navigate to the displayed addres at the port `:3000`.
- Use the buttons on your smartphone's screen ! The server detects your active application, and the smartphone displays relevant buttons for that application.

## Compatibility

### Server

The server can run on the following systems :

- Windows 10
- Linux using pretty much any X server

### Programs

The following programs will display buttons for the following applications :

- Chrome, Chromium
- PowerPoint
- Slack
- WebStorm

## License

Maquereau is distributed under [The MIT License](http://opensource.org/licenses/MIT).