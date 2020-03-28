class UserController {

    constructor(formId, formUpdateId, tableId) {
        this.formEl = document.getElementById(formId);
        this.formUpdateEl = document.getElementById(formUpdateId);
        this.tableEl = document.getElementById(tableId);

        this.onEdit();
        this.onSubmit();
    }

    onSubmit() {

        this.formEl.addEventListener('submit', e => {
            e.preventDefault();

            let btnSubmit = this.formEl.querySelector('[type=submit');
            btnSubmit.disabled = true;

            let values = this.getValues(this.formEl);

            if (!values) return false;

            this.getPhoto().then((result) => {

                values.photo = result;
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
            tr.dataset.user = JSON.stringify(values);

            tr.innerHTML = `
                <td><img src="${values.photo}" alt="User Image" class="img-circle img-sm"></td>
                <td>${values.name}</td>
                <td>${values.email}</td>
                <td>${(values.admin) ? 'Yes' : 'No'}</td>
                <td>${Utils.dateFormat(values.register)}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-xs btn-flat btn-edit">Editar</button>
                    <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                </td>
            `;

            this.addEventsTr(tr);
            this.updateCount();
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

        let tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(user);

        tr.innerHTML = `
            <td><img src="${user.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${(user.admin) ? 'Yes' : 'No'}</td>
            <td>${Utils.dateFormat(user.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-xs btn-flat btn-edit">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    addEventsTr(tr) {
        tr.querySelector('.btn-edit').addEventListener('click', e => {

            let json = JSON.parse(tr.dataset.user);
            let form = document.querySelector('#form-user-update');

            form.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {

                let field = form.querySelector('[name=' + name.replace('_', '') + ']');

                if (field) {

                    switch (field.type) {
                        case 'file':
                            continue;
                            break;

                        case 'radio':
                            field = form.querySelector('[name=' + name.replace('_', '') + '][value=' + json[name] + ']');
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

            this.updatePanelDisplay('none', 'block');
        });
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

    getPhoto() {
        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...this.formEl.elements].filter(item => {
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