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

const body = {
    type: "native",
    native: {
        query: `select \n    tl.name as name,\n    tl.id as erp_id,\n    'Individual' as type,\n    ua.city as city,\n    p.district as district,\n    ua.state as state,\n    ua.pincode as pincode,\n    tl.phone_number as mobile,\n    (\n        case\n            when discarded_at is null then 1\n            else 0\n        end\n    ) as is_available,\n    1 as status\nfrom bd_leader_mapping blm\njoin team_leaders tl on blm.leader_id = tl.id\njoin \n(\n    select \n        u.user_id, \n        u.city, \n        u.state, \n        u.pincode \n    from user_addresses u where u.user_id in (select distinct user_id from user_addresses) \n) ua \non ua.user_id = tl.user_id\njoin pincodes p on ua.pincode = p.pincode order by tl.phone_number limit 10`,
        "template-tags": {},
    },
    database: 2,
    parameters: [],
};

const axiosCreate = axios.create({
    headers: config
})

module.exports = axiosCreate