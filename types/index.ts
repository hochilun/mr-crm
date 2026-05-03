export type HospitalLevel = '醫學中心' | '區域醫院' | '地區醫院' | '診所';

export type Hospital = {
  id: string;
  user_id: string;
  name: string;
  level: HospitalLevel | null;
  address: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

export type Department = {
  id: string;
  user_id: string;
  hospital_id: string;
  name: string;
  created_at: string;
};

export type Doctor = {
  id: string;
  user_id: string;
  hospital_id: string;
  department_id: string | null;
  name: string;
  title: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  unit: string;
  created_at: string;
};

export type Visit = {
  id: string;
  user_id: string;
  doctor_id: string;
  hospital_id: string;
  visited_at: string;
  content: string | null;
  next_action: string | null;
  created_at: string;
};

export type ProductUsage = {
  id: string;
  user_id: string;
  doctor_id: string;
  product_id: string;
  month: string;
  quantity: number;
  created_at: string;
};
