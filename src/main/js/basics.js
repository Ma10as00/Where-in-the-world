// My first JavaScript code
//Primitive types:
let firstName = "Mosh";
let age = 30;
let isApproved = true;
let name = undefined;
let lastName = null;

console.log(firstName);
const inerestRate = 0.3;

//Reference types
// Object:
let person = {
    name: 'Mosh',
    age: 30
};

//Does the same:
console.log(person.name);
console.log(person['name']);

// Array:
let selectedColors = ['red', 'blue'];
selectedColors[2] = 'green';
selectedColors[3] = 1;
console.log(selectedColors);
console.log(selectedColors.length);

// Function:
function greet(name, last){
    console.log('Hello ' + name + ' ' + last);
}
//function call:
greet('John', 'Smith');

function square(number){
    return number*number;
}

console.log(square(2));

// Handling the time - functionality -------------------
document.getElementById("time").innerHTML = "Time can be displayed here.";

function displayDate(){
    document.getElementById('time').innerHTML = Date();
}
// -----------------------------------------------------


//Example of how to construct a position, and add it to the list of positions.
let geoEx = new Position(125.6, 10.1, "Dinagat Islands");
positions.features.push(geoEx);
console.log("Added to positions: " + geoEx);