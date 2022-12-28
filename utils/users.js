const users = [];

// join user to chat

function userJoin(id, phone, garageName, clientName, agentName) {
    const user = { id, phone, garageName, clientName, agentName};

    users.push(user)

    return user;
}

function getCurrentUser(id) {
    const user = users.filter(u => u.id === id);
    return user
}

function getAllUsers(){
    return users
}

function getUserByPhone(phone){
    const user = users.filter(u => u.phone === phone)
    return user
}

module.exports = {
    userJoin,
    getCurrentUser,
    getAllUsers,
    getUserByPhone
}