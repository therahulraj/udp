const socket = io();

let devices = [];
let nodes = [];
let structure = [];
let placeNames = [];


const devices_element = document.querySelector(".devices").children;
const placeNames_element = document.querySelector('.place-names');
const roomNames_element = document.querySelector('.room-names');

const user = JSON.parse(localStorage.getItem('user'))
const token = localStorage.getItem('token')
let selected_place_name = ''
let selected_room_name = ''
const devices_div = document.querySelector('.devices');


console.log(user, token)

socket.emit('join', { token }, (error) => {

    if (error) {
        alert(error)
        console.log(error)
        
    } else {

        socket.on('setupValue', (data) => {

            console.log(data);
            structure = []
            devices = data.devices;
            nodes = data.nodes;


            // structuring data

            for (let i = 0; i < devices.length; i++) {
                
                let samePlaceNameIndex = -1;

                samePlaceNameIndex = structure.findIndex((struct) => {
                    return struct.placeName == devices[i].placeName
                })

                if (samePlaceNameIndex > -1) {
                    structure[samePlaceNameIndex].devices.push({
                        deviceId: devices[i].deviceId,
                        deviceName: devices[i].deviceName,
                        nodesCount: devices[i].nodesCount,
                        nodes: []
                    })
                } else {
                    structure.push({
                        placeName: devices[i].placeName,
                        rooms: [],
                        devices: [{
                            deviceId: devices[i].deviceId,
                            deviceName: devices[i].deviceName,
                            nodesCount: devices[i].nodesCount,
                            nodes: []
                        }]
                    })
                    
                }
            }

            console.log(structure)

            for (let i = 0; i < nodes.length; i++) {

                let placeNameIndex = -1;

                console.log(placeNameIndex, 'before place')

                placeNameIndex = structure.findIndex((struct) => {
                    console.log(nodes[i].placeName, struct.placeName)
                    return struct.placeName == nodes[i].placeName
                    
                })

                console.log(placeNameIndex, 'after place')
                

                if (placeNameIndex > -1) {

                    let deviceIndex = -1;
                    let roomNameIndex = -1;

                    console.log(deviceIndex, 'before deviceIndex')

                    deviceIndex = structure[placeNameIndex].devices.findIndex((device) => {
                        console.log(device.deviceId, nodes[i].deviceId, 'findPlaceName')
                        return device.deviceId == nodes[i].deviceId
                    })

                    console.log(deviceIndex, 'after deviceIndex')

                    if (deviceIndex > -1) {

                        // console.log(structure[placeNameIndex])
                        // console.log(deviceIndex)

                        // console.log(structure[placeNameIndex].devices[deviceIndex])
                        structure[placeNameIndex].devices[deviceIndex].nodes.push({
                            placeName: nodes[i].placeName,
                            deviceId: nodes[i].deviceId,
                            roomName: nodes[i].roomName,
                            deviceName: nodes[i].deviceName,
                            nodeName: nodes[i].nodeName,
                            index: nodes[i].index
                        })

                    }

                    roomNameIndex = structure[placeNameIndex].rooms.findIndex((room) => {
                        return room.roomName = nodes[i].roomName
                    })

                    if (roomNameIndex > -1) {
                        structure[placeNameIndex].rooms[roomNameIndex].nodes.push({
                            placeName: nodes[i].placeName,
                            deviceId: nodes[i].deviceId,
                            roomName: nodes[i].roomName,
                            deviceName: nodes[i].deviceName,
                            nodeName: nodes[i].nodeName,
                            index: nodes[i].index,
                            state: nodes[i].state,
                            speed: nodes[i].speed
                        })
                    } else {
                        structure[placeNameIndex].rooms.push({
                            roomName: nodes[i].roomName,
                            nodes: [{
                            placeName: nodes[i].placeName,
                            deviceId: nodes[i].deviceId,
                            roomName: nodes[i].roomName,
                            deviceName: nodes[i].deviceName,
                            nodeName: nodes[i].nodeName,
                            index: nodes[i].index,
                            state: nodes[i].state,
                            speed: nodes[i].speed
                            }]
                        })
                    }
                }
            }
            
            console.log(structure)

            // structuring data

            displayAllDevices()

            //structuring place names
            placeNames_element.innerHTML = '';
            for (let i = 0; i < structure.length; i++) {
                let opt = document.createElement('option');
                opt.appendChild( document.createTextNode(structure[i].placeName));
                opt.value = structure[i].placeName;
                placeNames_element.appendChild(opt);
            }


            //structuring room names

            selected_place_name = placeNames_element.value; 
            // console.log(selected_place_name);
            displayRooms()

            
        })

        // socket.on('setup')



        socket.on('unUpdatedValue', (data) => {

            //just restore to the previous state.

            // data = data.split(",")

            // const inc_device_index = parseInt(data[0]);

            // const prev_device = devices.find((device, index) => {
            //     return device.index == inc_device_index;
            // })

            // if (prev_device) {
            //     devices_element[inc_device_index].querySelector(".toggle-on-off").checked = prev_device.state;
            //     devices_element[inc_device_index].querySelector(".range-slider").value = prev_device.speed;

            // } else {
            //     //this also needs to be removed once the view is adjusted.
            //     //the data will be updated only for those whose view are present.
            //     devices_element[inc_device_index].querySelector(".toggle-on-off").checked = false;
            //     devices_element[inc_device_index].querySelector(".range-slider").value = 0;

            //     alert(`${inc_device_index} no such device was added.`)

            // }

        })


        console.log(devices_div.children)

        socket.on('updatedValue', (node_state, node_device_id) => {

            node_state = node_state.split(",");
            console.log(node_state, node_device_id)

            const inc_device_index = parseInt(node_state[0]);
            const inc_device_state = parseInt(node_state[1]);
            const inc_device_speed = parseInt(node_state[2]);

            // console.log(data);
            for (let i = 0; i < structure.length; i++) {
                for (let j = 0; j < structure[i].rooms.length; j++) {
                    console.log(structure[i].rooms[j])
                    for (let k = 0; k < structure[i].rooms[j].nodes.length; k++) {
                        if (structure[i].rooms[j].nodes[k].deviceId == node_device_id && structure[i].rooms[j].nodes[k].index == inc_device_index) {
                            structure[i].rooms[j].nodes[k].state = inc_device_state;
                            structure[i].rooms[j].nodes[k].speed = inc_device_speed;
                        }
                    }
                }
            }

            console.log(structure)

            console.log(devices_div.children)

            for (let i = 0; i < devices_div.children.length; i++) {

                console.log(devices_div.children[i].dataset);

                if (devices_div.children[i].dataset.id == node_device_id && devices_div.children[i].dataset.index == inc_device_index) {
                    devices_div.children[i].dataset.prev = `${inc_device_state},${inc_device_speed}`;
                    if (inc_device_state) {
                        devices_div.children[i].querySelector('.toggle-on-off').checked = true;
                    } else {
                        devices_div.children[i].querySelector('.toggle-on-off').checked = false;
                    }

                    devices_div.children[i].querySelector('.range-slider').value = inc_device_speed
                    
                }

            }

            // let single_device_value = data.split(",");

            


            // let prev_device_index = undefined;

            // const prev_device = devices.find((device, index) => {
            //     prev_device_index = index;
            //     return device.index == inc_device_index;
            // })

            

            // if (prev_device) {

            //     devices.splice(prev_device_index, 1, {
            //         index: inc_device_index,
            //         state: inc_device_state,
            //         speed: inc_device_speed
            //     })

            //     current_device_state = devices_element[inc_device_index].querySelector(".toggle-on-off").checked == true ? 1 : 0;
            //     current_device_speed = devices_element[inc_device_index].querySelector(".toggle-on-off").speed;

            //     if (current_device_state == inc_device_state && current_device_speed == inc_device_speed) {

            //         alert(`${inc_device_index} operation successful`)

            //     } else {

            //         alert(`${inc_device_speed} operation not successful`)

            //     }

            //     devices_element[inc_device_index].querySelector(".toggle-on-off").checked = inc_device_state;
            //     devices_element[inc_device_index].querySelector(".range-slider").value = inc_device_speed;

            // } else {

            //     //the whole else needed to be removed.
            //     //remember to remove this push when there is prevDevice is not present. 
            //     //because the device should not send the data for that device if the device is not added by the user.

            //     devices.push({
            //         index: inc_device_index,
            //         state: inc_device_state,
            //         speed: inc_device_speed
            //     })

            //     devices_element[inc_device_index].querySelector(".toggle-on-off").checked = inc_device_state;
            //     devices_element[inc_device_index].querySelector(".range-slider").value = inc_device_speed;

            //     alert(`${inc_device_index} new operation successful`)

            // }

            // console.log(devices);    
        })
    }
})


