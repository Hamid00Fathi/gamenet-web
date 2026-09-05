async function loadData() {
    const username = document.getElementById("username").value.trim();

    if (!username) {
        alert("لطفاً یوزرنیم را وارد کنید");
        return;
    }

    const res = await fetch(https://gamenet-server.onrender.com/status/${username});
    const data = await res.json();

    const container = document.getElementById("systems");
    container.innerHTML = "";

    for (let key in data) {
        const sys = data[key];

        const div = document.createElement("div");
        div.className = "card " + (sys.active ? "active" : "free");

        div.innerHTML = 
            <h2>${key}</h2>
            <p>وضعیت: ${sys.active ? "فعال" : "آزاد"}</p>
            <p>زمان: ${sys.elapsed}</p>
            <p>هزینه: ${sys.cost} تومان</p>
            <p>نوت: ${sys.note}</p>
        ;

        container.appendChild(div);
    }
}
