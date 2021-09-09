function patternTest(pattern, response) {
  let box = response.querySelector(".fas");
  if (pattern) {
    box.classList.remove("fa-times");
    box.classList.add("fa-check");
    response.classList.add("valid");
  } else {
    box.classList.add("fa-times");
    box.classList.remove("fa-check");
    response.classList.remove("valid");
  }
}

var helpTxt = document.getElementsByClassName("helper-text");
for (var i = 0; i < helpTxt.length; i++) {
  helpTxt[i].style.display = "none";
}

var password = document.querySelector(".password");
var cPassword = document.querySelector(".ConfirmPassword");
var form = document.getElementById("login-up");
var flash = document.getElementById("flash");

var helperText = {
  charLength: document.querySelector(".helper-text .length"),
  lowercase: document.querySelector(".helper-text .lowercase"),
  uppercase: document.querySelector(".helper-text .uppercase"),
  number: document.querySelector(".helper-text .number"),
  special: document.querySelector(".helper-text .special"),
};

var pattern = {
  charLength: function () {
    if (password.value.length >= 6 && password.value.length < 50) {
      return true;
    }
  },
  lowercase: function () {
    var regex = /^(?=.*[a-z]).+$/; // Lowercase character

    if (regex.test(password.value)) {
      return true;
    }
  },
  uppercase: function () {
    var regex = /^(?=.*[A-Z]).+$/; // Uppercase character

    if (regex.test(password.value)) {
      return true;
    }
  },
  special: function () {
    var regex = /^(?=.*?[#?!@$%^&*-])/; // Special character

    if (regex.test(password.value)) {
      return true;
    }
  },
  number: function () {
    var regex = /^(?=.*?[0-9])/; // Number

    if (regex.test(password.value)) {
      return true;
    }
  },
};

password.addEventListener("blur", function () {
  var o = document.getElementsByClassName("helper-text");
  for (var i = 0; i < o.length; i++) {
    if (o[i].style.display == "") {
      o[i].style.display = "block";
    } else {
      o[i].style.display = "none";
    }
  }
});

password.addEventListener("focus", function () {
  var o = document.getElementsByClassName("helper-text");
  for (var i = 0; i < o.length; i++) {
    if (o[i].style.display == "none") {
      o[i].style.display = "block";
    } else {
      o[i].style.display = "none";
    }
  }
});

// Listen for keyup action on password field
password.addEventListener("keyup", function () {
  // Check that password is a minimum of 8 characters
  patternTest(pattern.charLength(), helperText.charLength);

  // Check that password contains a lowercase letter
  patternTest(pattern.lowercase(), helperText.lowercase);

  // Check that password contains an uppercase letter
  patternTest(pattern.uppercase(), helperText.uppercase);

  // Check that password contains a number
  patternTest(pattern.number(), helperText.number);

  // Check that password contains a number or special character
  patternTest(pattern.special(), helperText.special);

  // Check that all requirements are fulfilled
  if (
    helperText.charLength.classList.contains("valid") &&
    helperText.lowercase.classList.contains("valid") &&
    helperText.uppercase.classList.contains("valid") &&
    helperText.number.classList.contains("valid") &&
    helperText.special.classList.contains("valid")
  ) {
    password.classList.add("valid");
  } else {
    password.classList.remove("valid");
  }
});

cPassword.addEventListener("keyup", function () {
  if (password.value == cPassword.value) {
    cPassword.classList.add("valid");
  } else {
    cPassword.classList.remove("valid");
  }
});

form.addEventListener("submit", (e) => {
  if (
    !(
      pattern.charLength() &&
      pattern.lowercase() &&
      pattern.uppercase() &&
      pattern.number() &&
      pattern.special()
    )
  ) {
    errorAdd(e, "Password is too weak");
  } else if (password.value != cPassword.value) {
    errorAdd(e, "Password and confirm password should match");
  }
});

function errorAdd(e, message) {
  e.preventDefault();
  flash.classList.remove("success");
  flash.classList.add("error");
  flash.innerText = message || "error";
}
