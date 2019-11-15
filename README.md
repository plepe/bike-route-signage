# bike-route-signage
A proposal for new bike route signs for Vienna, inspired by "Totem style" sign ins London.

A route is defined by a simple YAML file. This application renders how a sign would look like at a speciific location along this route. With the menu and the map you can move to different locations to see how the signage would change along the route.

There's also an editor included. You can download the modified file.

The route data for bike-route-signage is maintained in a separate repository: https://github.com/plepe/bike-route-signage-wien

## Installation
For running bike-route-signage yourself, you need:
* [Node.js](https://nodejs.org/)
* [git](https://git-scm.com/)

Open a Terminal and run:
```sh
git clone https://github.com/plepe/bike-route-signage
cd bike-route-signage
git clone https://github.com/plepe/bike-route-signage-wien data/
npm install
npm run start
```

Open a browser, go to http://localhost:8080

### Usage with Apache as backend
If you want to use Apache as backend, you have to enable the 'cgi' module. Then you can add a `.htaccess` file in the current directory:

```htaccess
Options +ExecCGI
AddHandler cgi-script .cgi
DirectoryIndex index.cgi
```
