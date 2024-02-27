async function stores() {
    //return (await (await fetch('../stores.json ')).json());

    const response = await fetch('../stores.json ');
    const store = await response.json();

    return store;
}

document.getElementById('btn').addEventListener('click', async() => {
    let store = [];

    try {
        store = await stores();
    } catch (e) {
        console.log("Error!");
        console.log(e);
    }

    console.log(store);
})