
-- Add insurance_plan_id to sales_requests table
ALTER TABLE public.sales_requests 
ADD COLUMN insurance_plan_id uuid REFERENCES public.insurance_plans(id);

-- Update beneficiaries table to replace percentage with price
ALTER TABLE public.beneficiaries 
ADD COLUMN price numeric;

-- We'll keep percentage for now to avoid breaking existing data, but price will be the new field
-- The percentage field can be dropped in a future migration once all data is migrated
