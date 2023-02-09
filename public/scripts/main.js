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
});
