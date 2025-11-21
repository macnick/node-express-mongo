const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    })
    if (res.status === 200) {
      showSuccessAlert('Logged in successfully!')
      window.setTimeout(() => {
        location.assign('/')
      }, 1000)
    }
  } catch (err) {
    showErrorAlert(err.response.data.message)
    console.log(err.response.data.message)
  }
}

const loginForm = document.querySelector('.login-form')
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault() // Prevent the form from submitting and reloading the page

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    login(email, password)
  })
}

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'api/v1/users/logout',
    })
    if ((res.status = 200)) location.reload(true)
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.')
  }
}

const logoutButton = document.getElementById('logout')
if (logoutButton) {
  logoutButton.addEventListener('click', logout)
}
