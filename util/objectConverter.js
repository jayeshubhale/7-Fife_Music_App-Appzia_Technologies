exports.userList = (users) => {

    usersResult = [];
    users.forEach(user => {
        usersResult.push({
            registerDate : user.createdAt,
            name: user.userName,
            email: user.email,
            registerWith : user.registerWith,
            status: user.status,
            id : user._id
        });
    });
    return usersResult;

}


