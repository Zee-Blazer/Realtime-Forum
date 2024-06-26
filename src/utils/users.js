const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.toString().trim().toLowerCase();

    // Validate the data
    if(!username || !room){
        return {
            err: "Username and room are required!"
        }
    }

    // Check for exisiting user
    const exisitingUser = users.find( user => {
        return user.room === room && user.username === username
    } )

    if(exisitingUser) {
        return {
            err: `Username is in use!`
        }
    }

    // Store user
    const user = { id, username, room };
    users.push(user);

    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex( user => user.id === id )

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => users.find( user => user.id === id )


const getUsersInRoom = (room) => users.filter( user => user.room === room.toString() )

module.exports = { 
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom 
}
