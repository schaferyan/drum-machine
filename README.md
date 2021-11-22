# drum-machine
A simple drum machine built with React using the Create React App toolchain. The samples were found at sampleswap.org, and are played via urls. I intitially completed this project  on Codepen.io as part of the FreeCodeCamp Frontend Libraries Certificate, but I decided it merited further experimentation so I implemented it locally using Create React App.
<br>
<br>
![screenshot of react drum machine in browser](https://github.com/schaferyan/drum-machine/blob/master/screenshots/Screenshot%20(838).png)


## Getting Started
1. Clone or download the repository. Open a command prompt and `CD` into the project folder
2. You will need to install/update npm if you have not already - use `sudo apt-get install npm` (or `npm install` if you are using Windows)
3. Run `npm start` - the application should open in a browser window. If not, open http://localhost:3000/ manually.

## Known Issues

### Latency
Depending on your system information and web browser, you may experience significant latency. For the time being I don't recommend using Firefox. If the delay time between hit a key and hearing the sound is making the drum machine unplayable, try using Brave or Edge for a better experience. I'm planning to migrate to the Web Audio API soon, which should improve timing and latency issues. 

## Plans for Future Updates
I intend to add a few more sound banks and a control element for cycling through them. I'd also like to add an interface that allows users to create their own soundbank by entering custom urls. I'm also considering adding recording and/or step sequencer functionality.

## Modifying this Project
This project was built by modifying the Create React App template. If you want to make changes to it there are a few things to be aware of. From the Create React App documentation pages:

>For the project to build, these files must exist with exact filenames:

>    public/index.html is the page template;
>    src/index.js is the JavaScript entry point.

>You can delete or rename the other files.

A few other commands you may find useful are `npm test` for testing and `npm run build` if you want to produce a deployable build

For more information about the Create React App toolchain refer to the documentation at https://create-react-app.dev/
