const kpi_id_mapping = {
    new_cx: 497, // total new_cx
    repeat_cx: 498, // total repeat_cx
    daily_gmv: 491, // current day total gmv
    mtd_gmv: 486,   //  total for running month
    no_of_dormant_cust: 492, // total dormant cust for running month
    cl_count: 489,  //  total cl assigned with bd
    cl_income: 490, // total cl income
    customer_rto: 493,  //  total rto value for running month
    asog_gmv_perc: 494, // asog_gmv_perc / no of cl
    current_ddr: 496, // avg gmv for month
    daily_active_cl: 488, // cl ordered for current day
    avg_gmv_per_cl: 499 // total gmv/ no of cl
}
const kpi_type_mapping = {
    new_cx: 'int', 
    repeat_cx: 'int', 
    daily_gmv: 'float', 
    mtd_gmv: 'int',   
    no_of_dormant_cust: 'int', 
    cl_count: 'int',  
    cl_income: 'int', 
    customer_rto: 'int',  
    asog_gmv_perc: 'int', 
    current_ddr: 'int', 
    daily_active_cl: 'int', 
    avg_gmv_per_cl: 'int' 
}

module.exports = { kpi_id_mapping, kpi_type_mapping }
