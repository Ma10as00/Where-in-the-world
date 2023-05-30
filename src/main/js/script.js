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
function posStr(){
    return JSON.stringify(positions, null, 2);
}

/**Function to create the new geoJSON-file. */ 
function createFile() {
    const fileContent = posStr();
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

function updateDisplayedJSON(){
    displayedJSON.innerHTML = '<pre>' + posStr() + '</pre>';    //The <pre> is to keep the formatting nice on the html-page
}

/** The function that processes the text input from the user.
 *  This is called if the user presses the 'OK'-button on the screen,
 *  or press 'enter' on their keyboard.
 */
function readText(){
    processor = createTextProcesser(input);
    processor.read();
    pos = processor.createPos();
    positions.features.push(pos);
    console.log("Added to positions: " + pos);
    input.value = '';
    updateDisplayedJSON();
}

/** Redirects the user to the website 'geojson.io', where the positions are displayed on a map. */
function openMap() {
    let webpage = 'http://geojson.io/#data=data:application/json,';
    let posData = encodeURIComponent(posStr());
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
            //format numbers into 6 digits after decimal point:
            this.latitude = this.latitude.toFixed(6);
            this.longitude = this.longitude.toFixed(6);
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

        /** Creates a geoJSON position out of the processed text input. */
        read: function(){
            let parts = this.getComponents();
            console.log(parts);
            let interpreter = '';               //Will say have values '', 'N', 'E', 'W' or 'S'.
            let registeredNumber = undefined;   //To get the order of the coordinates right
            let registeredNumbers = 0;

            for(let i = 0; i < parts.length; i++){
                let part = parts[parts.length - 1 - i]; //Go backwards through input
                switch (part) {
                    //If part is NEWS, change interpreter and resolve registered number
                    case 'N':
                        interpreter = 'N';
                        if(registeredNumbers == 1){
                            this.longitude = registeredNumber;  //The other number must be longitude
                            registeredNumbers++;
                        }
                        break;
                    case 'E':
                        interpreter = 'E';
                        if(registeredNumbers == 1){
                            this.latitude = registeredNumber;  //The other number must be latitude
                            registeredNumbers++;
                        }
                        break;
                    case 'W':
                        interpreter = 'W';
                        if(registeredNumbers == 1){
                            this.latitude = registeredNumber;  //The other number must be latitude
                            registeredNumbers++;
                        }
                        break;
                    case 'S':
                        interpreter = 'S';
                        if(registeredNumbers == 1){
                            this.longitude = registeredNumber;  //The other number must be longitude
                            registeredNumbers++;
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
                                    this.latitude = part;
                                    interpreter = '';
                                    break;
                                case 'E':
                                    this.longitude = part;
                                    interpreter = '';
                                    break;
                                case 'W':
                                    this.longitude = -part;
                                    interpreter = '';
                                    break;
                                case 'S':
                                    this.latitude = -part;
                                    interpreter = '';
                                    break;
                                default:
                                    //interpreter is empty
                                    //If we already have registered a number
                                    if(registeredNumbers == 1){
                                        this.longitude = registeredNumber;
                                        this.latitude = part;
                                        //All numbers registered after this will be ignored:
                                        registeredNumbers++;
                                    }else if(registeredNumbers == 0){
                                        registeredNumber = part;                                        
                                        registeredNumbers++;
                                    }
                                    break;
                            }
                        }
                        else{   //Part is not NEWS, nor number.
                            this.name = part;   //Assume this is the name
                        }
                        break;
                }
            }
        }
    }
}
