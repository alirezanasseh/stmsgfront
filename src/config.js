const SERVER_IP = '192.168.1.27';
const SERVER_PORT = 8000;

module.exports = global.config = {
    BASE_URL: localStorage.getItem('BASE_URL') ? localStorage.getItem('BASE_URL') : `http://${SERVER_IP}:${SERVER_PORT}`,
    TOKEN: null,
    LOCALE: 'en',
    ROLES: [
        {key: "guest", value: "مهمان"},
        {key: "user", value: "کاربر"},
        {key: "admin", value: "مدیر"}
    ]
};