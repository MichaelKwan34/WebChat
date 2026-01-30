import { showToast } from "./toast.js";

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

// Check email format
function validateEmailFormat(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

// Check password format
function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
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

// BackButton Handlers
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

async function login(username, password){
  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    localStorage.setItem("token", data.token);
    return data.token;
  } catch (err) {
    return false;
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameLogin.value.trim().toLowerCase();
  const password = passwordLogin.value;

  const token = await login(username, password);

  if (token) {
    window.location.href = "/frontend/main.html";
  }
  else {
    showToast("Username or password is incorrect.", "error");
  }
});

// Check if username already exists in the database
async function isUsernameAvailable(username) {
  const res = await fetch(`http://localhost:3000/users/check-username?username=${username}`);
  const data = await res.json();
  return data.available;
}

// Check if email already exists in the database
async function isEmailAvailable(email) {
  const res = await fetch(`http://localhost:3000/users/check-email?email=${email}`);
  const data = await res.json();
  return data.available;
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameRegister.value.trim().toLowerCase();
  const email = emailRegister.value.trim().toLowerCase();
  const password = passwordRegister.value;

  const usernameAvailable = await isUsernameAvailable(username);
  if (!usernameAvailable) {
    showToast("Oops! That username is already taken", "error")
    return
  }

  if (!validateEmailFormat(email)) {
    showToast("Please check your email address format", "error")
    return
  }

  const emailAvailable = await isEmailAvailable(email);
  if (!emailAvailable) {
    showToast("That email address is already registered", "error")
    return
  }

  if (!validatePassword(password)) {
    showToast("Password must include letters, numbers, and a capital letter", "error")
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {"Content-Type":"application/json"}, 
      body: JSON.stringify({username, email, password})
    });
    const data = await res.json();
    console.log(data);

    if (res.ok) {
      usernameLogin.value = username;
      passwordLogin.value = password;
      resetInput("register");
      hideForm("register");
      showForm("login");
      showToast("Account created successfully!", "success")
    }
    else {
      showToast("Registration failed. Please try again.", "error");
    }
  } 
  catch (err) {
    showToast("Server errror. Try again later.", "error")
  }
});

async function forgotPassword(email) {
  const res = await fetch("http://localhost:3000/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return res.json();
}

continueBtn.addEventListener('click', async function(e) {
  e.preventDefault(); 

  const email = emailReset.value.trim().toLowerCase();

  if (!validateEmailFormat(email)) {
    showToast("Please check your email address format", "error")
    return;
  }

  try {
    const res = await forgotPassword(email);
    hideForm("forgot");
    showForm("otp");
    showToast(res.message, "success")
  } 
  catch (err) {
    showToast("Something went wrong. Please try again.", "error")
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

async function verifyOTP(email, otp) {
  const res = await fetch("http://localhost:3000/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  });

  if (!res.ok) {
    throw new Error(res.message || "OTP verification failed. Please try again.");
  }
  return res.json();
}

submitOTPBtn.addEventListener('click', async function(e){
  e.preventDefault();

  const otp = Array.from(otpBoxes).map(box => box.value).join("");
  const email = emailReset.value.trim().toLowerCase();

  try {
    const res = await verifyOTP(email, otp);

    if (res.isMatch === true) {
      hideForm("otp");
      showForm("reset");
      showToast(res.message, "success");
    } 
  } catch (err) {
    showToast("Invalid or expired OTP. Please try again.", "error");
  }
});

async function changePassword(email, password) {
  const res = await fetch("http://localhost:3000/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error("Change password failed");
  }
  return res.json();
}

resetBtn.addEventListener('click', async function(e){
  e.preventDefault();

  const email = emailReset.value.trim().toLowerCase();
  const password = passwordReset.value;

  if (validatePassword(password)) {
    const res = await changePassword(email, password);
    hideForm("reset")
    showForm("login")

    resetInput("forgot")
    resetInput("otp")
    resetInput("reset")

    showToast(res.message, "success")
  } 
  else {
    showToast("Password must include letters, numbers, and a capital letter", "error")
  }
});

const token = localStorage.getItem("token");
if (token) {
  window.location.replace("/frontend/main.html");
}