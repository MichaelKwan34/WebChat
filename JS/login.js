// Forms
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');
const forgotForm = document.querySelector('.forgot-form');
const otpForm = document.querySelector('.otp-form')
const resetForm = document.querySelector('.reset-form')

// Links
const registerLink = document.getElementById('registerLink');
const forgotLink = document.getElementById('forgotLink');

// BackButton
const registrationBackIcon = document.getElementById('registerBackIcon');
const resetBackIcon = document.getElementById('resetBackIcon');
const otpBackIcon = document.getElementById('otpBackIcon');
const newPassBackIcon = document.getElementById('newPassBackIcon')

// Inputs
const usernameLogin = document.getElementById('usernameLogin');
const passwordLogin = document.getElementById('passwordLogin');

const usernameRegister = document.getElementById('usernameRegister');
const emailRegister = document.getElementById('emailRegister')
const passwordRegister = document.getElementById('passwordRegister');

const emailReset = document.getElementById('emailReset');

const otpBoxes = document.querySelectorAll('.otp-box');

const passwordReset = document.getElementById('passwordReset');

// Buttons
const registerBtn = document.getElementById('registerBtn');
const continueBtn = document.getElementById('continueBtn');
const loginBtn = document.getElementById('loginBtn');
const submitOTPBtn = document.getElementById('submitOTPBtn');
const resetBtn = document.getElementById('resetBtn')

function hideForm(form) {
  if (form == "login") {
    loginForm.classList.add('hide');
    loginForm.classList.remove('show');
  }
  else if (form == "register") {
    registerForm.classList.add('hide');
    registerForm.classList.remove('show');
  }
  else if (form == "forgot") {
    forgotForm.classList.add('hide');
    forgotForm.classList.remove('show');
  }
  else if (form == "otp"){
    otpForm.classList.add('hide');
    otpForm.classList.remove('show');
  } 
  else {
    resetForm.classList.add('hide');
    resetForm.classList.remove('show');
  }
}

function showForm(form) {
  if (form == "login") {
    loginForm.classList.add('show');
    loginForm.classList.remove('hide');
  }
  else if (form == "register") {
    registerForm.classList.add('show');
    registerForm.classList.remove('hide');
  }
  else if (form == "forgot") {
    forgotForm.classList.add('show');
    forgotForm.classList.remove('hide');
  }
  else if (form == "otp") {
    otpForm.classList.add('show');
    otpForm.classList.remove('hide');
  }
  else {
    resetForm.classList.add('show');
    resetForm.classList.remove('hide');
  }
}

function resetInput(form) {
  if (form == "login") {
    usernameLogin.value = '';
    passwordLogin.value = '';
  }
  else if (form == "register") {
    usernameRegister.value = '';
    emailRegister.value = '';
    passwordRegister.value = '';
  }
  else if (form == "forgot") {
    emailReset.value = '';
  }
  else if (form == "otp"){
    otpBoxes.forEach(box => box.value = '');
  }
  else {
    passwordReset.value = '';
  }
}

function validateLogin() {

}

// Check if username already exists in the database
function validateUsername() {
  // DB related code
  return true
}

// Check email format
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

// Check password format
function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// SKIP for now
function validateOTP(){
}






// Register Form Displayer
registerLink.addEventListener('click', function(e) {
  e.preventDefault();

  hideForm("login");
  showForm("register");
  resetInput("login");
});

// ResetPassword Form Displayer
forgotLink.addEventListener('click', function(e){
  e.preventDefault();

  hideForm("login");
  showForm("forgot");
  resetInput("login");
});






// BackButton Handler
registrationBackIcon.addEventListener('click', function(e) {
  e.preventDefault();

  hideForm("register");
  showForm("login");
  resetInput("register");
});

resetBackIcon.addEventListener('click', function(e) {
  e.preventDefault();

  hideForm("forgot");
  showForm("login");
  resetInput("forgot");
});

otpBackIcon.addEventListener('click', function(e) {
  e.preventDefault();

  hideForm("otp");
  showForm("forgot");
  resetInput("otp")
});

newPassBackIcon.addEventListener('click', function(e) {
  e.preventDefault();

  hideForm("reset");
  showForm("forgot");
  resetInput("reset")
  resetInput("otp")
});






// Button Handler
loginBtn.addEventListener('click', function(e) {
  // add valididation later
  window.location.href = "/HTML/main.html"
});

registerBtn.addEventListener('click', function(e) {
  e.preventDefault();

  if (validateUsername(usernameRegister.value) && validateEmail(emailRegister.value) && validatePassword(passwordRegister.value)) {
    usernameLogin.value = usernameRegister.value;
    passwordLogin.value = passwordRegister.value;
    resetInput("register")
    hideForm("register")
    showForm("login")
  }
  else {
    // Raise alerts
    if (!validateUsername(usernameRegister.value)) {
    }
    if (!validateEmail(emailRegister.value)) {
    } 
    if (!validatePassword(passwordRegister.value)) {
    }
  }
});

continueBtn.addEventListener('click', function(e) {
  e.preventDefault(); 

  if (validateEmail(emailReset.value)) {
    hideForm("forgot");
    showForm("otp");
  }
  else {
    // Raise alert
  }
});

submitOTPBtn.addEventListener('click', function(e){
  e.preventDefault();

  // SKIP for now
  hideForm("otp")
  showForm("reset")
});

resetBtn.addEventListener('click', function(e){
  e.preventDefault();

  if (validatePassword(passwordReset.value)) {
    hideForm("reset")
    showForm("login")
    
    resetInput("forgot")
    resetInput("otp")
    resetInput("reset")
  } 
  else {
    // Raise alert
  }
});

otpBoxes.forEach((box, index) => {
  box.addEventListener('input', () => {
    box.value = box.value.replace(/[^0-9]/g, '');

    if (box.value) {
      box.classList.add('filled');
    } 
    else {
      box.classList.remove('filled');
    }

    if (box.value && index < otpBoxes.length - 1) {
      otpBoxes[index + 1].focus();
    }
  });

  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && index > 0) {
      otpBoxes[index - 1].focus();
    }
  });
});