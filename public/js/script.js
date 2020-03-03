const socket = io();

let currentColor = 'white';
let currentValue = '1';


let slider = document.getElementById("myRange");
let output = document.getElementById("demo");
output.innerHTML = slider.value;



function changeColor(color) {
    if (color != currentColor) {
        socket.emit('updateColor', color)
    }
}

socket.on('currentValues', (values) => {
    console.log(values);
    currentColor = values.color;
    currentValue = values.range;
    output.innerHTML = currentValue;
    document.body.style.backgroundColor = currentColor;
    slider.value = currentValue;
})

slider.addEventListener('change', () => {
    // console.log(this);
    if (currentValue != slider.value) {
        socket.emit('updateRange', slider.value);
    }
    
})