function displayRooms() {

    let child = roomNames_element.lastElementChild;
    while(child) {
        roomNames_element.removeChild(child)
        child = roomNames_element.lastElementChild;
    }
    for (let i = 0; i < structure.length; i++) {
        if (selected_place_name === structure[i].placeName) {
            for (let j = 0; j < structure[i].rooms.length; j++) {
                let div = document.createElement('div');
                div.appendChild(document.createTextNode(structure[i].rooms[j].roomName))
                div.onclick = roomNameClicked
                roomNames_element.appendChild(div)
            }
        }          
    }

    if(roomNames_element.firstChild) {
        selected_room_name = roomNames_element.firstChild.innerHTML;
        displayNodes()
    } else {
        devices_div.innerHTML = ``;
    }



}

function placeNameChanged(this_element) {
    selected_place_name = this_element.value;
    displayRooms();
}

function displayNodes() {

    devices_div.innerHTML = ``;
    let checked = false

    for (let i = 0; i < structure.length; i++) {
        if(structure[i].placeName === selected_place_name) {
            for (let j = 0; j < structure[i].rooms.length; j++) {
                if (selected_room_name === structure[i].rooms[j].roomName) {
                    console.log(structure[i].rooms[j].nodes);
                    for (let k = 0; k < structure[i].rooms[j].nodes.length; k++) {

                        if (structure[i].rooms[j].nodes[k].state) {
                            checked = true
                        } else {
                            checked = false
                        }
                        
                        devices_div.innerHTML += `
                        <div class="text-center my-3 device" data-prev=${structure[i].rooms[j].nodes[k].state},${structure[i].rooms[j].nodes[k].speed} data-id=${structure[i].rooms[j].nodes[k].deviceId} data-index=${structure[i].rooms[j].nodes[k].index}>
                        <p>device: ${structure[i].rooms[j].nodes[k].deviceId} : ${structure[i].rooms[j].nodes[k].deviceName}<br>
                        nodeName: ${structure[i].rooms[j].nodes[k].nodeName} : ${structure[i].rooms[j].nodes[k].index}</p>
                        <label class="switch">
                            <input type="checkbox" class="toggle-on-off" onclick="onSwitchClick(event)" ${structure[i].rooms[j].nodes[k].state == 1 ? "checked" : ""}>
                            <span class="on-off-slider round"></span>
                        </label>
                        <input type="range" min="0" max="10" value=${structure[i].rooms[j].nodes[k].speed} class="range-slider" onchange="onRangeChange(event)">
                        </div>
                        `;
                    }
                }
            }
        }
    }

}

