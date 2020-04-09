
const $registerBox = document.querySelector(".register-box")

function onRegister() {
    let registerData = {
        deviceId: document.querySelector(".deviceId").value,
        name: document.querySelector(".name").value,
        email: document.querySelector(".email").value,
        password: document.querySelector(".password").value
    }
    console.log(registerData)

    fetch('/api/user-register', {
  method: 'POST', // or 'PUT'
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(registerData),
})
.then((response) => {
    console.log(response)
    const status = response.status;
    
  if (status == 401 || status == 400 || status == 500) {
    console.log('error')
    response.text().then(res =>  {
        console.log(res)
    });
  }
  else {
      console.log('success', status)
    response.text().then(res =>  {
        console.log(JSON.parse(res))
        res = JSON.parse(res)
        localStorage.setItem('user', JSON.stringify(res.user))
        localStorage.setItem('token', res.token)
        window.document.location = './controller.html'
        // console.log(JSON.parse(res))
    });
  }
}).catch((error) => {
  console.error('Error:', error);
});
    
}


function onLogin() {
    let loginData = {
        email: document.querySelector(".login-email").value,
        password: document.querySelector(".login-password").value
    }


    fetch('/api/user-login', {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })
      .then((response) => {
          console.log(response)
          const status = response.status;
          
        if (status == 401 || status == 400 || status == 500) {
          console.log('error')
          response.text().then(res =>  {
              console.log(res)
          });
        }
        else {
            console.log('success', status)
          response.text().then(res =>  {
              console.log(JSON.parse(res))
              res = JSON.parse(res)
              localStorage.setItem('user', JSON.stringify(res.user))
              localStorage.setItem('token', res.token)
              window.document.location = './controller.html'
              // console.log(JSON.parse(res))
          });
        }
      }).catch((error) => {
        console.error('Error:', error);
      });

}