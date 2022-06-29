var loggedIn = false;
var isAdmin = false;
var token;

function changeTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
}

async function auth(goToLoginOnFail) {
    token = getCookie("auth");
    if (!token) {
        if (goToLoginOnFail) {
            window.location.replace("/login");
        }
        return;
    }
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': token
        }
    };

    try {
        const response = await fetch('/api/auth', options);
        const json = await response.json();

        if (json.status === 200) {
            loggedIn = true;
            console.log("logged in!");
            var login = document.getElementById('login');
            var regi = document.getElementById('regi');
            regi.remove();
            login.innerHTML = "Logout";
            login.href = "";
            login.onclick = function () {
                deleteCookie("auth");
                if (goToLoginOnFail) {
                    window.location.replace("/");
                }
            }
            await setupLogin();
        } else {
            console.log("not logged in!");
            if (goToLoginOnFail) {
                window.location.replace("/login");
            }
        }
    } catch (e) {
        console.log(e);
        console.log("error");
    }
}


function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

function setCookie(name, value, days) {
    var d = new Date;
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}

function deleteCookie(name) {
    setCookie(name, '', -1);
}

function isLoggedIn() {
    return loggedIn;
}

function ping(host) {
    var http = new XMLHttpRequest();
    http.open("GET", host, /*async*/true);
    http.onreadystatechange = function() {
        if (http.readyState == 4) {
        }
    };
    try {
        http.send(null);
    } catch(exception) {
       return true;
    }
    return false;
}