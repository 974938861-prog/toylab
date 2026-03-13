export interface Profile {
  id: string;
  username: string;
  nickname: string | null;
  avatar_url: string | null;
  avatar_color: string;
  bio: string | null;
  role: "user" | "creator" | "admin";
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: number | null;
  sort_order: number;
  children?: ProductCategory[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: number;
  description: string | null;
  spec: string | null;
  price: number;
  cover_url: string | null;
  model_3d_url: string | null;
  stock_status: string;
  sales_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  category?: ProductCategory;
}

export interface Case {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  description: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  price: number;
  is_free: boolean;
  is_published: boolean;
  creator_id: string;
  view_count: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export interface CaseBomItem {
  id: string;
  case_id: string;
  item_type: string;
  name: string;
  spec: string | null;
  unit_price: number;
  required_qty: number;
  doc_url: string | null;
  sort_order: number;
  product_id: string | null;
}

export interface CaseStep {
  id: string;
  case_id: string;
  step_number: number;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  duration_minutes: number | null;
}

export interface CaseResource {
  id: string;
  case_id: string;
  resource_type: string;
  name: string;
  file_url: string | null;
  file_size: number | null;
  description: string | null;
}

export interface CaseDevLog {
  id: string;
  case_id: string;
  title: string;
  content: string | null;
  log_date: string;
  sort_order: number;
}

export interface Comment {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  content: string;
  created_at: string;
  user?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPart {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  last_used_project: string | null;
  firmware_version: string | null;
  added_at: string;
  product?: Product;
}
