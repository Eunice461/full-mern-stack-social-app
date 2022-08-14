const client = require('../redis-connect')

async function httpRedisForArray(req, res){
    try {
        const notAllowedWords = 'bad fuck people'

    const arrayOfString = notAllowedWords.split(" ");

    await client.lpush('badnames', arrayOfString)
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    httpRedisForArray
}