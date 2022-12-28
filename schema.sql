DROP TABLE IF EXISTS site_stats;
CREATE TABLE site_stats (created_at INT, members_online INT, active_members INT, active_listings INT, PRIMARY KEY (`created_at`));