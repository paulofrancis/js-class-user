class User {

    constructor(name, gender, dob, country, email, password, photo, admin) {
        this._id;
        this._name = name;
        this._gender = gender;
        this._dob = dob;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get gender() {
        return this._gender;
    }

    get dob() {
        return this._dob;
    }

    get country() {
        return this._country;
    }

    get email() {
        return this._email;
    }

    get password() {
        return this._password;
    }

    get photo() {
        return this._photo;
    }

    set photo(value) {
        this._photo = value;
    }

    get admin() {
        return this._admin;
    }

    get register() {
        return this._register;
    }

    loadFromJSON(json) {

        for (let name in json) {
            switch (name) {
                case '_register':
                case '_dob':
                    this[name] = new Date(json[name]);
                    break;
                default:
                    this[name] = json[name];
                    break;
            }
        }
    }

    save(isLocalStorage = true) {

        let users = User.getUserStorage(isLocalStorage);

        if (this.id > 0) {

            users.map(u => {

                if (u._id == this.id) {
                    Object.assign(u, this);
                }
                return u;
            });

        } else {
            this._id = this.getNewId();
            users.push(this);
        }

        if (isLocalStorage) {
            localStorage.setItem('users', JSON.stringify(users));
        } else { // sessionStorage
            sessionStorage.setItem('users', JSON.stringify(users));
        }
    }

    getNewId() {

        let usersId = parseInt(localStorage.getItem('usersId'));

        if (usersId > 0) usersId = 0;

        usersId++;

        localStorage.setItem('usersId', usersId);

        return usersId;
    }

    static getUserStorage(isLocalStorage = true) {
        let users = [];

        if (isLocalStorage) {
            if (localStorage.getItem('users')) {
                users = JSON.parse(localStorage.getItem('users'));
            }
        } else {
            if (sessionStorage.getItem('users')) {
                users = JSON.parse(sessionStorage.getItem('users'));
            }
        }

        return users;
    }

    remove(isLocalStorage = true) {

        let users = User.getUserStorage();

        users.forEach((data, index) => {

            if (this._id == data._id) {
                users.splice(index, 1);
            }
        });

        if (isLocalStorage) {
            localStorage.setItem('users', JSON.stringify(users));
        } else { // sessionStorage
            sessionStorage.setItem('users', JSON.stringify(users));
        }
    }

}