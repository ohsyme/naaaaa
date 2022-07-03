const axios = require('axios')
async function wait() {
    await axios.get('https://www.npmjs.com/package/nana-api')
    .then(async(res) => {
    let url = res.request._redirectable._currentUrl;
    console.log(res)
    console.log(url)
    })
}
wait()