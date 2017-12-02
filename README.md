# Simple, realtime web app starter project
A foundational project built with Node.js, Express 4, Socket.io, Whiskers, Ava and Proxyquire to help you get started with realtime web apps. It allows you to quickly get going when you want to build a simple web app powered by websockets, which is testable, flexible, and comes with minimal assumptions. Also a great educational project.

## Installation

This app was built and tested on node 6.10, but it should work well on any modern node distribution.

### System Prep

#### Mac Homebrew

Open the `Terminal` app.

If you don't yet have Homebrew:
`/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

Make sure Homebrew is up to date:
`brew update`

Make sure your system is ready for Homebrew:
`brew doctor`

If you haven't already, add `/usr/local/bin` to your PATH variable:
`export PATH="/usr/local/bin:$PATH"`

Install Node
`brew install node`

#### Linux

Install Node
`sudo apt-get install -y nodejs`

### Setting up the project

Check your installed versions:
```
node -v
npm -v
```

Clone this repository:
```
cd <whatever parent directory you want, e.g., ~/Downloads>

git clone https://github.com/j2pnik/simple-realtime-web-app-starter.git web-app-starter

cd web-app-starter 
```

Install project dependencies:
`npm install`

Copy your environment variables:
`cp .env.example .env`

## Running the project

Start the app:
`node index.js`

You should see:
```
Node.js server listening on port 3000
```

In a browser, go to `http://localhost:3000`

## Development

### Getting started

Your starting point is the `index.js` file in the root directory. That's what the node process starts with and it contains code that handles user requests (e.g., visiting from a browser).

### Environment Variables

By using the [dotenv](https://github.com/motdotla/dotenv) package and a `.env` file in the root directory, the app can handle file-based environment variables. This allows:

1. Keeping sensitive information (like API keys and tokens) out of the repository, since the .env file is referenced in `.gitignore`.
2. More flexible multi-server or multi-container deployment and configuration.

Environment variables defined in `.env` are easily accessed using `process.env.VARIABLE_NAME`.

*Note:* Changing, adding, or deleting variables in the `.env` file requires a restart of the running instance:
```
Ctrl+C
node index.js
```

### Templating

HTML in this project is rendered using [Whiskers](https://github.com/gsf/whiskers.js), a very simple templating framework. Check out their docs for ideas.

### Customising

Create more modules in `/app` (or however you want to structure your project).

Add some SQL or NoSQL database support.

Use more and more complex routing.

Experiment with compiling static assets with [webpack](https://webpack.js.org/).

Try [Typescript](https://www.typescriptlang.org/) and [SASS](http://sass-lang.com/).

Go nuts. Do anything. Here's to the crazy ones!

### Testing

`npm test`

## Deployment

Every deployment process and configuration will differ, so this project won't go into specifics. We will, however, touch on one point: launching the app and keeping it running.

This can be easily accomplished with [PM2](https://github.com/Unitech/pm2), a node process monitor, which allows the launched node process to stay running in the background.

Globally install PM2:
`npm install pm2 -g` 

Start the app with PM2:
`pm2 start /path/to/index.js`

Stop the app:
```
pm2 list
pm2 stop <id>
```

That's all!

### Server

It's inevitable that at some point you will build an app that will need to be hosted on a server and available to the public (we recommend [Digital Ocean](https://m.do.co/c/ae07fd955cd3)). Here's a way to get started quickly:

On your Ubuntu (or equivalent) server, first install Nginx:
`sudo apt-get -y nginx`

Now set up a new config file:
`sudo nano /etc/nginx/sites-available/web-app`

Paste the following into that file, changing the server name as appropriate to another domain name (without http://) or an IP. _(If using an IP, note that this assumes no other nginx configurations are set up to be accessed directly via IP.)_
```
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        root /var/www/web-app;

        index index.html index.htm;

        server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save:
```
Ctrl + x

Y
```

Make the new config available:
```
sudo cd /etc/nginx/sites-enabled
sudo ln -s web-app /etc/nginx/sites-available/web-app
```

Add the project files to `/var/www/web-app`, either through a `git checkout` or by uploading the files to the server with `scp`

Make sure the folder has proper permissions:
`sudo chown -R www-data:www-data /var/www/web-app`

Restart nginx:
`sudo service nginx restart`

Start your app either with PM2 `pm2 start /var/www/web-app/index.js` or manually `node /var/www/web-app/index.js`

Visit your server's IP or domain and you should see the app running!