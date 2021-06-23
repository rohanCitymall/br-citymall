const axios = require("axios");

const config = {
        'Cookie': 'G_ENABLED_IDPS=google; _ga=GA1.2.1705880341.1617628775; _gid=GA1.2.1552796226.1624270578; G_AUTHUSER_H=0; metabase.SESSION=02c629e4-60a4-491b-872a-9da791f0492b; _gat=1',
        'Referer': 'https://analytics.citymall.live/question',
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Origin': 'https://analytics.citymall.live',
        'Referer': 'https://analytics.citymall.live/question'
};

const axiosMetabse = axios.create({
    headers: config
})

module.exports = axiosMetabse