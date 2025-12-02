const getdetails = async()=>{
    let response = await fetch("/me", {
        method : "POST",
        credentials : "include"
    })

    let data = await response.json()
    if (data.msg === "NotloggedIn"){
        window.location.href = "http://localhost:3000"
    }else{
        return data.email
    }
}
 useremail = getdetails()   

 const getinfo = async()=>{
 let response = await fetch("/profile", {
            method : "POST",
            credentials : "include"
        })

        let data = await response.json()
        username = data.name
        document.querySelector(".user-name").innerHTML = username
        if(!(data.msg)){
            console.log("No Blogs Yet!")
        }else{
            console.log(data.msg)
        }
    }
 

 getinfo()
       




