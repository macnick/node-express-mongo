const showAlert = (type, message) => {
  const markup = `<div class="alert alert--${type}">${message}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
  window.setTimeout(() => {
    document.querySelector('.alert').remove()
  }, 4000)
}

const showErrorAlert = (message) => {
  showAlert('error', message)
}

const showSuccessAlert = (message) => {
  showAlert('success', message)
}
