const axios = require("axios");

axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
  email: "contact@crumbellainnovativefoods.in",
  password: "7SW$Tm5rzSIXM8!iqOXU6GR9eaDidqHm"
})
.then(res => console.log(res.data))
.catch(err => console.log(err.response?.data));