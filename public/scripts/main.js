window.addEventListener("load", () => {
    // register form
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async (_event) => {
            _event.preventDefault();

            const reqBody = {};

            reqBody.firstName = _event.currentTarget.firstName.value;
            reqBody.lastName = _event.currentTarget.lastName.value;
            reqBody.email = _event.currentTarget.email.value;
            reqBody.phone = _event.currentTarget.phone.value;
            reqBody.password = _event.currentTarget.password.value;

            const resp = await apiClient.request({ url: "/api/users", body: reqBody, method: "POST" });

            if (resp?.status) {
                localStorage.setItem("user", JSON.stringify(resp?.data));
                window.location.assign("/");
            } else {
                document.getElementById("register-error").innerHTML = resp.error;
            }
        });
    }

    const loginForm = document.getElementById("login-form");

    // login form
    if (loginForm) {
        loginForm.addEventListener("submit", async (_event) => {
            _event.preventDefault();

            const reqBody = {};

            reqBody.phone = _event.currentTarget.phone.value;
            reqBody.password = _event.currentTarget.password.value;

            const resp = await apiClient.request({ url: "/api/tokens", body: reqBody, method: "POST" });

            if (resp?.status) {
                localStorage.setItem("user", JSON.stringify(resp?.data));
                window.location.assign("/");
            } else {
                document.getElementById("login-error").innerHTML = resp.error;
            }
        });
    }

    const getUserData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const resp = await apiClient.request({
                url: `/api/users`,
                method: "GET",
                query: {
                    phone: user.phone,
                },
            });

            return resp?.data || {};
        } catch (error) {
            console.log(error);
            return {};
        }
    };

    // update form
    const updateForm = document.getElementById("update-account-form");

    if (updateForm) {
        const populateForm = async () => {
            try {
                const user = await getUserData();

                updateForm.firstName.value = user.firstName;
                updateForm.lastName.value = user.lastName;
                updateForm.email.value = user.email;
                updateForm.phone.value = user.phone;

                updateForm.classList.remove("empty");
            } catch (error) {
                console.log(error);
            }
        };

        populateForm();

        updateForm.addEventListener("submit", async (_event) => {
            _event.preventDefault();
            const reqBody = {};
            reqBody.firstName = _event.currentTarget.firstName.value;
            reqBody.lastName = _event.currentTarget.lastName.value;
            reqBody.email = _event.currentTarget.email.value;

            if (_event.currentTarget.password.value >= 8) {
                reqBody.password = _event.currentTarget.password.value;
            }

            const resp = await apiClient.request({
                url: "/api/users",
                body: reqBody,
                method: "PUT",
                query: {
                    phone: _event.currentTarget.phone.value,
                },
            });

            if (resp?.status) {
                window.location.reload();
            } else {
                document.getElementById("update-error").innerHTML = resp.error;
            }
        });
    }

    // logout
    const logoutBtn = document.getElementById("btn-logout");

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem("user");
            window.location.replace("/login");
        };
    }

    // delete account
    const deleteAccount = document.getElementById("account-delete");

    if (deleteAccount) {
        console.log("working");
        deleteAccount.onclick = async () => {
            try {
                const resp = await apiClient.request({
                    url: "/api/users",
                    method: "DELETE",
                    query: {
                        phone: JSON.parse(localStorage.getItem("user"))?.phone,
                    },
                });

                console.log(resp);

                if (resp?.status) {
                    localStorage.removeItem("user");
                    window.location.assign("/register");
                }
            } catch (error) {
                console.log(error);
            }
        };
    }

    // add check
    const addCheckForm = document.getElementById("add-check-form");

    if (addCheckForm) {
        console.log("form found");

        addCheckForm.onsubmit = async (_event) => {
            _event.preventDefault();

            const reqObj = {};

            reqObj.protocol = _event.target.protocol.value;
            reqObj.url = _event.target.url.value;
            reqObj.timeout = Number(_event.target.timeout.value) || 0;

            const successCodes = [];

            if (_event.target["s_c-200"].checked) {
                successCodes.push(200);
            }

            if (_event.target["s_c-201"].checked) {
                successCodes.push(201);
            }

            if (_event.target["s_c-202"].checked) {
                successCodes.push(202);
            }

            if (_event.target["s_c-203"].checked) {
                successCodes.push(203);
            }

            if (_event.target["s_c-204"].checked) {
                successCodes.push(204);
            }

            reqObj.successCodes = successCodes;

            const resp = await apiClient.request({
                url: "/api/checks",
                body: reqObj,
                method: "POST",
                query: {
                    phone: JSON.parse(localStorage.getItem("user"))?.phone,
                },
            });

            if (resp?.status) {
                window.location.reload();
            } else {
                document.getElementById("add-check-error").innerHTML = resp.error;
            }
        };
    }

    // render all checks
    const checksContainer = document.getElementById("all-checks-table");
    if (checksContainer) {
        async function getAllUserChecks() {
            try {
                const resp = await apiClient.request({
                    url: "/api/checks",
                    method: "GET",
                    query: {
                        phone: JSON.parse(localStorage.getItem("user"))?.phone,
                    },
                });

                if (resp?.status) {
                    let content = "";
                    resp.data.checks.forEach((item) => {
                        content += `<tr>
                        <td class="p-2 border border-gray-300">${item?.protocol}</td>
                        <td class="p-2 border border-gray-300">${item?.url}</td>
                        <td class="p-2 border border-gray-300">${item?.successCodes?.reduce((acc, curr) => {
                            return acc + `${curr} `;
                        }, "")}</td>
                        <td class="p-2 border border-gray-300">
                            ${item?.timeout}
                        </td>
                        <td class="p-2 border border-gray-300">
                            <button
                                data-delete-check="${item?.id}"
                                class="text-white bg-indigo-500 border-0 py-1 px-4 focus:outline-none hover:bg-indigo-600 rounded text-sm"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>`;
                    });

                    checksContainer.innerHTML = content;
                    bindDeleteButtons();
                }
            } catch (error) {
                window.location.reload();
            }
        }

        getAllUserChecks();
    }

    // delete checks
    const deleteCheck = async (id) => {
        const reqBody = {};
        reqBody.checkId = id;

        try {
            const resp = await apiClient.request({
                url: "/api/checks",
                method: "DELETE",
                body: reqBody,
                query: {
                    phone: JSON.parse(localStorage.getItem("user"))?.phone,
                },
            });

            if (resp.status) {
                window.location.reload();
            } else {
                window.alert(resp?.error);
            }
        } catch (error) {
            window.alert(error?.message);
            window.location.reload();
        }
    };

    // bind listener with buttons
    const bindDeleteButtons = () => {
        const checkDeletButtons = document.querySelectorAll("button[data-delete-check]");
        checkDeletButtons.forEach((button) => {
            button.onclick = (_event) => {
                const checkId = _event.target.getAttribute("data-delete-check");
                deleteCheck(checkId);
            };
        });
    };
});
