-- Seed artwork_reviews table for existing artworks needing admin review
-- Run this in Supabase SQL Editor to backfill missing review records
-- Based on registered_arts data with status 'flagged' or 'under_review'

INSERT INTO artwork_reviews (artwork_id, status, reviewer_id, assigned_at)
VALUES ('0f836266-d713-4639-9321-fbc6b7799a5f', 'pending', NULL, NULL)
ON CONFLICT (artwork_id) DO NOTHING;

INSERT INTO artwork_reviews (artwork_id, status, reviewer_id, assigned_at)
VALUES ('10f686bf-e445-48cf-9bfe-642727731813', 'pending', NULL, NULL)
ON CONFLICT (artwork_id) DO NOTHING;

INSERT INTO artwork_reviews (artwork_id, status, reviewer_id, assigned_at)
VALUES ('5ce69caa-3645-4bca-9be6-157b1f7fbd36', 'pending', NULL, NULL)
ON CONFLICT (artwork_id) DO NOTHING;

INSERT INTO artwork_reviews (artwork_id, status, reviewer_id, assigned_at)
VALUES ('da8d0cfa-b7e1-43ca-840e-107169b0857d', 'pending', NULL, NULL)
ON CONFLICT (artwork_id) DO NOTHING;