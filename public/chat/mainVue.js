var main = new Vue({
    el: "#index",
    data: {
        chats: [],
        demo: {
            autor: "Select or create a chat",
            messages: [{message: "To start chatting", date: "20:20", self: false}, {
                message: "Share your User ID",
                date: "20:20",
                self: true
            }],
            demo: true
        },
        selectedChat: undefined,
        text: "",
        userID: "",
        sending: false
    },
    created: async function () {
        this.selectedChat = this.demo;
        this.fetchOwnUserId();
        this.fetchMessages();

        setInterval(() => {
            this.fetchMessages();
        }, 1000)

    },
    methods: {
        fetchOwnUserId: async function () {
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                }
            };

            var json = undefined;
            await fetch('/api/userid', options).then(res => res.json())
                .then(res => {
                    json = res;
                    return res;
                })
                .catch(err => console.log(err));

            if (json.status == 200) {
                this.userID = json.data.userID;
            }
        },
        checkUserId: async function (userID) {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({
                    userID: userID
                })
            };

            var json = undefined;
            await fetch('/api/checkuserid', options).then(res => res.json())
                .then(res => {
                    json = res;
                    return res;
                })
                .catch(err => console.log(err));
            if (json.status == 200) {
                if (json.data == true)
                    return true;
                else return false;
            } else {
                return false;
            }
        },
        fetchMessages: async function () {
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                }
            };

            var json = undefined;
            await fetch('/api/message', options).then(res => res.json())
                .then(res => {
                    json = res;
                    return res;
                })
                .catch(err => console.log(err));

            for (let message of json.data) {
                const autor = message.autor;
                message.date = this.parseDate(new Date(message.date));

                let putMessage = false;

                for (let chat of this.chats) {
                    if (chat.autor == autor) {
                        chat.messages.unshift(message);
                        putMessage = true;
                        break;
                    }
                }

                if (!putMessage) {
                    this.chats.push({
                        autor: message.autor,
                        username: "Unknown",
                        messages: [message]
                    })
                }
            }
        },
        addChat: async function () {
            let userID = prompt("Enter a user ID");

            if (userID == this.userID)
                return;
            if (userID == undefined) {
                alert("A user ID has at least 4 characters!");
            }
            if (userID.length != 4) {
                alert("A user ID has at least 4 characters!");
                return;
            }
            if (await this.checkUserId(userID)) {
                this.chats.push({autor: userID, messages: []})
            } else {
                alert("This ID is invalid!");
            }
        },
        selectChat: function (chat) {
            this.selectedChat = chat;
        },
        sendMessage: async function () {
            if (this.sending)
                return;

            this.sending = true;
            const tMessage = {
                message: this.text,
                dest: this.selectedChat.autor,
                date: new Date()
            };
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify(tMessage)
            };

            var json = undefined;
            await fetch('/api/message', options).then(res => res.json())
                .then(res => {
                    json = res;
                    return res;
                })
                .catch(err => console.log(err));

            if (json.status == 200) {
                this.text = "";
                tMessage.self = true;
                tMessage.date = this.parseDate(tMessage.date);
                this.selectedChat.messages.unshift(tMessage);
            }

            this.sending = false;
        },
        parseDate: function (date) {
            return date.toLocaleTimeString("de-DE");
        },
        back: function () {
            this.selectedChat = this.demo;
            this.text = "";
        },
        getLastMessage: function (txt){
            if(txt.length > 40){
                return txt.slice(0, 40) + "...";
            } else {
                return txt;
            }
        }
    }
});