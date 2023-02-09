// app container
const apiClient = {
    accessToken: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))?.token?.key : null,
    request: async ({ url, query, body, header, method = "GET" }) => {
        let constructUrl = url;
        let constructHeader = { "Content-Type": "application/json", Authorization: `Bearer ${apiClient.accessToken}` };

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

            const data = await resp.json();
            return data;
        } catch (error) {
            console.log(error);
            return {};
        }
    },
};

window.apiClient = apiClient;
