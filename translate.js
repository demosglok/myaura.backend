const axios = require('axios');

axios.post('https://translation.googleapis.com/language/translate/v2',{q:"Hello, i'm Dima",target:'ru',format:'text', key:'20b8987cd236ca654380432745c65781aacecbb9'})
.then(res => console.log(res))
.catch(e => console.log(e));