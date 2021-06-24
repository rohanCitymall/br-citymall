CREATE TABLE br_bd_users(
  admin_id BIGINT PRIMARY KEY,
  br_id BIGINT,
  name TEXT,
  emp_role_id TEXT,
  designation_name TEXT,
  role TEXT,
  role_name TEXT,
  email TEXT,
  mobile TEXT,
  reportee_br_id BIGINT,
  reportee_name TEXT,
  reportee_emp_role_id TEXT,
  created_date DATE,
  deleted_date DATE,
  is_available BIGINT,
  last_login_date DATE
);