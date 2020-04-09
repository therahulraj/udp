const socket = io();

let all_devices_value = ["0,0", "0,0", "0,0", "0,0"];

const devices = document.querySelector(".devices").children;

const user = JSON.parse(localStorage.getItem('user'))
const token = localStorage.getItem('token')

console.log(user, token)

socket.emit('join', { token }, (error) => {
    if (error) {
        alert(error)
        // location.href = '/'
        
    } else {

        socket.on('setupValue', (data) => {
            console.log(data);
            all_devices_value = data.split(";");
            console.log(all_devices_value);
            for (let i = 0; i < all_devices_value.length; i++) {
                let single_device_value = all_devices_value[i].split(",");
                let single_device_state = parseInt(single_device_value[0]);
                let single_device_speed = parseInt(single_device_value[1]);
                devices[i].querySelector(".toggle-on-off").checked = single_device_state;
                devices[i].querySelector(".range-slider").value = single_device_speed;
            }
        })



        socket.on('updatedValue', (data) => {
            console.log(data);
            let single_device_value = data.split(",");
            let single_device_index = parseInt(single_device_value[0]);
            let single_device_state = parseInt(single_device_value[1]);
            let single_device_speed = parseInt(single_device_value[2]);
        
            all_devices_value[single_device_index] = `${single_device_state},${single_device_speed}`;
            devices[single_device_index].querySelector(".toggle-on-off").checked = single_device_state;
            devices[single_device_index].querySelector(".range-slider").value = single_device_speed;
            console.log(all_devices_value);
        })



    }
})


function onRangeChange(event) {

    console.log(event);

    let element = event.target;
    parent_previous_element = element.parentElement.previousElementSibling;
    count_index = 0
    while (parent_previous_element) {
        parent_previous_element = parent_previous_element.previousElementSibling;
        count_index++;
    }
    event.preventDefault();
    console.log(count_index);
    for (let i = 0; i < devices.length, i < all_devices_value.length; i++) {
        if (count_index == i) {
            let single_device_value = all_devices_value[i].split(",");
            all_devices_value[i] = `${single_device_value[0]},${element.value}`
        }
    }
    console.log(all_devices_value);
    socket.emit('updateValue', `${count_index},${all_devices_value[count_index]}`);
}


function onSwitchClick(event) {
    

    console.log('clicked');

    let element = event.target;
    parent_previous_element = element.parentElement.parentElement.previousElementSibling;
    count_index = 0
    while (parent_previous_element) {
        parent_previous_element = parent_previous_element.previousElementSibling;
        count_index++;
    }
    

    for (let i = 0; i < devices.length, i < all_devices_value.length; i++) {
        if (count_index == i) {
            let single_device_value = all_devices_value[i].split(",");
            if (element.checked) {
                all_devices_value[i] = `1,${single_device_value[1]}`;
            }
            else {
                all_devices_value[i] = `0,${single_device_value[1]}`;
            }
            
        }
    }
    console.log(all_devices_value);
    socket.emit('updateValue', `${count_index},${all_devices_value[count_index]}`)
}










