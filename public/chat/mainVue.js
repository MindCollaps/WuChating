var main = new Vue({
    el: "#index",
    data: {
        chats: [],
        selectedChat: {
            autor: "Select or create a chat",
            messages: [{message: "To start chatting", date: "20:20", self: false}, {message: "Share your User ID", date: "20:20", self: true}]
        },
        text: "",
        userID: ""
    },
    created: async function () {
        this.fetchOwnUserId();
        this.fetchMessages();

        setInterval(() => {
            this.fetchMessages();
        }, 3000)

    },
    methods: {
        fetchOwnUserId: async function (){
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

            if(json.status == 200){
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
            if(json.status== 200){
                if(json.data == true)
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
                message.date = this.parseDate(message.date);

                let putMessage = false;

                for (let chat of this.chats) {
                    if (chat.autor == autor) {
                        chat.messages.push(message);
                        putMessage = true;
                        break;
                    }
                }

                if (!putMessage) {
                    this.chats.unshift({
                        autor: message.autor,
                        username: "Unknown",
                        messages: [message]
                    })
                }
            }
        },
        addChat: function () {
            let userID = prompt("Enter a user ID");
            if(userID == this.userID)
                return;
            if(this.checkUserId(userID)){
                this.chats.push({autor: userID, messages: []})
            } else {
                window.info("This ID is invalid!");
            }
        },
        selectChat: function (chat) {
            this.selectedChat = chat;
        },
        sendMessage: async function () {
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

            if(json.status == 200){
                tMessage.self = true;
                tMessage.date = this.parseDate(tMessage.date);
                this.selectedChat.messages.unshift(tMessage);
            }
        },
        parseDate: function (date){
            return date.toLocaleTimeString();
        }
    }
});