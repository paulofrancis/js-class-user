class UserController {

    constructor(formId, formUpdateId, tableId) {
        this.formEl = document.getElementById(formId);
        this.formUpdateEl = document.getElementById(formUpdateId);
        this.tableEl = document.getElementById(tableId);

        this.onEdit();
        this.onSubmit();
        this.selectAll();
    }

    onSubmit() {

        this.formEl.addEventListener('submit', e => {
            e.preventDefault();

            let btnSubmit = this.formEl.querySelector('[type=submit');
            btnSubmit.disabled = true;

            let values = this.getValues(this.formEl);

            if (!values) return false;

            this.getPhoto(this.formEl).then((result) => {

                values.photo = result;
                values.save();
                this.addLine(values);
                this.formEl.reset();
                btnSubmit.disabled = false;

            }).catch((err) => {

                console.error(err);

            });

        });
    }

    onEdit() {

        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e => {

            this.updatePanelDisplay('block', 'none');

        });

        this.formUpdateEl.addEventListener('submit', e => {

            e.preventDefault();

            let btnSubmit = this.formEl.querySelector('[type=submit');
            btnSubmit.disabled = true;

            let values = this.getValues(this.formUpdateEl);
            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);
            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formUpdateEl).then((content) => {

                if (!values.photo) {
                    result._photo = userOld._photo;
                } else {
                    result._photo = content;
                }

                let user = new User();
                user.loadFromJSON(result);

                user.save();

                this.getTr(user, tr);

                this.updateCount();

                btnSubmit.disabled = false;
                this.formUpdateEl.reset();
                this.updatePanelDisplay('block', 'none');

            }).catch((err) => {
                console.error(err);
            });
        });

    }

    getValues(formEl) {

        let user = {};
        let isValid = true;

        [...formEl.elements].forEach((field, index) => {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {

                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            if (field.name == 'gender') {

                if (field.checked) {
                    user[field.name] = field.value;
                }

            } else if (field.name == 'admin') {

                user[field.name] = field.checked;

            } else {

                user[field.name] = field.value;

            }
        });

        if (!isValid) {
            return false;
        }

        return new User(
            user.name,
            user.gender,
            user.dob,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );
    }

    addLine(user) {

        let tr = this.getTr(user);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    selectAll() {

        let users = User.getUserStorage();

        users.forEach(data => {
            let user = new User();
            user.loadFromJSON(data);
            this.addLine(user);
        });
    }

    addEventsTr(tr) {

        tr.querySelector('.btn-delete').addEventListener('click', e => {

            if (confirm('Deseja realmente excluir?')) {

                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();
                tr.remove();

                this.updateCount();
            }

        });

        tr.querySelector('.btn-edit').addEventListener('click', e => {

            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {

                let field = this.formUpdateEl.querySelector('[name=' + name.replace('_', '') + ']');

                if (field) {

                    switch (field.type) {
                        case 'file':
                            continue;
                            break;

                        case 'radio':
                            field = this.formUpdateEl.querySelector('[name=' + name.replace('_', '') + '][value=' + json[name] + ']');
                            field.checked = true;
                            break;

                        case 'checkbox':
                            field.checked = json[name];
                            break;

                        default:
                            field.value = json[name];
                            break;
                    }
                }
            }

            this.formUpdateEl.querySelector('.photo').src = json._photo;

            this.updatePanelDisplay('none', 'block');
        });
    }

    getTr(user, tr = null) {

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(user);

        tr.innerHTML = `
            <td><img src="${user.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${(user.admin) ? 'Yes' : 'No'}</td>
            <td>${Utils.dateFormat(user.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-xs btn-flat btn-edit">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat btn-delete">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr);

        return tr;
    }

    updatePanelDisplay(displayCreate, displayUpdate) {

        document.querySelector('#box-user-create').style.display = displayCreate;
        document.querySelector('#box-user-update').style.display = displayUpdate;

    }

    updateCount() {

        let numberUsers = 0;
        let numberAdmins = 0;

        [...this.tableEl.children].forEach(tr => {

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);
            if (user._admin) numberAdmins++;

        });

        document.querySelector('#number-users').innerHTML = numberUsers;
        document.querySelector('#number-admins').innerHTML = numberAdmins;
    }

    getPhoto(formEl) {
        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {
                if (item.name === 'photo') return item;
            });

            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = e => {
                reject(e);
            };

            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }
        });
    }

}