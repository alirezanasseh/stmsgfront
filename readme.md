# Startup Messenger
Startup Messenger is a free messenger written with NodeJs and ReactJs for your company. The current version is only a simple broadcast and supports sending multiline messages and files and shows image previews.
## Installation
1. You need NodeJs to be installed in your system. Download it from [here](https://nodejs.org/en/).
2. Clone and install Startup Messenger Backend from [here](https://github.com/alirezanasseh/stmsgback).
3. Clone this project.
## Initializing
1. Go to project directory and run
```bash
npm install
```
2. Open "config.js" file in the root folder of the project and edit first two lines to your server IP and Port.
```bash
let IP = '192.168.1.27';
let PORT = 8000;
```
## Start Project
For starting project run
```bash
npm start
```
## Build Project
You can build the project and put generated files in your server or host.
```bash
npm run build
```
Then copy files in "Build" folder to your server public html folder.
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
## License
[MIT](https://choosealicense.com/licenses/mit/)