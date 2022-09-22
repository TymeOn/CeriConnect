export class User {
    
    constructor(_id, _username, _password, _lastname, _firstname, _birthday, _status, _avatar) {
        this.id = _id;
        this.username = _username;
        this.password = _password;
        this.lastname = _lastname;
        this.firstname = _firstname;
        this.birthday = _birthday;
        this.status = _status;
        this.avatar = _avatar;
    }

    // getters
    getId() { return this.id; }
    getUsername() { return this.username; }
    getPassword() { return this.password; }
    getLastname() { return this.lastname; }
    getFirstname() { return this.firstname; }
    getBirthday() { return this.birthday; }
    getStatus() { return this.status; }
    getAvatar() { return this.avatar; }

    // setters
    setId(_id) { this.id = _id; }
    setUsername(_username) { this.username = _username; }
    setPassword(_password) { this.password = _password; }
    setLastname(_lastname) { this.lastname = _lastname; }
    setFirstname(_firstname) { this.firstname = _firstname; }
    setBirthday(_birthday) { this.birthday = _birthday; }
    setStatus(_status) { this.status = _status; }
    setAvatar(_avatar) { this.avatar = _avatar; }

}
