-- 1. Enable the extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Add a Geography column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS location_geog GEOGRAPHY(POINT, 4326);

-- 3. Backfill existing GPS data quietly
UPDATE user_profiles
SET location_geog = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 4. Create a GiST Index
CREATE INDEX IF NOT EXISTS idx_user_profiles_location_geog 
ON user_profiles USING GIST (location_geog);
