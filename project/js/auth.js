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

    const response = await fetch(`${AUTH_API_BASE}${path}`, options);
    const result = await response.json().catch(() => ({}));
    if(!response.ok){
        throw new Error(result.message || "Server error");
    }
    return result;
}

function saveUser(user){
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function getSavedUser(){
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
}

function setLoggedIn(user, token = null, demoMode = false){
    localStorage.setItem(AUTH_SESSION_KEY, "true");
    localStorage.setItem(AUTH_DEMO_KEY, demoMode ? "true" : "false");
    if(token){
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    saveUser(user);
}

async function registerUser(event){
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if(!name || !email || !password){
        showMessage("Please fill in all fields.", true);
        return;
    }

    if(password.length < 4){
        showMessage("Password must be at least 4 characters.", true);
        return;
    }

    try{
        const result = await apiRequest("/register", { name, email, password });
        setLoggedIn(result.user, result.token, false);
        showMessage("Account created with Java backend and MySQL.");
        setTimeout(() => window.location.href = "dashboard.html", 700);
    }catch(error){
        const demoUser = { id: 0, name, email, password, role: "USER" };
        setLoggedIn(demoUser, null, true);
        showMessage("Backend/MySQL is not running, so demo mode was used.");
        setTimeout(() => window.location.href = "dashboard.html", 900);
    }
}

async function loginUser(event){
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try{
        const result = await apiRequest("/login", { email, password });
        setLoggedIn(result.user, result.token, false);
        showMessage("Login successful using backend/MySQL.");
        setTimeout(() => window.location.href = "dashboard.html", 700);
    }catch(error){
        const savedUser = getSavedUser();
        if(!savedUser){
            showMessage("No account found. Please register first.", true);
            return;
        }
        if(savedUser.email !== email || savedUser.password !== password){
            showMessage("Email or password is incorrect.", true);
            return;
        }
        setLoggedIn(savedUser, null, true);
        showMessage("Login successful in demo mode.");
        setTimeout(() => window.location.href = "dashboard.html", 700);
    }
}

function updateDashboard(user, modeText = "Demo Mode"){
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const userRole = document.getElementById("user-role");
    const loginMode = document.getElementById("login-mode");

    if(userName) userName.textContent = user?.name || "User";
    if(userEmail) userEmail.textContent = user?.email || "-";
    if(userRole) userRole.textContent = user?.role || "USER";
    if(loginMode) loginMode.textContent = modeText;
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
        updateDashboard(savedUser, "Demo Mode");
        return;
    }

    try{
        const result = await apiRequest("/me", null, "GET");
        saveUser(result.user);
        updateDashboard(result.user, "Backend / MySQL Login");
    }catch(error){
        localStorage.removeItem(AUTH_SESSION_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        window.location.href = "login.html";
    }
}

async function logoutUser(){
    try{
        await apiRequest("/logout", null, "POST");
    }catch(error){
        
    }
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_DEMO_KEY);
    window.location.href = "login.html";
}
