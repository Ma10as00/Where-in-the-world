/* The list of positions given by the user. 
*  This should be written into a new geoJSON-file on the user's request.
*/
let positions = {
    type: "FeatureCollection",
    features: []
};

/** Constructor of a Position-object */ 
function Position(latitude, longitude, name = ""){
    this.type = "Feature";
    this.geometry = {
        type: "Point",
        coordinates: [longitude, latitude]
    };
    this.properties = {
        name: name
    };

    this.toString = function(){
        return name + '   ' + this.geometry.coordinates.toString();
    }
}

/** Returns the string of all the geoJSON-data in positions */
function JSONstr(){
    return JSON.stringify(positions, null, 2);
}

function posStr(){
    let str = '';
    for (let i = 0; i < positions.features.length; i++){
        const position = positions.features[i];
        let longitude = position.geometry.coordinates[0];
        let latitude = position.geometry.coordinates[1];
        const name = position.properties.name;

        //Format numbers to have 6 digits after decimal point:
        longitude = longitude.toFixed(6);
        latitude = latitude.toFixed(6);

        str += latitude + ', ' + longitude + ' ' + name + '\n';
    }
    return str;
}

/**Function to create the new geoJSON-file. */ 
function createFile() {
    const fileContent = JSONstr();
    const fileName = 'geoJSON.txt';
    const blob = new Blob([fileContent], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

//The textbox that the user can write in
const input = document.getElementById('textInput');
//Process textbox if user press 'enter'.
input.addEventListener('keydown', function(event){
    if(event.key == 'Enter'){
        readText();
    }
});

const displayedJSON = document.getElementById("geoJSON");
updateDisplayedJSON();  //Initialize the display of geoJSON data
const displayedPositions = document.getElementById("positions");

function updateDisplayedJSON(){
    displayedJSON.innerHTML = '<pre>' + 'geoJSON data:\n' + JSONstr() + '</pre>';    //The <pre> is to keep the formatting nice on the html-page
}

function updateDisplayedPos(){
    displayedPositions.innerHTML = '<pre>' + posStr() + '</pre>';    //The <pre> is to keep the formatting nice on the html-page
}

/* Clears all data in positions and updates the graphics accordingly. */
function clearData(){
    //Empty positions
    positions.features = [];
    //Update displayed data
    updateDisplayedJSON();
    updateDisplayedPos();
}

/** The function that processes the text input from the user.
 *  This is called if the user presses the 'OK'-button on the screen,
 *  or press 'enter' on their keyboard.
 */
function readText(){
    processor = createTextProcesser(input);
    processor.read();
    pos = processor.createPos();
    if(pos != null){
        positions.features.push(pos);
    }
    console.log("Added to positions: " + pos);
    input.value = '';       //Empty text box
    updateDisplayedJSON();  //Update displayed info
    updateDisplayedPos();
}

/** Redirects the user to the website 'geojson.io', where the positions are displayed on a map. */
function openMap() {
    let webpage = 'http://geojson.io/#data=data:application/json,';
    let posData = encodeURIComponent(JSONstr());
    window.location.href = webpage.concat(posData);
}

/** Creates an instance of a TextProcessor-object.
 *  This object contains a bunch of usefull methods for processing text input
 *  into valid geoJSON data.
 */
function createTextProcesser(input){
    //Defining the TextProcessor's fields and methods
    return{ 
        /** The string that the user inserted in a textbox */
        text: input.value,
        latitude: 0,
        longitude: 0,
        /** The place name. An empty string by default. */
        name: '',

        /* Creates a Position based on this processor's current data. */
        createPos: function(){
            if(this.longitude < -180 || this.longitude > 180){
                alert('Number for longitude is out of range (-180, 180)');
                return;
            }
            if(this.latitude < -90 || this.latitude > 90){
                alert('Number for latitude is out of range (-90, 90)');
                return;
            }
            return new Position(this.latitude, this.longitude, this.name);
        },

        /** Splits the text-input by the separator ',' and returns the components in an array */
        getComponents: function(){
            const separators = /[, ]+/;  //Seperate by commas and spaces
            return this.text.split(separators); 
        },

        /** Checks if the input text is entirely numeric, except for spaces ' ' and commas ','.*/
        isNumeric: function(part){
            return (!isNaN(part) && !isNaN(parseFloat(part)));
        },

        /** Processes the text input, and stores the relevant data in this Text Processor. */
        read: function(){
            this.text = this.text.toUpperCase();
            let parts = this.getComponents();
            console.log(parts);
            let interpreter = '';           //Will have values '', 'N', 'E', 'W' or 'S'.
            let noDirNumber = undefined;    //Number that isn't interpreted to a direction yet
            let noDirNumbers = 0;           //Number of uninterpreted numbers
            let latFound = false;
            let longFound = false;

            for(let i = 0; i < parts.length; i++){

                let part = parts[parts.length - 1 - i]; //Go backwards through input

                if(latFound && longFound){
                    alert("Too much information in the input. \nOnly the two rightmost numbers will be taken into account.");
                    return; //stop reading
                }

                switch (part) {
                    //If part is NEWS, change interpreter and resolve noDirNumber
                    case 'N':
                        interpreter = 'N';
                        if(noDirNumbers == 1){
                            this.longitude = noDirNumber;  //The earlier number must be longitude 
                            noDirNumbers--;
                            longFound = true;   
                        }
                        break;
                    case 'E':
                        interpreter = 'E';
                        if(noDirNumbers == 1){
                            this.latitude = noDirNumber;  //The earlier number must be latitude
                            noDirNumbers--;
                            latFound = true;
                        }
                        break;
                    case 'W':
                        interpreter = 'W';
                        if(noDirNumbers == 1){
                            this.latitude = noDirNumber;  //The earlier number must be latitude
                            noDirNumbers--;
                            latFound = true;
                        }
                        break;
                    case 'S':
                        interpreter = 'S';
                        if(noDirNumbers == 1){
                            this.longitude = noDirNumber;  //The earlier number must be longitude
                            noDirNumbers--;
                            longFound = true;
                        }
                        break;
                    default:
                        //Part was not NEWS
                        //If part is numeric, interpret number and reset interpreter
                        if(this.isNumeric(part)){
                            //parse part as a number
                            part = parseFloat(part);
                            switch (interpreter) {
                                case 'N':
                                    if(latFound) {alert("Input defines more than one latitude.\nOnly the leftmost will be taken into account.")}
                                    this.latitude = part;
                                    latFound = true;
                                    interpreter = '';
                                    break;
                                case 'E':
                                    if(longFound) {alert("Input defines more than one longitude.\nOnly the leftmost will be taken into account.")}
                                    this.longitude = part;
                                    longFound = true;
                                    interpreter = '';
                                    break;
                                case 'W':
                                    if(longFound) {alert("Input defines more than one longitude.\nOnly the leftmost will be taken into account.")}
                                    this.longitude = -part;
                                    longFound = true;
                                    interpreter = '';
                                    break;
                                case 'S':
                                    if(latFound) {alert("Input defines more than one latitude.\nOnly the leftmost will be taken into account.")}
                                    this.latitude = -part;
                                    latFound = true;
                                    interpreter = '';
                                    break;
                                default:
                                    //interpreter is empty
                                    //If we already have found a number, we know the direction
                                    if(latFound){
                                        this.longitude = part;
                                        longFound = true;
                                    }
                                    else if(longFound){
                                        this.latitude = part;
                                        latFound = true;
                                    }
                                    else if(noDirNumbers == 1){
                                        //With two no-direction numbers, the longitude is the rightmost
                                        this.longitude = noDirNumber;
                                        this.latitude = part;
                                        latFound = true;
                                        longFound = true;
                                        noDirNumbers--;
                                    }
                                    else if(noDirNumbers == 0){
                                        //We don't know the direction of this number yet
                                        noDirNumber = part;                                        
                                        noDirNumbers++;
                                    }
                                    break;
                            }
                        }
                        else{   //Part is not NEWS, nor number.
                            if(interpreter != ''){
                                alert("The directional markers 'N', 'E', 'W' and 'S' need numbers in front of them.");
                            }
                            //In case name is more than one word:
                            this.name = part + ' ' + this.name;   //Add this to start of name
                        }
                        break;
                }
            }

            if(!(latFound && longFound)){
                alert("Input was missing latitude or longitude. In its place, 0 will be inserted.");
            }
        }
    }
}