function roomNameClicked(event) {

    console.log(event.target.innerHTML)
    selected_room_name = event.target.innerHTML;

}

function displayAllDevices() {
    allDevicesDiv = document.querySelector('.all-devices')
    allDevicesDiv.innerHTML = '';
    for (let i = 0; i < structure.length; i++) {
        for (let j = 0; j < structure[i].devices.length; j++) {
            
            
            allDevicesDiv.innerHTML += `
                        <div class="mt-4 p-3 single-device">
                        <p>placeName: ${structure[i].placeName}<br>
                        device details: ${structure[i].devices[j].deviceId} : ${structure[i].devices[j].nodesCount}<br>
                        deviceName: ${structure[i].devices[j].deviceName}
                        </p>
                        </div>`
            for (let k = 0; k < structure[i].devices[j].nodes.length; k++) {

                allDevicesDiv.innerHTML += `
                        <div class="mt-2 p-2 single-node">
                        <p>node details: ${structure[i].devices[j].nodes[k].nodeName} : ${structure[i].devices[j].nodes[k].index} <br>
                        roomName: ${structure[i].devices[j].nodes[k].roomName}</p>
                        </div>`

            }

        }
    }
}

function onRangeChange(event) {

    const element = event.target;
    const element_value = element.value;
    const parent_element = event.target.parentElement;

    if (element_value > 0) {
        parent_element.querySelector('.toggle-on-off').checked = true;
    } else {
        parent_element.querySelector('.toggle-on-off').checked = false;
    }

    console.log(`${parent_element.dataset.index},${parent_element.querySelector('.toggle-on-off').checked == true ? 1 : 0},${element_value}`)

    let node_state = `${parent_element.dataset.index},${parent_element.querySelector('.toggle-on-off').checked == true ? 1 : 0},${element_value}`;





    socket.emit('updateValue', {node_state, node_device_id: parent_element.dataset.id}, (error) => {

        if (error) {
            alert(error)
            console.log(error)
            const prev = parent_element.dataset.prev.split(",")
            const prev_state = parseInt(prev[0])
            const prev_speed = parseInt(prev[1])
            if (prev_state) {
                parent_element.querySelector('.toggle-on-off').checked = true;
            } else {
                parent_element.querySelector('.toggle-on-off').checked = false;
            }
            parent_element.querySelector('.range-slider').value = prev_speed;
        }
    });
}


