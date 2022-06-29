var main = new Vue({
    el: "#index",
    data: {
        username: "",
        password: "",
        error: ""
    },
    methods: {
        login: async function (){
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: this.password,
                    username: this.username,
                })
            };

            var json = undefined;
            await fetch('/api/login', options).then(res => res.json())
                .then(res => {
                    json = res;
                    return res;
                })
                .catch(err => console.log(err));

            console.log(json);

            if (json.status === 200) {
                this.error = "Login successful!";
                setCookie("auth", json.data.token, 1);
                setTimeout(() => {
                    location.replace("/chat");
                }, 3000);
            } else {
                this.error = json.message;
            }
        }
    }
});