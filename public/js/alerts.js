const showAlert = (type, message) => {
  const markup = `<div class="alert alert--${type}">${message}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
  window.setTimeout(() => {
    document.querySelector('.alert').remove()
  }, 5000)
}

const showErrorAlert = (message) => {
  showAlert('error', message)
  window.setTimeout(() => {
    document.querySelector('.alert').remove()
  }, 5000)
}

const showSuccessAlert = (message) => {
  showAlert('success', message)
  window.setTimeout(() => {
    document.querySelector('.alert').remove()
  }, 5000)
}

export { showErrorAlert, showSuccessAlert }
