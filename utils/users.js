const users = [];

// join user to chat

function userJoin(id, username) {
    const user = { id, username};

    users.push(user)

    return user;
}

function checkCurrentUser(id) {
    const user = users.filter(u => u.id === id);
    return user
}

function getCurrentUser(id){
    return users.find(user => user.id === id)
}

module.exports = {
    userJoin,
    checkCurrentUser,
    getCurrentUser
}