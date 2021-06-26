const axios = require('axios')
const moment = require('moment')
const axiosMetabase = require('./axios-metabase')
const { kpi_id_mapping: kpiMap, kpi_type_mapping } = require('./kpi-map')

const metaUrl = 'https://analytics.citymall.live/api/card/2108/query'

const metaBody = {
    "ignore_cache": false,
    "parameters": [
        {
            "type": "date/single",
            "target": [
                "variable",
                [
                    "template-tag",
                    "from_date"
                ]
            ],
            "value": "2021-06-01"
        },
        {
            "type": "date/single",
            "target": [
                "variable",
                [
                    "template-tag",
                    "to_date"
                ]
            ],
            "value": "2021-06-26"
        }
    ]
}

let br_admin_mapped = {
    '90': '17042',
    '1001': '17058',
    '1210': '17070',
    '1368': '17048',
    '2918': '17065',
    '3614': '17043',
    '3615': '17044',
    '3616': '17045',
    '3617': '17050',
    '3618': '17051',
    '3620': '17054',
    '3621': '17056',
    '3622': '17057',
    '3624': '17061',
    '3625': '17059',
    '3626': '17064',
    '3628': '17067',
    '3629': '17068',
    '3633': '17062',
    '3635': '17066',
    '4186': '17055',
    '4795': '17052',
    '4951': '17069',
    '5069': '17046',
    '5138': '17060',
    '5481': '17072',
    '5482': '17071',
    '5483': '17053'
}

async function uploadKpi(){
    const res = await axiosMetabase.post(metaUrl,metaBody)
    let data = []
    let fields = res.data.data.cols.map(el => el.name)

    res.data.data.rows.forEach(record => {
        const obj = {}
        fields.forEach((e,i) => {
            obj[e] = record[i]
        })
        data.push(obj)
    });

    data = data.map((rec,i) => {
        return {
            user_br_id: parseInt(br_admin_mapped[rec.bd_id]),
            activity_date: moment().format('YYYY-MM-DD'),
            kpi: fields.slice(1).map(el => {
                if(kpi_type_mapping[el] === 'int') {
                    return { id: kpiMap[el], value: parseInt(rec[el]) }
                }else{
                    return { id: kpiMap[el], value: parseFloat(rec[el]) }
                }
            })
        }
    })
    data = data.filter(rec => !isNaN(rec.user_br_id))
    
    const result = await axios.post('https://devapi.vwbeatroute.com/v1/kpi/update-actual?key=mLIuBnWREzA6jthvp~aZMoBVZHLIp1SV',data,{
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    console.log(result.data)
}

uploadKpi()
