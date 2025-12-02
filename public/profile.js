const getdetails = async () => {
    let response = await fetch("/me", {
        method: "POST",
        credentials: "include"
    })

    let data = await response.json()
    if (data.msg === "NotloggedIn") {
        window.location.href = "http://localhost:3000"
    } else {
        return data.email
    }
}
useremail = getdetails()

const getinfo = async () => {
    let response = await fetch("/profile", {
        method: "POST",
        credentials: "include"
    })

    let data = await response.json()
    username = data.name
    document.querySelector(".user-name").innerHTML = username
    if (!(data.msg)) {
        console.log("No Blogs Yet!")
    } else {
        // Sample data
        let blogContainer = document.querySelector(".blog-container")
        console.log(data.msg)
         for (let i=0; i<=data.msg.length; i++){
            console.log(data.msg[i])
            let title = (data.msg[i]).title
            let content = (data.msg[i]).content
            console.log(title)
              const blogCard = document.createElement("div");
                blogCard.className = "blog-card";
                const h4 = document.createElement("h4");
                h4.className = "blog-title";
                h4.textContent = title;
                 const p1 = document.createElement("p");
                p1.className = "blog-content";
                p1.textContent = content;
                   blogCard.appendChild(h4);
                    blogCard.appendChild(p1);
                    blogContainer.appendChild(blogCard)

         }

    }
}


getinfo()





