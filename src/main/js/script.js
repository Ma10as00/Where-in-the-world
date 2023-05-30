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
        coordinates: [latitude, longitude]
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

        /** Splits the text-input by the separator ',' and returns the components in an array */
        getComponents: function(){
            return this.text.split(','); 
        },

        /** Checks if the input text is entirely numeric, except for spaces ' ' and commas ','.*/
        isNumeric: function(){
            let isNum = true;
            //Split string into components
            let parts = this.getComponents();
            for(let i = 0; i < parts.length; i++){
                const part = parts[i];
                //Check if each part is numeric
                isNum = (!isNaN(part) && !isNaN(parseFloat(part)));
                if (!isNum){
                    break; //Found non-numeric part
                }
            }
            return isNum;
        },

        /* Creates a Position based on this processor's current data. */
        createPos: function(){
            return new Position(this.latitude, this.longitude, this.name);
        },

        /** Creates a geoJSON position out of the processed text input. */
        read: function(){
            let parts = this.getComponents();

            if (this.isNumeric(this.text)){
                console.log('input was numeric');
                if (parts.length == 2){
                    this.latitude = parts[0];
                    this.longitude = parts[1];
                }else{
                    console.error("Too many numbers in this string. Can't create Position.");
                }
            }else{
                console.log('input was not numeric');
                console.log(parts);
                for(let i = 0; i < parts.length; i++){
                    let part = parts[i];
                    if(i<2){
                        let [value, direction] = part.split(' ');
                        value = parseFloat(value);
                        switch (direction) {
                            case 'N':
                                this.latitude = value;
                                break;
                            case 'E':
                                this.longitude = value;
                                break;
                            case 'W':
                                this.longitude = -value;
                                break;
                            case 'S':
                                this.latitude = -value;
                                break;
                            default:
                                if(i == 0){
                                    this.latitude = value;
                                }
                                if(i==1){
                                    this.longitude = value;
                                }
                                break;
                        }
                    }
                    //Name
                    if(i == 2){
                        this.name = part;
                    }
                    //Ignore the rest of the input
                }
            }
        }
    }
}