function onSwitchClick(event) {


    const element = event.target;
    const parent_element = event.target.parentElement.parentElement;
    event.target.parentElement.parentElement.dataset.wait = "true";
    console.log(event.target.parentElement.parentElement)
    console.log(parent_element.dataset)
    console.log(parent_element.dataset.id)
    console.log(parent_element.dataset.index)
    
    // console.log(element.data-)
    const element_checked = element.checked;
    // parent_parent_previous_element = element.parentElement.parentElement.previousElementSibling;
    // count_index = 0
    // while (parent_parent_previous_element) {
    //     parent_parent_previous_element = parent_parent_previous_element.previousElementSibling;
    //     count_index++;
    // }

    let element_range = 0
    if (element_checked) {
        element.parentElement.parentElement.querySelector('.range-slider').value = 10;
        element_range = 10;
    } else {
        element.parentElement.parentElement.querySelector('.range-slider').value = 0;
    }

    

    // console.log(`${count_index},${element.checked == true ? 1 : 0},${element_range}`);


    let node_state = `${parent_element.dataset.index},${element.checked == true ? 1 : 0},${element_range}`;
    // let node_device_id = `12345678`;
    console.log(node_state)

    socket.emit('updateValue', {node_state, node_device_id: parent_element.dataset.id}, (error) => {
        if (error) {
            alert(error)
            console.log(error)
            const prev = parent_element.dataset.prev.split(",")
            const prev_state = parseInt(prev[0])
            const prev_speed = parseInt(prev[1])
            if (prev_state) {
                parent_element.querySelector('.toggle-on-off').checked = true;
            } else {
                parent_element.querySelector('.toggle-on-off').checked = false;
            }
            parent_element.querySelector('.range-slider').value = prev_speed;
        }
    })
}


function onAddDevice() {
    let addDeviceData = { 
        deviceId: document.querySelector(".deviceId").value,
        placeName: document.querySelector(".placeName").value,
        deviceName: document.querySelector(".deviceName").value
    }
    console.log(addDeviceData)

    socket.emit('addDevice', addDeviceData, (error) => {
        if (error) {
            console.log(error);
            alert(error);
        }
    })
}

function onAddNode() {
    let addNodeData = {
        deviceId: document.querySelector(".nodeDeviceId").value,
        roomName: document.querySelector(".roomName").value,
        nodeName: document.querySelector(".nodeName").value,
        index: document.querySelector(".index").value
    }
    console.log(addNodeData);

    socket.emit('addNode', addNodeData, (error) => {
        if(error) {
            console.log(error)
            alert(error)
        }
    })
}







