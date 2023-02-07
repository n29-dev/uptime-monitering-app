// app container
const app = {
    accessToken: localStorage.getItem("accessToken"),
};

app.fetch = async ({ url, query, body, header, method = "get" }) => {
    let constructUrl = url;
    let constructHeader = { "Content-Type": "application/json", Authorization: `Bearer ${app.accessToken}` };

    // insert query params
    if (query) {
        constructUrl = `${url}?${new URLSearchParams(query).toString()}`;
    }

    // insert headers
    if (header) {
        constructHeader = { ...commonHeaders, ...header };
    }

    try {
        const resp = await fetch(constructUrl, {
            headers: constructHeader,
            method,
            body: JSON.stringify(body),
        });
        //
        const data = await resp.json();
        console.log(data);
    } catch (error) {}
};

document.getElementById("button").onclick = () => {
    app.fetch({ url: "api/users", query: { phone: "01734016309" } });
};
