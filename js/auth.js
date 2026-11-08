"use strict";
(() => {
  const AP = window.AutoParts;
  const accountsKey = "autoparts-demo-accounts-v1";
  const sessionKey = "autoparts-demo-session-v1";
  const demoEmail = "student@autoparts.demo";
  const emailError = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254 ? "" : "Enter a valid email address.";
  const passwordError = value => value.length >= 8 && value.length <= 128 ? "" : "Use 8–128 characters.";
  const normalizeEmail = value => value.trim().toLowerCase();
  const hex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
  function readAccounts() {
    try {
      const data = JSON.parse(localStorage.getItem(accountsKey));
      return Array.isArray(data) ? data.filter(account => account && typeof account.name === "string" && account.name.length >= 2 && account.name.length <= 80 && typeof account.email === "string" && !emailError(account.email) && /^[a-f0-9]{32}$/.test(account.salt) && /^[a-f0-9]{64}$/.test(account.digest)).slice(0, 20) : [];
    } catch { return []; }
  }
  function readSession() {
    try {
      const user = JSON.parse(sessionStorage.getItem(sessionKey));
      return user && typeof user.name === "string" && user.name.length >= 2 && user.name.length <= 80 && typeof user.email === "string" && !emailError(user.email) && user.expires > Date.now() ? user : null;
    } catch { return null; }
  }
  let currentUser = readSession();
  function setSession(account) {
    const user = { name: account.name, email: account.email, expires: Date.now() + 24 * 60 * 60 * 1000 };
    try { sessionStorage.setItem(sessionKey, JSON.stringify(user)); }
    catch { throw new Error("Allow browser session storage to use demo login."); }
    currentUser = user;
    document.dispatchEvent(new CustomEvent("auth:change"));
    return user;
  }
  async function derivePassword(password, saltHex) {
    if (!window.crypto?.subtle) throw new Error("Open the site over HTTPS or localhost to use registration and login.");
    const salt = Uint8Array.from(saltHex.match(/../g), byte => parseInt(byte, 16));
    const key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await window.crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
    return hex(new Uint8Array(bits));
  }
  AP.auth = {
    emailError, passwordError,
    user: () => currentUser && currentUser.expires > Date.now() ? currentUser : null,
    async register(name, email, password) {
      name = name.trim(); email = normalizeEmail(email);
      if (name.length < 2 || name.length > 80) throw new Error("Use a name of 2–80 characters.");
      if (emailError(email) || passwordError(password)) throw new Error("Check your email and password length.");
      const accounts = readAccounts();
      if (email === demoEmail || accounts.some(account => account.email === email)) throw new Error("This email already has a demo account. Log in instead.");
      if (accounts.length >= 20) throw new Error("This browser already has 20 demo accounts. Use the provided demo login.");
      if (!window.crypto?.subtle) throw new Error("Open the site over HTTPS or localhost to register.");
      const salt = hex(window.crypto.getRandomValues(new Uint8Array(16)));
      const digest = await derivePassword(password, salt);
      accounts.push({ name, email, salt, digest });
      try { localStorage.setItem(accountsKey, JSON.stringify(accounts)); }
      catch { throw new Error("Allow browser storage to save a demo account."); }
      return setSession({ name, email });
    },
    async login(email, password) {
      email = normalizeEmail(email);
      // These public credentials are for a classroom demo, not a protected account.
      if (email === demoEmail && password === "AutoParts123!") return setSession({ name: "Demo Student", email });
      const account = readAccounts().find(entry => entry.email === email);
      if (!account || await derivePassword(password, account.salt) !== account.digest) throw new Error("Email or password is incorrect.");
      return setSession(account);
    },
    logout() {
      try { sessionStorage.removeItem(sessionKey); } catch { /* In-memory logout still works. */ }
      currentUser = null;
      document.dispatchEvent(new CustomEvent("auth:change"));
    }
  };
  document.addEventListener("DOMContentLoaded", () => {
    function updateAccount() {
      const user = AP.auth.user();
      const link = document.getElementById("account-link");
      if (link) { link.textContent = user ? "My account" : "Log in"; link.setAttribute("aria-label", user ? `Account for ${user.name}` : "Log in"); }
      const checkoutLink = document.getElementById("checkout-account-link");
      if (checkoutLink) checkoutLink.textContent = user ? "Account details →" : "Log in to prefill your details →";
      const profile = document.getElementById("account-profile");
      if (profile) {
        profile.hidden = !user;
        document.getElementById("auth-forms").hidden = Boolean(user);
        document.getElementById("profile-name").textContent = user?.name || "";
        document.getElementById("profile-email").textContent = user?.email || "";
      }
      for (const [id, value] of [["order-name", user?.name], ["order-email", user?.email]]) {
        const field = document.getElementById(id);
        if (field && value && !field.value) field.value = value;
      }
    }
    document.addEventListener("auth:change", updateAccount);
    updateAccount();
    document.getElementById("logout-button")?.addEventListener("click", () => {
      AP.auth.logout();
      selectTab(tabs[0]);
      AP.announce("Logged out. Your cart is still available.");
      document.getElementById("login-email").focus();
    });
    const tabs = [...document.querySelectorAll("[data-auth-tab]")];
    function selectTab(tab) {
      tabs.forEach(button => { const selected = button === tab; button.setAttribute("aria-selected", String(selected)); button.tabIndex = selected ? 0 : -1; document.getElementById(button.getAttribute("aria-controls")).hidden = !selected; });
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTab(tab));
      tab.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === "Home" ? tabs[0] : event.key === "End" ? tabs.at(-1) : tabs[(index + 1) % tabs.length];
        selectTab(target); target.focus();
      });
    });
    document.querySelectorAll("[data-toggle-password]").forEach(button => button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Hide password" : "Show password";
      button.setAttribute("aria-pressed", String(show));
    }));
    document.querySelectorAll("form[data-auth-form]").forEach(form => {
      const fields = [...form.querySelectorAll("[data-auth-field]")];
      const summary = form.querySelector(".form-summary");
      function errorFor(field) {
        const value = field.type === "password" || field.dataset.password ? field.value : field.value.trim();
        if (!value) return "This field is required.";
        if (field.type === "email") return emailError(value);
        if (field.id === "register-name" && value.length < 2) return "Enter at least 2 characters.";
        if (field.id === "register-confirm") return value === document.getElementById("register-password").value ? "" : "Passwords do not match.";
        if (field.dataset.password) return passwordError(value);
        return "";
      }
      function showError(field) {
        const message = errorFor(field);
        document.getElementById(`${field.id}-error`).textContent = message;
        field.setAttribute("aria-invalid", String(Boolean(message)));
        field.classList.toggle("is-invalid", Boolean(message));
        return message;
      }
      fields.forEach(field => field.addEventListener("input", () => { summary.hidden = true; if (field.getAttribute("aria-invalid") === "true") showError(field); }));
      form.addEventListener("submit", async event => {
        event.preventDefault();
        const invalid = fields.filter(field => showError(field));
        if (invalid.length) { invalid[0].focus(); return; }
        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true; form.setAttribute("aria-busy", "true"); summary.hidden = true;
        try {
          if (form.dataset.authForm === "login") await AP.auth.login(document.getElementById("login-email").value, document.getElementById("login-password").value);
          else await AP.auth.register(document.getElementById("register-name").value, document.getElementById("register-email").value, document.getElementById("register-password").value);
          form.reset();
          AP.announce("You are signed in to the demo account.");
          document.getElementById("profile-heading").focus();
        } catch (error) { summary.textContent = error.message; summary.hidden = false; summary.focus(); }
        finally { submit.disabled = false; form.removeAttribute("aria-busy"); }
      });
    });
    document.getElementById("fill-demo")?.addEventListener("click", () => {
      document.getElementById("login-email").value = demoEmail;
      document.getElementById("login-password").value = "AutoParts123!";
      document.getElementById("login-email").focus();
    });
  });
})();
