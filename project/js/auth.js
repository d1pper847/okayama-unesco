const AUTH_USER_KEY = "okayamaUnescoUser";
const AUTH_SESSION_KEY = "okayamaUnescoLoggedIn";
const AUTH_TOKEN_KEY = "okayamaUnescoAuthToken";
const AUTH_DEMO_KEY = "okayamaUnescoDemoMode";
const AUTH_API_BASE = "http://localhost:8080/api";

function showMessage(text, isError = false){
    const message = document.getElementById("auth-message");
    if(!message) return;
    message.textContent = text;
    message.style.color = isError ? "#b42318" : "#184d3b";
}

async function apiRequest(path, data = null, method = "POST"){
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const options = {
        method,
        headers: { "Content-Type": "application/json" }
    };

    if(token){
        options.headers.Authorization = `Bearer ${token}`;
    }

    if(data){
        options.body = JSON.stringify(data);
    }

    let response;
    try{
        response = await fetch(`${AUTH_API_BASE}${path}`, options);
    }catch(error){
        const networkError = new Error("Backend is not running.");
        networkError.isNetworkError = true;
        throw networkError;
    }

    const result = await response.json().catch(() => ({}));
    if(!response.ok){
        const apiError = new Error(result.message || "Server error");
        apiError.status = response.status;
        apiError.detail = result.detail || "";
        throw apiError;
    }
    return result;
}

function saveUser(user){
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function getSavedUser(){
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
}

async function demoPasswordHash(password){
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function setLoggedIn(user, token = null, demoMode = false){
    localStorage.setItem(AUTH_SESSION_KEY, "true");
    localStorage.setItem(AUTH_DEMO_KEY, demoMode ? "true" : "false");
    if(token){
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }else{
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    saveUser(user);
}

async function registerUser(event){
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if(!name || !email || !password){
        showMessage(window.t ? window.t("auth_required", "Please fill in all fields.") : "Please fill in all fields.", true);
        return;
    }

    if(password.length < 8){
        showMessage(window.t ? window.t("auth_password_short", "Password must be at least 8 characters.") : "Password must be at least 8 characters.", true);
        return;
    }

    try{
        const result = await apiRequest("/register", { name, email, password });
        setLoggedIn(result.user, result.token, false);
        showMessage(window.t ? window.t("auth_register_success", "Account created successfully.") : "Account created successfully.");
        setTimeout(() => window.location.href = "dashboard.html", 700);
    }catch(error){
        if(!error.isNetworkError){
            showMessage(error.message || "Registration failed.", true);
            return;
        }

        const passwordHash = await demoPasswordHash(password);
        const demoUser = { id: 0, name, email, passwordHash, role: "USER" };
        setLoggedIn(demoUser, null, true);
        showMessage(window.t ? window.t("auth_register_offline", "Account created in offline mode.") : "Account created in offline mode.");
        setTimeout(() => window.location.href = "dashboard.html", 900);
    }
}

async function loginUser(event){
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    try{
        const result = await apiRequest("/login", { email, password });
        setLoggedIn(result.user, result.token, false);
        showMessage(window.t ? window.t("auth_login_success", "Login successful.") : "Login successful.");
        setTimeout(() => window.location.href = "dashboard.html", 700);
    }catch(error){
        if(!error.isNetworkError){
            showMessage(error.message || "Login failed.", true);
            return;
        }

        const savedUser = getSavedUser();
        const passwordHash = await demoPasswordHash(password);
        if(!savedUser){
            showMessage(window.t ? window.t("auth_backend_required", "Backend is not running. Please register first or start the backend.") : "Backend is not running. Please register first or start the backend.", true);
            return;
        }
        if(savedUser.email !== email || savedUser.passwordHash !== passwordHash){
            showMessage(window.t ? window.t("auth_invalid", "Email or password is incorrect.") : "Email or password is incorrect.", true);
            return;
        }
        setLoggedIn(savedUser, null, true);
        showMessage(window.t ? window.t("auth_login_offline", "Login successful in offline mode.") : "Login successful in offline mode.");
        setTimeout(() => window.location.href = "dashboard.html", 700);
    }
}

function updateDashboard(user, modeText = null){
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const userRole = document.getElementById("user-role");
    const loginMode = document.getElementById("login-mode");

    if(userName) userName.textContent = user?.name || "User";
    if(userEmail) userEmail.textContent = user?.email || "-";
    if(userRole) userRole.textContent = user?.role || "USER";
    if(loginMode) loginMode.textContent = modeText || (window.t ? window.t("dashboard_mode_offline", "Offline Mode") : "Offline Mode");
}

async function protectDashboard(){
    const isLoggedIn = localStorage.getItem(AUTH_SESSION_KEY) === "true";
    if(!isLoggedIn){
        window.location.href = "login.html";
        return;
    }

    const demoMode = localStorage.getItem(AUTH_DEMO_KEY) === "true";
    const savedUser = getSavedUser();

    if(demoMode){
        updateDashboard(savedUser, window.t ? window.t("dashboard_mode_offline", "Offline Mode") : "Offline Mode");
        return;
    }

    try{
        const result = await apiRequest("/me", null, "GET");
        saveUser(result.user);
        updateDashboard(result.user, window.t ? window.t("dashboard_mode_backend", "Backend / MySQL Login") : "Backend / MySQL Login");
    }catch(error){
        localStorage.removeItem(AUTH_SESSION_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_DEMO_KEY);
        window.location.href = "login.html";
    }
}

async function logoutUser(){
    try{
        await apiRequest("/logout", null, "POST");
    }catch(error){
        // Logout should still clear browser session when backend is unavailable.
    }
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_DEMO_KEY);
    window.location.href = "login.html";
}
