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


//Example of how to construct a position, and add it to the list of positions.
let geoEx = new Position(125.6, 10.1, "Dinagat Islands");
positions.features.push(geoEx);
console.log("Added to positions: " + geoEx);

/** Creates a pop-up window with the current geoJSON data. */
function posAlert(){
    alert(JSON.stringify(positions));
}

/**Function to create the new geoJSON-file. */ 
function createFile() {
    const fileContent = JSON.stringify(positions);
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
})

/** Creates an instance of a TextProcessor-object.
 * This object contains a bunch of usefull methods for processing text input.
 */
function createTextProcesser(input){
    return{
        text: input.value,
        latitude: 0,
        longitude: 0,
        name: '',
        /** Checks if the input text is entirely numeric.*/
        isNumeric: function(){
        return (!isNaN(this.text) && !isNaN(parseFloat(this.text)));
        },
        /*
        * Functions for text processing
        *
        *
        * 
        * 
        */

        /** This should only be called if the entire text is numeric.
         *  Returns a list of all the numbers in the text, seperated by " ".
         */
        getNumbers: function(){
            numbers = this.text.split(' ');
            numbers = numbers.map(function(number){   //Changes all the strings to numeric values
                try {
                    return parseFloat(number);
                } catch (error) {
                    console.log("Input to getNumbers was non-numeric.");
                    return NaN;
                }
            });
            numbers = numbers.filter(function(number){
                return !isNaN(number);  //Filters out the invalid values
            });
            return numbers;
        },

        /** Creates a geoJSON position out of the processed text input. */
        createPos: function(){
            if (this.isNumeric){
                numbers = this.getNumbers();
                if (numbers.length == 2){
                    this.latitude = numbers[0];
                    this.longitude = numbers[1];
                    return new Position(this.latitude, this.longitude);
                }else{
                    console.error("Too many numbers in this string. Can't create Position.");
                }
            }else{
                console.error("Can't create Position because text is not numeric");
            }
        },

        /** Returns true if text contains any of the letters, N,E,W or S (The cardinal directions).
         *  Recognizes only uppercase instances.
         */
       containsNEWS: function(){
        return (this.text.includes("N") || this.text.includes("E") || this.text.includes("W") || this.text.includes("S"));
       }
    }
}

/** The function that processes the text input from the user.
 *  This is called if the user presses the 'OK'-button on the screen,
 *  or press 'enter' on their keyboard.
 */
function readText(){
    processor = createTextProcesser(input);
    pos = processor.createPos();
    positions.features.push(pos);
    console.log("Added to positions: " + pos);
}

// Handling the time - functionality -------------------
document.getElementById("time").innerHTML = "Time can be displayed here.";

function displayDate(){
    document.getElementById('time').innerHTML = Date();
}
// -----------------------------------------------------