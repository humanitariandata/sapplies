# sApplies

sApplies helps organizers of relief efforts during disaster recovery to manage needs donations of residents a relief operation supported by a Facebook-page.

The developed prototype consists of a few components. First, a Facebook page tab app to help and guide suppliers on the Facebook page of the relief initiative to offer their help. Second, the web app that allows the initiator of the relief effort to connect the Facebook page tab app to the relief effort’s Facebook-page. Through this web app an initiator can also add (specified) requests for help which will be shown in the Facebook page tab app.
This way the visitors of the Facebook-page are able to offer their help in a structured way. The initiator of the action and related Facebook page, is able to manage needs and incoming offers using the web app.

### Prototype

Components:

* Facebook-app which can be linked to a Facebook-page for submitting supplies or services by the responding community.
* A webapp to manage needs and offers.
* A RESTful API for exchanging data between the Facebook-app and the web-app

### Installation

Before installing dependencies, make sure you have installed [NodeJS](http://nodejs.org/) and [MongoDB](http://www.mongodb.com/).

#### Dependencies

__For production purpose on the red cross server, the dependencies are already included in this repository. If you still want to maintain or update you can do so:__

Install server dependencies
```
$ npm install
```

Install (front-end) dependencies of the web app by going into the /app folder. Make sure you have installed [bower package manager](http://bower.io).
```
$ cd app
$ bower install
```

Install (front-end) dependencies of the Facebook-app by going back to the /fb folder

```
$ cd ../fb
$ bower install
```

### Run

```
$ sudo grunt
```

By default the web app is running at:
```
http://localhost:3001/
```

The Facebook app is running at:
```
http://localhost:3001/fb
```