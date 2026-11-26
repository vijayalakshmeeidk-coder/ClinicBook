// staff login
(() => {
  const DEMO_ACCOUNTS = {
    doctor: {
      email: "doctor@clinicbook.com",
      password: "doctor123"
    },
    receptionist: {
      email: "reception@clinicbook.com",
      password: "reception123"
    }
  };

  document.querySelectorAll("[data-login-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const role = form.dataset.role;
      const redirect = form.dataset.redirect;
      const message = form.querySelector("[data-form-message]");
      const email = form.elements.email.value.trim().toLowerCase();
      const password = form.elements.password.value;

      message.textContent = "";

      if (!email || !password) {
        message.textContent =
          "Please enter both your email and password.";
        return;
      }

      const account = DEMO_ACCOUNTS[role];

      if (
        !account ||
        email !== account.email ||
        password !== account.password
      ) {
        message.textContent =
          "The email or password is incorrect. Please try again.";
        return;
      }

      // Demo-only session marker
      sessionStorage.setItem("clinicbookDemoRole", role);
      sessionStorage.setItem("clinicbookDemoEmail", email);

      window.location.href = redirect;
    });
  });
})
  ();
