const socket = io();

let devices = [];

const devices_element = document.querySelector(".devices").children;

const user = JSON.parse(localStorage.getItem('user'))
const token = localStorage.getItem('token')



console.log(user, token)

socket.emit('join', { token }, (error) => {

    if (error) {
        alert(error)
        console.log(error)
        
    } else {

        socket.on('setupValue', (data) => {
            console.log(data);
            devices = data;
            for (let i = 0; i < data.length; i++) {
                devices_element[data[i].index].querySelector(".toggle-on-off").checked = data[i].state;
                devices_element[data[i].index].querySelector(".range-slider").value = data[i].speed;
            }

        })

        socket.on('unUpdatedValue', (data) => {

            //just restore to the previous state.

            data = data.split(",")

            const inc_device_index = parseInt(data[0]);

            const prev_device = devices.find((device, index) => {
                return device.index == inc_device_index;
            })

            if (prev_device) {
                devices_element[inc_device_index].querySelector(".toggle-on-off").checked = prev_device.state;
                devices_element[inc_device_index].querySelector(".range-slider").value = prev_device.speed;

            } else {
                //this also needs to be removed once the view is adjusted.
                //the data will be updated only for those whose view are present.
                devices_element[inc_device_index].querySelector(".toggle-on-off").checked = false;
                devices_element[inc_device_index].querySelector(".range-slider").value = 0;

                alert(`${inc_device_index} no such device was added.`)

            }

        })



        socket.on('updatedValue', (data) => {

            console.log(data);

            // let single_device_value = data.split(",");

            data = data.split(",");

            const inc_device_index = parseInt(data[0]);
            const inc_device_state = parseInt(data[1]);
            const inc_device_speed = parseInt(data[2]);


            let prev_device_index = undefined;

            const prev_device = devices.find((device, index) => {
                prev_device_index = index;
                return device.index == inc_device_index;
            })

            

            if (prev_device) {

                devices.splice(prev_device_index, 1, {
                    index: inc_device_index,
                    state: inc_device_state,
                    speed: inc_device_speed
                })

                current_device_state = devices_element[inc_device_index].querySelector(".toggle-on-off").checked == true ? 1 : 0;
                current_device_speed = devices_element[inc_device_index].querySelector(".toggle-on-off").speed;

                if (current_device_state == inc_device_state && current_device_speed == inc_device_speed) {

                    alert(`${inc_device_index} operation successful`)

                } else {

                    alert(`${inc_device_speed} operation not successful`)

                }

                devices_element[inc_device_index].querySelector(".toggle-on-off").checked = inc_device_state;
                devices_element[inc_device_index].querySelector(".range-slider").value = inc_device_speed;

            } else {

                //the whole else needed to be removed.
                //remember to remove this push when there is prevDevice is not present. 
                //because the device should not send the data for that device if the device is not added by the user.

                devices.push({
                    index: inc_device_index,
                    state: inc_device_state,
                    speed: inc_device_speed
                })

                devices_element[inc_device_index].querySelector(".toggle-on-off").checked = inc_device_state;
                devices_element[inc_device_index].querySelector(".range-slider").value = inc_device_speed;

                alert(`${inc_device_index} new operation successful`)

            }

            console.log(devices);    
        })
    }
})


function onRangeChange(event) {

    const element = event.target;
    const element_value = element.value;
    parent_previous_element = element.parentElement.previousElementSibling;
    count_index = 0;
    while (parent_previous_element) {
        parent_previous_element = parent_previous_element.previousElementSibling;
        count_index++;
    }

    if (element_value > 0) {
        element.parentElement.querySelector('.toggle-on-off').checked = true;
    } else {
        element.parentElement.querySelector('.toggle-on-off').checked = false;
    }

    console.log(`${count_index},${element.parentElement.querySelector('.toggle-on-off').checked == true ? 1 : 0},${element_value}`)


    socket.emit('updateValue', `${count_index},${element.parentElement.querySelector('.toggle-on-off').checked == true ? 1 : 0},${element_value}`, (error) => {

        if (error) {
            alert('error')
            console.log(error)
        }
    });
}


function onSwitchClick(event) {

    const element = event.target;
    const element_checked = element.checked;
    parent_parent_previous_element = element.parentElement.parentElement.previousElementSibling;
    count_index = 0
    while (parent_parent_previous_element) {
        parent_parent_previous_element = parent_parent_previous_element.previousElementSibling;
        count_index++;
    }

    let element_range = 0
    if (element_checked) {
        element.parentElement.parentElement.querySelector('.range-slider').value = 10;
        element_range = 10;
    } else {
        element.parentElement.parentElement.querySelector('.range-slider').value = 0;
    }

    

    console.log(`${count_index},${element.checked == true ? 1 : 0},${element_range}`);
    socket.emit('updateValue', `${count_index},${element.checked == true ? 1 : 0},${element_range}`, (error) => {
        if (error) {
            alert('error')
            console.log(error)
        }
    })
}










