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
            localStorage.setItem("accessToken", resp?.data?.token);
        }
    });
}
