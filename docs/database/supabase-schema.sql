


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."account_status" AS ENUM (
    'active',
    'suspended',
    'banned'
);


ALTER TYPE "public"."account_status" OWNER TO "postgres";


CREATE TYPE "public"."appeal_status" AS ENUM (
    'submitted',
    'under_review',
    'accepted',
    'denied'
);


ALTER TYPE "public"."appeal_status" OWNER TO "postgres";


CREATE TYPE "public"."art_post_visibility" AS ENUM (
    'public',
    'followers_only',
    'private'
);


ALTER TYPE "public"."art_post_visibility" OWNER TO "postgres";


CREATE TYPE "public"."art_reaction_type" AS ENUM (
    'upvote',
    'downvote'
);


ALTER TYPE "public"."art_reaction_type" OWNER TO "postgres";


CREATE TYPE "public"."art_status" AS ENUM (
    'active',
    'flagged',
    'under_review',
    'removed',
    'pending_blockchain',
    'blockchain_failed',
    'revoked'
);


ALTER TYPE "public"."art_status" OWNER TO "postgres";


CREATE TYPE "public"."attachment_role" AS ENUM (
    'reporter',
    'moderator'
);


ALTER TYPE "public"."attachment_role" OWNER TO "postgres";


CREATE TYPE "public"."case_message_author_role" AS ENUM (
    'moderator',
    'reporter',
    'reported_user',
    'system'
);


ALTER TYPE "public"."case_message_author_role" OWNER TO "postgres";


CREATE TYPE "public"."case_message_category" AS ENUM (
    'message',
    'request_information',
    'decision',
    'system'
);


ALTER TYPE "public"."case_message_category" OWNER TO "postgres";


CREATE TYPE "public"."case_message_visibility" AS ENUM (
    'internal',
    'to_reporter',
    'to_reported_user',
    'shared'
);


ALTER TYPE "public"."case_message_visibility" OWNER TO "postgres";


CREATE TYPE "public"."moderation_action_type" AS ENUM (
    'content_removed',
    'content_restored',
    'content_flagged_nsfw',
    'user_warned',
    'user_suspended',
    'user_banned',
    'user_restored',
    'assigned',
    'unassigned',
    'status_change',
    'note_added',
    'evidence_requested',
    'evidence_reviewed',
    'case_dismissed',
    'case_resolved',
    'case_reopened',
    'appeal_received',
    'appeal_granted',
    'appeal_denied',
    'bulk_action',
    'message_sent',
    'information_requested',
    'decision_recorded_communication',
    'system_notification'
);


ALTER TYPE "public"."moderation_action_type" OWNER TO "postgres";


CREATE TYPE "public"."moderation_priority" AS ENUM (
    'critical',
    'high',
    'normal'
);


ALTER TYPE "public"."moderation_priority" OWNER TO "postgres";


CREATE TYPE "public"."moderation_status" AS ENUM (
    'open',
    'triaged',
    'investigating',
    'pending_action',
    'resolved',
    'dismissed',
    'appealed'
);


ALTER TYPE "public"."moderation_status" OWNER TO "postgres";


CREATE TYPE "public"."note_visibility" AS ENUM (
    'internal',
    'reporter_visible'
);


ALTER TYPE "public"."note_visibility" OWNER TO "postgres";


CREATE TYPE "public"."report_status" AS ENUM (
    'pending_review',
    'under_review',
    'resolved'
);


ALTER TYPE "public"."report_status" OWNER TO "postgres";


CREATE TYPE "public"."report_target_type" AS ENUM (
    'artwork',
    'comment',
    'user',
    'collection'
);


ALTER TYPE "public"."report_target_type" OWNER TO "postgres";


CREATE TYPE "public"."report_type" AS ENUM (
    'copyright',
    'spam',
    'harassment',
    'nudity',
    'violence',
    'hate',
    'other'
);


ALTER TYPE "public"."report_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_art_post_owner_match"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_owner_id uuid;
begin
  select owner_id
  into v_owner_id
  from public.registered_arts
  where id = new.art_id;

  if v_owner_id is null then
    raise exception 'Artwork does not exist.';
  end if;

  if v_owner_id <> new.user_id then
    raise exception 'You can only create a post for your own artwork.';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_art_post_owner_match"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_moderation_enforcement_stats"("p_days" integer DEFAULT 7) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  result jsonb;
  since timestamptz;
BEGIN
  since := now() - (p_days || ' days')::interval;
  SELECT jsonb_build_object(
    'warnings',    (SELECT count(*) FROM moderation_actions
                    WHERE action_type = 'user_warned'      AND created_at >= since),
    'suspensions', (SELECT count(*) FROM moderation_actions
                    WHERE action_type = 'user_suspended'    AND created_at >= since),
    'bans',        (SELECT count(*) FROM moderation_actions
                    WHERE action_type = 'user_banned'       AND created_at >= since),
    'removals',    (SELECT count(*) FROM moderation_actions
                    WHERE action_type = 'content_removed'   AND created_at >= since),
    'dismissed',   (SELECT count(*) FROM moderation_actions
                    WHERE action_type = 'case_dismissed'    AND created_at >= since),
    'restored',    (SELECT count(*) FROM moderation_actions
                    WHERE action_type = 'content_restored'  AND created_at >= since)
  ) INTO result;
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_moderation_enforcement_stats"("p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_moderation_queue_health"() RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'critical', (SELECT count(*) FROM moderations
                 WHERE priority = 'critical' AND status NOT IN ('resolved', 'dismissed')),
    'high',     (SELECT count(*) FROM moderations
                 WHERE priority = 'high'     AND status NOT IN ('resolved', 'dismissed')),
    'normal',   (SELECT count(*) FROM moderations
                 WHERE priority = 'normal'   AND status NOT IN ('resolved', 'dismissed')),
    'appealed', (SELECT count(*) FROM moderations WHERE status = 'appealed'),
    'avg_resolution_hours', (
      SELECT COALESCE(ROUND(AVG(
        EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
      )::numeric, 1), 0)
      FROM moderations WHERE resolved_at >= current_date - interval '30 days'
    ),
    'oldest_open_hours', (
      SELECT COALESCE(ROUND(
        EXTRACT(EPOCH FROM (now() - created_at)) / 3600
      )::numeric, 0)
      FROM moderations WHERE status NOT IN ('resolved', 'dismissed')
      ORDER BY created_at LIMIT 1
    ),
    'resolved_today', (
      SELECT count(*) FROM moderations WHERE resolved_at >= current_date
    )
  ) INTO result;
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_moderation_queue_health"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_moderation_trends"("p_days" integer DEFAULT 7) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  result jsonb;
  since timestamptz;
BEGIN
  since := now() - (p_days || ' days')::interval;
  SELECT jsonb_build_object(
    'reports_by_type', (
      SELECT COALESCE(jsonb_object_agg(report_type, cnt), '{}'::jsonb) FROM (
        SELECT r.report_type, count(*) as cnt
        FROM reports r
        JOIN moderations m ON m.report_id = r.id
        WHERE r.created_at >= since
        GROUP BY r.report_type
      ) sub
    ),
    'resolution_trend', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object('date', d::date, 'count', COALESCE(c, 0))
      ) FILTER (WHERE d IS NOT NULL), '[]'::jsonb)
      FROM generate_series(since::date, current_date, '1 day') d
      LEFT JOIN (
        SELECT resolved_at::date, count(*) as c
        FROM moderations
        WHERE resolved_at >= since
        GROUP BY resolved_at::date
      ) t ON t.resolved_at::date = d::date
    ),
    'repeat_offenders', (
      SELECT count(*) FROM (
        SELECT target_user_id FROM moderation_actions
        WHERE target_user_id IS NOT NULL
          AND action_type IN ('user_warned', 'user_suspended', 'user_banned')
          AND created_at >= since
        GROUP BY target_user_id HAVING count(*) >= 2
      ) sub
    )
  ) INTO result;
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_moderation_trends"("p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_moderator_activity"("p_moderator_id" "uuid" DEFAULT NULL::"uuid", "p_days" integer DEFAULT 1) RETURNS TABLE("moderator_id" "uuid", "moderator_name" "text", "action_type" "public"."moderation_action_type", "action_count" bigint, "last_action_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    ma.moderator_id,
    u.first_name || ' ' || COALESCE(u.last_name, '') as moderator_name,
    ma.action_type,
    count(*) as action_count,
    max(ma.created_at) as last_action_at
  FROM moderation_actions ma
  JOIN users u ON u.id = ma.moderator_id
  WHERE ma.created_at >= now() - (p_days || ' days')::interval
    AND (p_moderator_id IS NULL OR ma.moderator_id = p_moderator_id)
  GROUP BY ma.moderator_id, u.first_name, u.last_name, ma.action_type
  ORDER BY action_count DESC;
END;
$$;


ALTER FUNCTION "public"."get_moderator_activity"("p_moderator_id" "uuid", "p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  -- Extract base username from email
  base_username := lower(split_part(new.email, '@', 1));
  base_username := regexp_replace(base_username, '[^a-z0-9_]', '_', 'g');

  final_username := base_username;

  -- Ensure uniqueness
  while exists (
    select 1 from public.users where username = final_username
  ) loop
    counter := counter + 1;
    final_username := base_username || '_' || counter;
  end loop;

  insert into public.users (id, email, first_name, middle_name, last_name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', 'User'),
    new.raw_user_meta_data->>'middle_name',
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'username', final_username)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_preferences"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Inserts a new row using the newly created user's ID
    INSERT INTO public.user_preferences (user_id, show_nsfw_content)
    VALUES (NEW.id, false);
    
    -- In an AFTER INSERT trigger, returning NEW allows the execution to complete normally
    RETURN NEW;
EXCEPTION
    -- Safe guard: If anything goes wrong, log it so it doesn't block the user's main registration flow
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to automatically create user_preferences for user_id: %, Error: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_preferences"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Authorization: only the report's reporter or an admin may mark messages as read
  IF NOT EXISTS (
    SELECT 1 FROM "public"."reports" r
    WHERE r.id = p_report_id
      AND (r.reporter_id = p_user_id OR r.reporter_id = auth.uid())
  ) THEN
    -- Check if caller is admin
    IF NOT EXISTS (
      SELECT 1 FROM "public"."users" u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Not authorized to mark messages as read on this report.';
    END IF;
  END IF;

  UPDATE public.report_comments
  SET read_at = now()
  WHERE report_id = p_report_id
    AND user_id != p_user_id
    AND read_at IS NULL;
END;
$$;


ALTER FUNCTION "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_art_similarity_scan_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_title text;
  v_message text;
  v_type text;
  v_similarity_text text;
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  if old.status is not distinct from new.status then
    return new;
  end if;

  if new.status = 'completed' then
    if coalesce(new.best_similarity_percentage, 0) >= 75 then
      v_type := 'scan_flagged';
      v_title := 'Artwork flagged for review';

      v_similarity_text := trim(to_char(coalesce(new.best_similarity_percentage, 0), 'FM999999990.00'));

      v_message :=
        'Your artwork scan found a notable similarity result of '
        || v_similarity_text
        || '% and was flagged for review.';
    else
      v_type := 'scan_completed';
      v_title := 'Similarity scan completed';
      v_message := 'Your artwork similarity scan completed successfully.';
    end if;

  elsif new.status = 'failed' then
    v_type := 'scan_failed';
    v_title := 'Similarity scan failed';
    v_message := coalesce(
      new.error_message,
      'Your artwork similarity scan could not be completed.'
    );
  else
    return new;
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    related_art_id,
    related_scan_id,
    action_url,
    metadata
  )
  values (
    new.owner_id,
    v_type,
    v_title,
    v_message,
    new.art_id,
    new.id,
    '/profile/artworks/' || new.art_id::text,
    jsonb_build_object(
      'scanStatus', new.status,
      'success', new.success,
      'totalMatches', new.total_matches,
      'bestSimilarityPercentage', new.best_similarity_percentage,
      'bestSource', new.best_source,
      'bestLink', new.best_link
    )
  )
  on conflict do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."notify_art_similarity_scan_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_artwork_registered"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  raise log 'notify_artwork_registered fired: art_id=%, owner_id=%', new.id, new.owner_id;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    related_art_id,
    action_url,
    metadata
  )
  values (
    new.owner_id,
    'artwork_registered',
    'Artwork registered',
    'Your artwork "' || coalesce(new.title, 'Untitled Artwork') || '" was successfully registered.',
    new.id,
    '/profile/artworks/' || new.id::text,
    jsonb_build_object(
      'artTitle', new.title,
      'status', new.status
    )
  )
  on conflict do nothing;

  raise log 'notify_artwork_registered insert attempted: art_id=%', new.id;

  return new;
exception
  when others then
    raise log 'notify_artwork_registered error: %', sqlerrm;
    return new;
end;
$$;


ALTER FUNCTION "public"."notify_artwork_registered"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_blockchain_recorded"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  if old.tx_hash is null and new.tx_hash is not null then
    insert into public.notifications (
      user_id,
      type,
      title,
      message,
      related_art_id,
      action_url,
      metadata
    )
    values (
      new.owner_id,
      'blockchain_recorded',
      'Blockchain record created',
      'Your artwork has been successfully recorded on the blockchain.',
      new.id,
      '/profile/artworks/' || new.id::text,
      jsonb_build_object(
        'chain', new.chain,
        'txHash', new.tx_hash,
        'blockNumber', new.block_number,
        'workId', new.work_id,
        'status', new.status
      )
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."notify_blockchain_recorded"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_report_resolved"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_report_title text;
BEGIN
  -- Only proceed if the status changed to 'resolved' and wasn't already resolved
  IF NEW.status = 'resolved' AND (OLD.status IS DISTINCT FROM 'resolved') THEN
    
    -- Get the report title
    v_report_title := COALESCE(NEW.title, 'Report #' || NEW.id);
    
    -- Notify the reporter (skip if application code already inserted this)
    INSERT INTO public.notifications (
      user_id, type, title, message,
      related_report_id, action_url, metadata, is_read
    ) VALUES (
      NEW.reporter_id,
      'report_resolved',
      'Report Resolved',
      'Your report "' || v_report_title || '" has been resolved.',
      NEW.id,
      '/my-reports/' || NEW.id,
      '{}'::jsonb,
      false
    )
    ON CONFLICT (user_id, related_report_id, type) 
    WHERE related_report_id IS NOT NULL
    DO NOTHING;
    
    -- Notify all admins (except the reporter if they're an admin)
    INSERT INTO public.notifications (
      user_id, type, title, message,
      related_report_id, action_url, metadata, is_read
    )
    SELECT 
      u.id,
      'report_resolved',
      'Report Resolved',
      'Report "' || v_report_title || '" has been resolved.',
      NEW.id,
      '/admin/reports/' || NEW.id,
      '{}'::jsonb,
      false
    FROM public.users u
    WHERE u.role = 'admin' 
      AND u.id != NEW.reporter_id
    ON CONFLICT (user_id, related_report_id, type) 
    WHERE related_report_id IS NOT NULL
    DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_report_resolved"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_report_submitted_to_admins"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_artwork_title text;
BEGIN
  -- Get the artwork title from the art post relationship
  BEGIN
    SELECT COALESCE(ra.title, 'Unknown Artwork') INTO v_artwork_title
    FROM public.art_posts ap
    JOIN public.registered_arts ra ON ra.id = ap.art_id
    WHERE ap.id = NEW.reported_art_post_id;
  EXCEPTION WHEN OTHERS THEN
    v_artwork_title := 'Unknown Artwork';
  END;
  
  -- Notify all admins (skip if application code already inserted)
  INSERT INTO public.notifications (
    user_id, type, title, message,
    related_report_id, action_url, metadata, is_read
  )
  SELECT 
    u.id,
    'report_submitted',
    'New Report Submitted',
    'A new report "' || COALESCE(NEW.title, 'Untitled') || '" has been submitted for artwork "' || v_artwork_title || '".',
    NEW.id,
    '/admin/reports/' || NEW.id,
    '{}'::jsonb,
    false
  FROM public.users u
  WHERE u.role = 'admin'
  ON CONFLICT (user_id, related_report_id, type) 
  WHERE related_report_id IS NOT NULL
  DO NOTHING;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_report_submitted_to_admins"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_report_submitted_to_reporter"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Notify the reporter that their report was submitted (skip if app already did)
  INSERT INTO public.notifications (
    user_id, type, title, message,
    related_report_id, action_url, metadata, is_read
  ) VALUES (
    NEW.reporter_id,
    'report_submitted',
    'Report Submitted',
    'Your report "' || COALESCE(NEW.title, 'Untitled') || '" has been submitted successfully. An administrator will review it shortly.',
    NEW.id,
    '/my-reports/' || NEW.id,
    '{}'::jsonb,
    false
  )
  ON CONFLICT (user_id, related_report_id, type) 
  WHERE related_report_id IS NOT NULL
  DO NOTHING;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_report_submitted_to_reporter"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_art_post_reaction_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if tg_op = 'INSERT' then
    update public.art_posts
    set reaction_count = reaction_count + 1
    where id = new.post_id;

    return new;
  elsif tg_op = 'DELETE' then
    update public.art_posts
    set reaction_count = greatest(reaction_count - 1, 0)
    where id = old.post_id;

    return old;
  end if;

  return null;
end;
$$;


ALTER FUNCTION "public"."sync_art_post_reaction_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_art_post_vote_counts_incremental"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- INSERT
  if tg_op = 'INSERT' then
    if new.reaction_type = 'upvote' then
      update public.art_posts
      set
        upvote_count = upvote_count + 1,
        score = score + 1
      where id = new.post_id;
    elsif new.reaction_type = 'downvote' then
      update public.art_posts
      set
        downvote_count = downvote_count + 1,
        score = score - 1
      where id = new.post_id;
    end if;

    return new;
  end if;

  -- DELETE
  if tg_op = 'DELETE' then
    if old.reaction_type = 'upvote' then
      update public.art_posts
      set
        upvote_count = upvote_count - 1,
        score = score - 1
      where id = old.post_id;
    elsif old.reaction_type = 'downvote' then
      update public.art_posts
      set
        downvote_count = downvote_count - 1,
        score = score + 1
      where id = old.post_id;
    end if;

    return old;
  end if;

  -- UPDATE
  if tg_op = 'UPDATE' then
    -- If vote moved to another post, subtract from old post first
    if old.post_id is distinct from new.post_id then
      if old.reaction_type = 'upvote' then
        update public.art_posts
        set
          upvote_count = upvote_count - 1,
          score = score - 1
        where id = old.post_id;
      elsif old.reaction_type = 'downvote' then
        update public.art_posts
        set
          downvote_count = downvote_count - 1,
          score = score + 1
        where id = old.post_id;
      end if;

      if new.reaction_type = 'upvote' then
        update public.art_posts
        set
          upvote_count = upvote_count + 1,
          score = score + 1
        where id = new.post_id;
      elsif new.reaction_type = 'downvote' then
        update public.art_posts
        set
          downvote_count = downvote_count + 1,
          score = score - 1
        where id = new.post_id;
      end if;

      return new;
    end if;

    -- Same post, reaction type changed
    if old.reaction_type is distinct from new.reaction_type then
      if old.reaction_type = 'upvote' and new.reaction_type = 'downvote' then
        update public.art_posts
        set
          upvote_count = upvote_count - 1,
          downvote_count = downvote_count + 1,
          score = score - 2
        where id = new.post_id;

      elsif old.reaction_type = 'downvote' and new.reaction_type = 'upvote' then
        update public.art_posts
        set
          upvote_count = upvote_count + 1,
          downvote_count = downvote_count - 1,
          score = score + 2
        where id = new.post_id;
      end if;
    end if;

    return new;
  end if;

  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."sync_art_post_vote_counts_incremental"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_moderations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_moderations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_preferences_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_preferences_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "target_user_id" "uuid",
    "action" "text" NOT NULL,
    "reason" "text",
    "previous_value" "text",
    "new_value" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "ip_address" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "admin_audit_logs_action_check" CHECK (("action" = ANY (ARRAY['suspend_user'::"text", 'ban_user'::"text", 'reactivate_user'::"text", 'verify_artist'::"text", 'remove_verification'::"text", 'reset_password'::"text", 'send_notification'::"text", 'force_logout'::"text", 'delete_account'::"text", 'bulk_suspend'::"text", 'bulk_ban'::"text", 'bulk_verify'::"text", 'export_users'::"text", 'moderate_content'::"text", 'warn_user'::"text", 'dismiss_report'::"text", 'resolve_report'::"text", 'assign_case'::"text", 'unassign_case'::"text", 'appeal_reviewed'::"text"])))
);


ALTER TABLE "public"."admin_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."art_genres" (
    "art_id" "uuid" NOT NULL,
    "genre_id" smallint NOT NULL,
    "id" smallint NOT NULL
);


ALTER TABLE "public"."art_genres" OWNER TO "postgres";


ALTER TABLE "public"."art_genres" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."art_genres_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."art_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "art_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "visibility" "public"."art_post_visibility" DEFAULT 'public'::"public"."art_post_visibility" NOT NULL,
    "is_archived" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "upvote_count" integer DEFAULT 0 NOT NULL,
    "downvote_count" integer DEFAULT 0 NOT NULL,
    "score" integer DEFAULT 0 NOT NULL,
    "is_nsfw" boolean DEFAULT false,
    CONSTRAINT "art_posts_downvote_count_check" CHECK (("downvote_count" >= 0)),
    CONSTRAINT "art_posts_upvote_count_check" CHECK (("upvote_count" >= 0))
);


ALTER TABLE "public"."art_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."art_reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reaction_type" "public"."art_reaction_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."art_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."art_similarity_scans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "art_id" "uuid" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "filename" "text",
    "original_hash" "text",
    "success" boolean DEFAULT false NOT NULL,
    "total_matches" integer DEFAULT 0 NOT NULL,
    "best_source" "text",
    "best_link" "text",
    "best_url" "text",
    "best_match_pair" "text",
    "best_similarity_percentage" numeric(5,2),
    "best_min_combined_distance" numeric(10,4),
    "best_average_combined_distance" numeric(10,4),
    "best_max_combined_distance" numeric(10,4),
    "matches" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "hashes" "jsonb",
    "raw_response" "jsonb",
    "error_message" "text",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "art_similarity_scans_best_similarity_percentage_check" CHECK ((("best_similarity_percentage" IS NULL) OR (("best_similarity_percentage" >= (0)::numeric) AND ("best_similarity_percentage" <= (100)::numeric)))),
    CONSTRAINT "art_similarity_scans_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."art_similarity_scans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artwork_review_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "previous_status" "text",
    "new_status" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "artwork_review_actions_action_check" CHECK (("action" = ANY (ARRAY['viewed'::"text", 'assigned'::"text", 'unassigned'::"text", 'approved'::"text", 'rejected'::"text", 'comment_added'::"text", 'information_requested'::"text", 'decision_changed'::"text", 'blockchain_triggered'::"text", 'evidence_submitted'::"text"])))
);


ALTER TABLE "public"."artwork_review_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artwork_review_evidence" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "message" "text",
    "files" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."artwork_review_evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artwork_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artwork_id" "uuid" NOT NULL,
    "reviewer_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "decision" "text",
    "decision_reason" "text",
    "review_notes" "text",
    "requested_documents" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "assigned_at" timestamp with time zone,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resubmission_count" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "artwork_reviews_decision_check" CHECK ((("decision" IS NULL) OR ("decision" = ANY (ARRAY['approved'::"text", 'rejected'::"text", 'needs_info'::"text"])))),
    CONSTRAINT "artwork_reviews_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'under_review'::"text", 'needs_info'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."artwork_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."case_message_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "uploaded_by" "uuid" NOT NULL,
    "storage_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "mime_type" "text",
    "file_size" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."case_message_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."case_message_reads" (
    "message_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "read_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."case_message_reads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."case_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moderation_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "author_role" "public"."case_message_author_role" NOT NULL,
    "message" "text" NOT NULL,
    "category" "public"."case_message_category" DEFAULT 'message'::"public"."case_message_category" NOT NULL,
    "visibility" "public"."case_message_visibility" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."case_messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."case_messages" IS 'Append-only case communication. No update/delete.';



CREATE TABLE IF NOT EXISTS "public"."copyright_context_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moderation_id" "uuid" NOT NULL,
    "artwork_id" "uuid" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "snapshot" "jsonb" NOT NULL,
    "generated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."copyright_context_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."genres" (
    "id" smallint NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."genres" OWNER TO "postgres";


ALTER TABLE "public"."genres" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."genres_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."moderation_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moderation_id" "uuid" NOT NULL,
    "moderator_id" "uuid" NOT NULL,
    "target_user_id" "uuid",
    "action_type" "public"."moderation_action_type" NOT NULL,
    "previous_status" "public"."moderation_status",
    "new_status" "public"."moderation_status",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."moderation_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moderations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "status" "public"."moderation_status" DEFAULT 'open'::"public"."moderation_status" NOT NULL,
    "priority" "public"."moderation_priority" DEFAULT 'normal'::"public"."moderation_priority" NOT NULL,
    "priority_override" boolean DEFAULT false NOT NULL,
    "assigned_moderator_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resolved_at" timestamp with time zone,
    "awaiting_response_from" "text",
    "response_due_at" timestamp with time zone,
    CONSTRAINT "ck_moderations_priority_override_consistent" CHECK ((NOT (("priority_override" = true) AND ("priority" IS NULL)))),
    CONSTRAINT "ck_moderations_resolved_requires_terminal" CHECK ((("resolved_at" IS NULL) OR ("status" = ANY (ARRAY['resolved'::"public"."moderation_status", 'dismissed'::"public"."moderation_status"])))),
    CONSTRAINT "moderations_awaiting_response_from_check" CHECK ((("awaiting_response_from" IS NULL) OR ("awaiting_response_from" = ANY (ARRAY['reporter'::"text", 'reported_user'::"text"]))))
);


ALTER TABLE "public"."moderations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moderator_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moderation_id" "uuid" NOT NULL,
    "moderator_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "visibility" "public"."note_visibility" DEFAULT 'internal'::"public"."note_visibility" NOT NULL,
    "edited_at" timestamp with time zone,
    "edited_by" "uuid",
    "original_content" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."moderator_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "related_art_id" "uuid",
    "related_report_id" "uuid",
    "related_scan_id" "uuid",
    "action_url" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['artwork_registered'::"text", 'scan_completed'::"text", 'scan_flagged'::"text", 'scan_failed'::"text", 'report_submitted'::"text", 'report_resolved'::"text", 'blockchain_recorded'::"text", 'system_announcement'::"text", 'artwork_verified'::"text", 'artwork_verification_rejected'::"text", 'artwork_verification_info_requested'::"text", 'artwork_verification_resubmitted'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registered_arts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "c_asset_id" "text",
    "c_secure_url" "text",
    "file_hash" "text" NOT NULL,
    "perceptual_hash" "text" NOT NULL,
    "author_id_hash" "text",
    "evidence_hash" "text",
    "evidence" "jsonb",
    "chain" "text",
    "tx_hash" "text",
    "block_number" bigint,
    "work_id" "text",
    "status" "public"."art_status" DEFAULT 'pending_blockchain'::"public"."art_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "plagiarism_hashes" json
);


ALTER TABLE "public"."registered_arts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "previous_status" "public"."report_status",
    "new_status" "public"."report_status",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "report_actions_action_check" CHECK (("action" = ANY (ARRAY['status_change'::"text", 'evidence_requested'::"text", 'evidence_uploaded'::"text", 'comment_added'::"text", 'decision_recorded'::"text", 'report_created'::"text"])))
);


ALTER TABLE "public"."report_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "uploaded_by" "uuid" NOT NULL,
    "role" "public"."attachment_role" DEFAULT 'reporter'::"public"."attachment_role" NOT NULL,
    "storage_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "mime_type" "text",
    "file_size" bigint,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."report_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "is_admin" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "read_at" timestamp with time zone,
    "file_url" "text",
    "file_name" "text",
    "mime_type" "text",
    "message_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "parent_id" "uuid",
    CONSTRAINT "report_comments_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'image'::"text", 'document'::"text"])))
);


ALTER TABLE "public"."report_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_decisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "decision" "text" NOT NULL,
    "summary" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "report_decisions_decision_check" CHECK (("decision" = ANY (ARRAY['no_violation'::"text", 'copyright_confirmed'::"text", 'guideline_violation'::"text", 'insufficient_evidence'::"text", 'false_report'::"text"])))
);


ALTER TABLE "public"."report_decisions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_evidence" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "uploaded_by" "uuid" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "mime_type" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."report_evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_typing_indicators" (
    "report_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "started_typing_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."report_typing_indicators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "reported_art_post_id" "uuid" NOT NULL,
    "report_type" "public"."report_type" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "status" "public"."report_status" DEFAULT 'pending_review'::"public"."report_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resolved_at" timestamp with time zone,
    "assigned_admin_id" "uuid",
    "target_type" "public"."report_target_type" DEFAULT 'artwork'::"public"."report_target_type" NOT NULL,
    "target_id" "uuid",
    CONSTRAINT "reports_target_type_check" CHECK (("target_type" = ANY (ARRAY['artwork'::"public"."report_target_type", 'comment'::"public"."report_target_type", 'user'::"public"."report_target_type", 'collection'::"public"."report_target_type"])))
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


COMMENT ON COLUMN "public"."reports"."reported_art_post_id" IS 'DEPRECATED. Use target_type + target_id. Kept for backward compatibility only.';



COMMENT ON COLUMN "public"."reports"."status" IS 'DEPRECATED. Use moderations.status. Kept for backward compatibility only.';



COMMENT ON COLUMN "public"."reports"."resolved_at" IS 'DEPRECATED. Use moderations.resolved_at. Kept for backward compatibility only.';



COMMENT ON COLUMN "public"."reports"."assigned_admin_id" IS 'DEPRECATED. Use moderations.assigned_moderator_id. Kept for backward compatibility only.';



CREATE TABLE IF NOT EXISTS "public"."settings_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "setting_key" "text" NOT NULL,
    "previous_value" "jsonb",
    "new_value" "jsonb",
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."settings_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "description" "text",
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "show_nsfw_content" boolean DEFAULT false
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_warnings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "report_id" "uuid",
    "reason" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_warnings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "username" "public"."citext" NOT NULL,
    "bio" "text",
    "c_profile_image" "text",
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role" NOT NULL,
    "last_active" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_online" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "first_name" "text",
    "last_name" "text",
    "middle_name" "text",
    "is_verified" boolean DEFAULT false NOT NULL,
    "account_status" "public"."account_status" DEFAULT 'active'::"public"."account_status" NOT NULL,
    "suspended_until" timestamp with time zone,
    "suspension_reason" "text",
    "country" "text",
    CONSTRAINT "username_len" CHECK ((("char_length"(("username")::"text") >= 3) AND ("char_length"(("username")::"text") <= 30)))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."art_genres"
    ADD CONSTRAINT "art_genres_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."art_posts"
    ADD CONSTRAINT "art_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."art_reactions"
    ADD CONSTRAINT "art_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."art_similarity_scans"
    ADD CONSTRAINT "art_similarity_scans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artwork_review_actions"
    ADD CONSTRAINT "artwork_review_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artwork_review_evidence"
    ADD CONSTRAINT "artwork_review_evidence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artwork_reviews"
    ADD CONSTRAINT "artwork_reviews_artwork_id_key" UNIQUE ("artwork_id");



ALTER TABLE ONLY "public"."artwork_reviews"
    ADD CONSTRAINT "artwork_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."case_message_attachments"
    ADD CONSTRAINT "case_message_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."case_message_reads"
    ADD CONSTRAINT "case_message_reads_pkey" PRIMARY KEY ("message_id", "user_id");



ALTER TABLE ONLY "public"."case_messages"
    ADD CONSTRAINT "case_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."copyright_context_snapshots"
    ADD CONSTRAINT "copyright_context_snapshots_moderation_id_version_key" UNIQUE ("moderation_id", "version");



ALTER TABLE ONLY "public"."copyright_context_snapshots"
    ADD CONSTRAINT "copyright_context_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."genres"
    ADD CONSTRAINT "genres_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."genres"
    ADD CONSTRAINT "genres_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderation_actions"
    ADD CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderations"
    ADD CONSTRAINT "moderations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderations"
    ADD CONSTRAINT "moderations_report_id_key" UNIQUE ("report_id");



ALTER TABLE ONLY "public"."moderator_notes"
    ADD CONSTRAINT "moderator_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_typing_indicators"
    ADD CONSTRAINT "pk_report_typing_indicator" PRIMARY KEY ("report_id", "user_id");



ALTER TABLE ONLY "public"."registered_arts"
    ADD CONSTRAINT "registered_arts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."registered_arts"
    ADD CONSTRAINT "registered_arts_tx_hash_key" UNIQUE ("tx_hash");



ALTER TABLE ONLY "public"."report_actions"
    ADD CONSTRAINT "report_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_attachments"
    ADD CONSTRAINT "report_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_comments"
    ADD CONSTRAINT "report_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_decisions"
    ADD CONSTRAINT "report_decisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_decisions"
    ADD CONSTRAINT "report_decisions_report_id_key" UNIQUE ("report_id");



ALTER TABLE ONLY "public"."report_evidence"
    ADD CONSTRAINT "report_evidence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings_audit_logs"
    ADD CONSTRAINT "settings_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."art_similarity_scans"
    ADD CONSTRAINT "uq_art_similarity_scans_art_id" UNIQUE ("art_id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_warnings"
    ADD CONSTRAINT "user_warnings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "art_posts_is_nsfw_idx" ON "public"."art_posts" USING "btree" ("is_nsfw");



CREATE INDEX "idx_admin_audit_logs_action" ON "public"."admin_audit_logs" USING "btree" ("action");



CREATE INDEX "idx_admin_audit_logs_admin_id" ON "public"."admin_audit_logs" USING "btree" ("admin_id");



CREATE INDEX "idx_admin_audit_logs_created_at" ON "public"."admin_audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_admin_audit_logs_target_user_id" ON "public"."admin_audit_logs" USING "btree" ("target_user_id");



CREATE INDEX "idx_art_genres_art_id" ON "public"."art_genres" USING "btree" ("art_id");



CREATE INDEX "idx_art_genres_genre_id" ON "public"."art_genres" USING "btree" ("genre_id");



CREATE INDEX "idx_art_posts_art_id" ON "public"."art_posts" USING "btree" ("art_id");



CREATE INDEX "idx_art_posts_created_at" ON "public"."art_posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_art_posts_public_feed" ON "public"."art_posts" USING "btree" ("created_at" DESC) WHERE (("visibility" = 'public'::"public"."art_post_visibility") AND ("is_archived" = false));



CREATE INDEX "idx_art_posts_user_id" ON "public"."art_posts" USING "btree" ("user_id");



CREATE INDEX "idx_art_posts_user_visibility_created" ON "public"."art_posts" USING "btree" ("user_id", "visibility", "created_at" DESC);



CREATE INDEX "idx_art_posts_visibility" ON "public"."art_posts" USING "btree" ("visibility");



CREATE INDEX "idx_art_reactions_post_id" ON "public"."art_reactions" USING "btree" ("post_id");



CREATE INDEX "idx_art_reactions_type" ON "public"."art_reactions" USING "btree" ("reaction_type");



CREATE INDEX "idx_art_reactions_user_id" ON "public"."art_reactions" USING "btree" ("user_id");



CREATE INDEX "idx_art_similarity_scans_best_similarity" ON "public"."art_similarity_scans" USING "btree" ("best_similarity_percentage" DESC);



CREATE INDEX "idx_art_similarity_scans_best_source" ON "public"."art_similarity_scans" USING "btree" ("best_source");



CREATE INDEX "idx_art_similarity_scans_created_at" ON "public"."art_similarity_scans" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_art_similarity_scans_hashes_gin" ON "public"."art_similarity_scans" USING "gin" ("hashes" "jsonb_path_ops");



CREATE INDEX "idx_art_similarity_scans_matches_gin" ON "public"."art_similarity_scans" USING "gin" ("matches" "jsonb_path_ops");



CREATE INDEX "idx_art_similarity_scans_owner_id" ON "public"."art_similarity_scans" USING "btree" ("owner_id");



CREATE INDEX "idx_art_similarity_scans_raw_response_gin" ON "public"."art_similarity_scans" USING "gin" ("raw_response" "jsonb_path_ops");



CREATE INDEX "idx_art_similarity_scans_status" ON "public"."art_similarity_scans" USING "btree" ("status");



CREATE INDEX "idx_art_similarity_scans_success" ON "public"."art_similarity_scans" USING "btree" ("success");



CREATE INDEX "idx_artwork_review_actions_admin_id" ON "public"."artwork_review_actions" USING "btree" ("admin_id");



CREATE INDEX "idx_artwork_review_actions_created_at" ON "public"."artwork_review_actions" USING "btree" ("review_id", "created_at" DESC);



CREATE INDEX "idx_artwork_review_actions_review_id" ON "public"."artwork_review_actions" USING "btree" ("review_id");



CREATE INDEX "idx_artwork_review_evidence_created_at" ON "public"."artwork_review_evidence" USING "btree" ("review_id", "created_at" DESC);



CREATE INDEX "idx_artwork_review_evidence_review_id" ON "public"."artwork_review_evidence" USING "btree" ("review_id");



CREATE INDEX "idx_artwork_review_evidence_user_id" ON "public"."artwork_review_evidence" USING "btree" ("user_id");



CREATE INDEX "idx_artwork_reviews_artwork_id" ON "public"."artwork_reviews" USING "btree" ("artwork_id");



CREATE INDEX "idx_artwork_reviews_created_at" ON "public"."artwork_reviews" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_artwork_reviews_reviewer_id" ON "public"."artwork_reviews" USING "btree" ("reviewer_id");



CREATE INDEX "idx_artwork_reviews_status" ON "public"."artwork_reviews" USING "btree" ("status");



CREATE INDEX "idx_case_messages_category" ON "public"."case_messages" USING "btree" ("moderation_id", "category");



CREATE INDEX "idx_case_messages_moderation" ON "public"."case_messages" USING "btree" ("moderation_id", "created_at");



CREATE INDEX "idx_cma_message" ON "public"."case_message_attachments" USING "btree" ("message_id");



CREATE INDEX "idx_cmr_user" ON "public"."case_message_reads" USING "btree" ("user_id", "read_at" DESC);



CREATE INDEX "idx_copyright_snapshots_mod" ON "public"."copyright_context_snapshots" USING "btree" ("moderation_id", "version" DESC);



CREATE INDEX "idx_moderation_actions_mod" ON "public"."moderation_actions" USING "btree" ("moderation_id", "created_at");



CREATE INDEX "idx_moderation_actions_moderator" ON "public"."moderation_actions" USING "btree" ("moderator_id", "created_at");



CREATE INDEX "idx_moderation_actions_target_user" ON "public"."moderation_actions" USING "btree" ("target_user_id", "created_at") WHERE ("target_user_id" IS NOT NULL);



CREATE INDEX "idx_moderation_actions_type" ON "public"."moderation_actions" USING "btree" ("action_type");



CREATE INDEX "idx_moderations_assigned" ON "public"."moderations" USING "btree" ("assigned_moderator_id");



CREATE INDEX "idx_moderations_created" ON "public"."moderations" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_moderations_queue" ON "public"."moderations" USING "btree" ("priority", "status", "created_at");



CREATE INDEX "idx_moderations_report" ON "public"."moderations" USING "btree" ("report_id");



CREATE INDEX "idx_moderations_status" ON "public"."moderations" USING "btree" ("status");



CREATE INDEX "idx_moderator_notes_moderation" ON "public"."moderator_notes" USING "btree" ("moderation_id", "created_at");



CREATE INDEX "idx_notifications_related_art_id" ON "public"."notifications" USING "btree" ("related_art_id");



CREATE INDEX "idx_notifications_related_report_id" ON "public"."notifications" USING "btree" ("related_report_id");



CREATE INDEX "idx_notifications_related_scan_id" ON "public"."notifications" USING "btree" ("related_scan_id");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_user_created_at" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_user_is_read" ON "public"."notifications" USING "btree" ("user_id", "is_read");



CREATE INDEX "idx_notifications_user_unread_created_at" ON "public"."notifications" USING "btree" ("user_id", "is_read", "created_at" DESC);



CREATE INDEX "idx_registered_arts_author_id_hash" ON "public"."registered_arts" USING "btree" ("author_id_hash");



CREATE INDEX "idx_registered_arts_created_at" ON "public"."registered_arts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_registered_arts_evidence_hash" ON "public"."registered_arts" USING "btree" ("evidence_hash");



CREATE INDEX "idx_registered_arts_file_hash" ON "public"."registered_arts" USING "btree" ("file_hash");



CREATE INDEX "idx_registered_arts_owner" ON "public"."registered_arts" USING "btree" ("owner_id");



CREATE INDEX "idx_registered_arts_phash" ON "public"."registered_arts" USING "btree" ("perceptual_hash");



CREATE INDEX "idx_registered_arts_status" ON "public"."registered_arts" USING "btree" ("status");



CREATE INDEX "idx_registered_arts_tx_hash" ON "public"."registered_arts" USING "btree" ("tx_hash");



CREATE INDEX "idx_registered_arts_work_id" ON "public"."registered_arts" USING "btree" ("work_id");



CREATE INDEX "idx_report_actions_admin_id" ON "public"."report_actions" USING "btree" ("admin_id");



CREATE INDEX "idx_report_actions_created_at" ON "public"."report_actions" USING "btree" ("report_id", "created_at" DESC);



CREATE INDEX "idx_report_actions_report_id" ON "public"."report_actions" USING "btree" ("report_id");



CREATE INDEX "idx_report_attachments_report" ON "public"."report_attachments" USING "btree" ("report_id");



CREATE INDEX "idx_report_comments_created_at" ON "public"."report_comments" USING "btree" ("report_id", "created_at" DESC);



CREATE INDEX "idx_report_comments_read_at" ON "public"."report_comments" USING "btree" ("report_id", "read_at") WHERE ("read_at" IS NULL);



CREATE INDEX "idx_report_comments_report_id" ON "public"."report_comments" USING "btree" ("report_id");



CREATE INDEX "idx_report_comments_unread" ON "public"."report_comments" USING "btree" ("report_id", "user_id", "read_at") WHERE ("read_at" IS NULL);



CREATE INDEX "idx_report_comments_user_id" ON "public"."report_comments" USING "btree" ("user_id");



CREATE INDEX "idx_report_decisions_admin_id" ON "public"."report_decisions" USING "btree" ("admin_id");



CREATE INDEX "idx_report_decisions_report_id" ON "public"."report_decisions" USING "btree" ("report_id");



CREATE INDEX "idx_report_evidence_report_id" ON "public"."report_evidence" USING "btree" ("report_id");



CREATE INDEX "idx_report_evidence_uploaded_by" ON "public"."report_evidence" USING "btree" ("uploaded_by");



CREATE INDEX "idx_reports_assigned_admin" ON "public"."reports" USING "btree" ("assigned_admin_id");



CREATE INDEX "idx_reports_created_at" ON "public"."reports" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_reports_report_type" ON "public"."reports" USING "btree" ("report_type");



CREATE INDEX "idx_reports_reported_art_id" ON "public"."reports" USING "btree" ("reported_art_post_id");



CREATE INDEX "idx_reports_reporter_id" ON "public"."reports" USING "btree" ("reporter_id");



CREATE INDEX "idx_reports_reporter_status" ON "public"."reports" USING "btree" ("reporter_id", "status");



CREATE INDEX "idx_reports_status" ON "public"."reports" USING "btree" ("status");



CREATE INDEX "idx_reports_status_created" ON "public"."reports" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_reports_target" ON "public"."reports" USING "btree" ("target_type", "target_id");



CREATE INDEX "idx_settings_audit_logs_admin_id" ON "public"."settings_audit_logs" USING "btree" ("admin_id");



CREATE INDEX "idx_settings_audit_logs_created_at" ON "public"."settings_audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_settings_audit_logs_setting_key" ON "public"."settings_audit_logs" USING "btree" ("setting_key");



CREATE INDEX "idx_system_settings_key" ON "public"."system_settings" USING "btree" ("key");



CREATE INDEX "idx_system_settings_updated_at" ON "public"."system_settings" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_system_settings_updated_by" ON "public"."system_settings" USING "btree" ("updated_by");



CREATE INDEX "idx_user_preferences_nsfw_false" ON "public"."user_preferences" USING "btree" ("user_id") WHERE ("show_nsfw_content" = false);



CREATE INDEX "idx_user_preferences_user_id" ON "public"."user_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_user_warnings_admin_id" ON "public"."user_warnings" USING "btree" ("admin_id");



CREATE INDEX "idx_user_warnings_created_at" ON "public"."user_warnings" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_user_warnings_user_id" ON "public"."user_warnings" USING "btree" ("user_id");



CREATE INDEX "idx_users_account_status" ON "public"."users" USING "btree" ("account_status");



CREATE INDEX "idx_users_last_active" ON "public"."users" USING "btree" ("last_active" DESC);



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_users_username" ON "public"."users" USING "btree" ("username");



CREATE UNIQUE INDEX "uq_art_posts_art_id" ON "public"."art_posts" USING "btree" ("art_id");



CREATE UNIQUE INDEX "uq_art_reactions_post_user" ON "public"."art_reactions" USING "btree" ("post_id", "user_id");



CREATE UNIQUE INDEX "uq_notifications_blockchain_event" ON "public"."notifications" USING "btree" ("user_id", "related_art_id", "type") WHERE (("type" = 'blockchain_recorded'::"text") AND ("related_art_id" IS NOT NULL));



CREATE UNIQUE INDEX "uq_notifications_report_event" ON "public"."notifications" USING "btree" ("user_id", "related_report_id", "type") WHERE ("related_report_id" IS NOT NULL);



CREATE UNIQUE INDEX "uq_notifications_scan_event" ON "public"."notifications" USING "btree" ("user_id", "related_scan_id", "type") WHERE ("related_scan_id" IS NOT NULL);



CREATE UNIQUE INDEX "uq_registered_arts_owner_file" ON "public"."registered_arts" USING "btree" ("owner_id", "file_hash");



CREATE UNIQUE INDEX "uq_reports_reporter_post" ON "public"."reports" USING "btree" ("reporter_id", "reported_art_post_id");



CREATE INDEX "user_preferences_show_nsfw_content_idx" ON "public"."user_preferences" USING "btree" ("show_nsfw_content");



CREATE OR REPLACE TRIGGER "tr_update_user_preferences_timestamp" BEFORE UPDATE ON "public"."user_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_preferences_timestamp"();



CREATE OR REPLACE TRIGGER "trg_art_posts_updated_at" BEFORE UPDATE ON "public"."art_posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_art_reactions_sync_counts_delete" AFTER DELETE ON "public"."art_reactions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_art_post_vote_counts_incremental"();



CREATE OR REPLACE TRIGGER "trg_art_reactions_sync_counts_insert" AFTER INSERT ON "public"."art_reactions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_art_post_vote_counts_incremental"();



CREATE OR REPLACE TRIGGER "trg_art_reactions_sync_counts_update" AFTER UPDATE ON "public"."art_reactions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_art_post_vote_counts_incremental"();



CREATE OR REPLACE TRIGGER "trg_art_reactions_updated_at" BEFORE UPDATE ON "public"."art_reactions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_art_similarity_scans_updated_at" BEFORE UPDATE ON "public"."art_similarity_scans" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_artwork_reviews_updated_at" BEFORE UPDATE ON "public"."artwork_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_enforce_art_post_owner_match" BEFORE INSERT OR UPDATE ON "public"."art_posts" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_art_post_owner_match"();



CREATE OR REPLACE TRIGGER "trg_initialize_user_preferences" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user_preferences"();



CREATE OR REPLACE TRIGGER "trg_moderations_updated_at" BEFORE UPDATE ON "public"."moderations" FOR EACH ROW EXECUTE FUNCTION "public"."trg_moderations_updated_at"();



CREATE OR REPLACE TRIGGER "trg_moderator_notes_updated_at" BEFORE UPDATE ON "public"."moderator_notes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_notify_art_similarity_scan_status" AFTER UPDATE ON "public"."art_similarity_scans" FOR EACH ROW EXECUTE FUNCTION "public"."notify_art_similarity_scan_status"();



CREATE OR REPLACE TRIGGER "trg_notify_artwork_registered" AFTER INSERT ON "public"."registered_arts" FOR EACH ROW EXECUTE FUNCTION "public"."notify_artwork_registered"();



CREATE OR REPLACE TRIGGER "trg_notify_blockchain_recorded" AFTER UPDATE ON "public"."registered_arts" FOR EACH ROW EXECUTE FUNCTION "public"."notify_blockchain_recorded"();



CREATE OR REPLACE TRIGGER "trg_notify_report_resolved" AFTER UPDATE ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."notify_report_resolved"();



CREATE OR REPLACE TRIGGER "trg_notify_report_submitted_to_admins" AFTER INSERT ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."notify_report_submitted_to_admins"();



CREATE OR REPLACE TRIGGER "trg_notify_report_submitted_to_reporter" AFTER INSERT ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."notify_report_submitted_to_reporter"();



CREATE OR REPLACE TRIGGER "trg_registered_arts_updated_at" BEFORE UPDATE ON "public"."registered_arts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_system_settings_updated_at" BEFORE UPDATE ON "public"."system_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."art_genres"
    ADD CONSTRAINT "art_genres_art_id_fkey" FOREIGN KEY ("art_id") REFERENCES "public"."registered_arts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."art_genres"
    ADD CONSTRAINT "art_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."art_posts"
    ADD CONSTRAINT "art_posts_art_id_fkey" FOREIGN KEY ("art_id") REFERENCES "public"."registered_arts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."art_posts"
    ADD CONSTRAINT "art_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."art_reactions"
    ADD CONSTRAINT "art_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."art_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."art_reactions"
    ADD CONSTRAINT "art_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."art_similarity_scans"
    ADD CONSTRAINT "art_similarity_scans_art_id_fkey" FOREIGN KEY ("art_id") REFERENCES "public"."registered_arts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."art_similarity_scans"
    ADD CONSTRAINT "art_similarity_scans_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artwork_review_actions"
    ADD CONSTRAINT "artwork_review_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artwork_review_actions"
    ADD CONSTRAINT "artwork_review_actions_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."artwork_reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artwork_review_evidence"
    ADD CONSTRAINT "artwork_review_evidence_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."artwork_reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artwork_review_evidence"
    ADD CONSTRAINT "artwork_review_evidence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artwork_reviews"
    ADD CONSTRAINT "artwork_reviews_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "public"."registered_arts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artwork_reviews"
    ADD CONSTRAINT "artwork_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."case_message_attachments"
    ADD CONSTRAINT "case_message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."case_messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_message_attachments"
    ADD CONSTRAINT "case_message_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_message_reads"
    ADD CONSTRAINT "case_message_reads_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."case_messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_message_reads"
    ADD CONSTRAINT "case_message_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_messages"
    ADD CONSTRAINT "case_messages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_messages"
    ADD CONSTRAINT "case_messages_moderation_id_fkey" FOREIGN KEY ("moderation_id") REFERENCES "public"."moderations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."copyright_context_snapshots"
    ADD CONSTRAINT "copyright_context_snapshots_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "public"."registered_arts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."copyright_context_snapshots"
    ADD CONSTRAINT "copyright_context_snapshots_moderation_id_fkey" FOREIGN KEY ("moderation_id") REFERENCES "public"."moderations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderation_actions"
    ADD CONSTRAINT "moderation_actions_moderation_id_fkey" FOREIGN KEY ("moderation_id") REFERENCES "public"."moderations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderation_actions"
    ADD CONSTRAINT "moderation_actions_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderation_actions"
    ADD CONSTRAINT "moderation_actions_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."moderations"
    ADD CONSTRAINT "moderations_assigned_moderator_id_fkey" FOREIGN KEY ("assigned_moderator_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."moderations"
    ADD CONSTRAINT "moderations_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderator_notes"
    ADD CONSTRAINT "moderator_notes_edited_by_fkey" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."moderator_notes"
    ADD CONSTRAINT "moderator_notes_moderation_id_fkey" FOREIGN KEY ("moderation_id") REFERENCES "public"."moderations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderator_notes"
    ADD CONSTRAINT "moderator_notes_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_related_art_id_fkey" FOREIGN KEY ("related_art_id") REFERENCES "public"."registered_arts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_related_report_id_fkey" FOREIGN KEY ("related_report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_related_scan_id_fkey" FOREIGN KEY ("related_scan_id") REFERENCES "public"."art_similarity_scans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registered_arts"
    ADD CONSTRAINT "registered_arts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_actions"
    ADD CONSTRAINT "report_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_actions"
    ADD CONSTRAINT "report_actions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_attachments"
    ADD CONSTRAINT "report_attachments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_attachments"
    ADD CONSTRAINT "report_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_comments"
    ADD CONSTRAINT "report_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."report_comments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."report_comments"
    ADD CONSTRAINT "report_comments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_comments"
    ADD CONSTRAINT "report_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_decisions"
    ADD CONSTRAINT "report_decisions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_decisions"
    ADD CONSTRAINT "report_decisions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_evidence"
    ADD CONSTRAINT "report_evidence_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_evidence"
    ADD CONSTRAINT "report_evidence_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_typing_indicators"
    ADD CONSTRAINT "report_typing_indicators_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_typing_indicators"
    ADD CONSTRAINT "report_typing_indicators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_assigned_admin_id_fkey" FOREIGN KEY ("assigned_admin_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_art_post_id_fkey" FOREIGN KEY ("reported_art_post_id") REFERENCES "public"."art_posts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settings_audit_logs"
    ADD CONSTRAINT "settings_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_warnings"
    ADD CONSTRAINT "user_warnings_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_warnings"
    ADD CONSTRAINT "user_warnings_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_warnings"
    ADD CONSTRAINT "user_warnings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can create comments on any report" ON "public"."report_comments" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Admins can delete reports" ON "public"."reports" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can delete system_settings" ON "public"."system_settings" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can insert report actions" ON "public"."report_actions" FOR INSERT WITH CHECK ((("admin_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Admins can insert report decisions" ON "public"."report_decisions" FOR INSERT WITH CHECK ((("admin_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Admins can insert settings_audit_logs" ON "public"."settings_audit_logs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can insert system_settings" ON "public"."system_settings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can insert warnings" ON "public"."user_warnings" FOR INSERT WITH CHECK ((("admin_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Admins can read all report evidence" ON "public"."report_evidence" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can read all reports" ON "public"."reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can read all warnings" ON "public"."user_warnings" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can read settings_audit_logs" ON "public"."settings_audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can update reports" ON "public"."reports" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can update system_settings" ON "public"."system_settings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can upload evidence to any report" ON "public"."report_evidence" FOR INSERT WITH CHECK ((("uploaded_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Admins can view all evidence" ON "public"."artwork_review_evidence" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Artists can insert evidence" ON "public"."artwork_review_evidence" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Authenticated users can create comments on own reports" ON "public"."report_comments" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_comments"."report_id") AND ("reports"."reporter_id" = "auth"."uid"()))))));



CREATE POLICY "Authenticated users can create reports" ON "public"."reports" FOR INSERT WITH CHECK (("reporter_id" = "auth"."uid"()));



CREATE POLICY "Authenticated users can upload evidence to own reports" ON "public"."report_evidence" FOR INSERT WITH CHECK ((("uploaded_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_evidence"."report_id") AND ("reports"."reporter_id" = "auth"."uid"()))))));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."art_genres" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Reporters can read actions on own reports" ON "public"."report_actions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_actions"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))));



CREATE POLICY "Reporters can read comments on own reports" ON "public"."report_comments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_comments"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))));



CREATE POLICY "Reporters can read decisions on own reports" ON "public"."report_decisions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_decisions"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))));



CREATE POLICY "Reporters can read evidence on own reports" ON "public"."report_evidence" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_evidence"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))));



CREATE POLICY "Reporters can read own reports" ON "public"."reports" FOR SELECT USING (("reporter_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own typing indicators" ON "public"."report_typing_indicators" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own preferences" ON "public"."user_preferences" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own preferences" ON "public"."user_preferences" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can read own warnings" ON "public"."user_warnings" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read typing indicators for own reports" ON "public"."report_typing_indicators" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_typing_indicators"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can update own typing indicators" ON "public"."report_typing_indicators" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update read receipts on own report comments" ON "public"."report_comments" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_comments"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_comments"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can update their own art reactions" ON "public"."art_reactions" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own preferences" ON "public"."user_preferences" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can upsert own typing indicators" ON "public"."report_typing_indicators" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own evidence" ON "public"."artwork_review_evidence" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own preferences" ON "public"."user_preferences" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."admin_audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_audit_logs_insert_admin" ON "public"."admin_audit_logs" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "admin_audit_logs_select_admin" ON "public"."admin_audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."art_genres" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "art_genres_select_all" ON "public"."art_genres" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."art_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "art_posts_delete_own" ON "public"."art_posts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "art_posts_insert_own" ON "public"."art_posts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "art_posts_select_public_or_owner" ON "public"."art_posts" FOR SELECT USING (((("visibility" = 'public'::"public"."art_post_visibility") AND ("is_archived" = false)) OR ("auth"."uid"() = "user_id")));



CREATE POLICY "art_posts_update_own" ON "public"."art_posts" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."art_reactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "art_reactions_delete_own" ON "public"."art_reactions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "art_reactions_insert_own_on_visible_posts" ON "public"."art_reactions" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."art_posts" "p"
  WHERE (("p"."id" = "art_reactions"."post_id") AND ((("p"."visibility" = 'public'::"public"."art_post_visibility") AND ("p"."is_archived" = false)) OR ("p"."user_id" = "auth"."uid"())))))));



CREATE POLICY "art_reactions_select_visible_posts" ON "public"."art_reactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."art_posts" "p"
  WHERE (("p"."id" = "art_reactions"."post_id") AND ((("p"."visibility" = 'public'::"public"."art_post_visibility") AND ("p"."is_archived" = false)) OR ("p"."user_id" = "auth"."uid"()))))));



ALTER TABLE "public"."art_similarity_scans" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "art_similarity_scans_delete_own" ON "public"."art_similarity_scans" FOR DELETE TO "authenticated" USING ((("owner_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "art_similarity_scans_insert_own" ON "public"."art_similarity_scans" FOR INSERT TO "authenticated" WITH CHECK (((("owner_id" = "auth"."uid"()) OR "public"."is_admin"()) AND (EXISTS ( SELECT 1
   FROM "public"."registered_arts" "ra"
  WHERE (("ra"."id" = "art_similarity_scans"."art_id") AND (("ra"."owner_id" = "auth"."uid"()) OR "public"."is_admin"()))))));



CREATE POLICY "art_similarity_scans_select_own" ON "public"."art_similarity_scans" FOR SELECT TO "authenticated" USING ((("owner_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "art_similarity_scans_update_own" ON "public"."art_similarity_scans" FOR UPDATE TO "authenticated" USING ((("owner_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("owner_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."artwork_review_actions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "artwork_review_actions_insert_admin" ON "public"."artwork_review_actions" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "artwork_review_actions_select_admin" ON "public"."artwork_review_actions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."artwork_review_evidence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artwork_reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "artwork_reviews_insert_admin" ON "public"."artwork_reviews" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "artwork_reviews_select_admin" ON "public"."artwork_reviews" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."case_message_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."case_message_reads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."case_messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cm_admins_all" ON "public"."case_messages" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "cm_reported_insert" ON "public"."case_messages" FOR INSERT TO "authenticated" WITH CHECK ((("author_id" = "auth"."uid"()) AND ("author_role" = 'reported_user'::"public"."case_message_author_role") AND ("visibility" = 'to_reported_user'::"public"."case_message_visibility") AND (EXISTS ( SELECT 1
   FROM ("public"."moderations" "m"
     JOIN "public"."reports" "r" ON (("r"."id" = "m"."report_id")))
  WHERE (("m"."id" = "case_messages"."moderation_id") AND ("r"."target_type" = 'artwork'::"public"."report_target_type") AND (EXISTS ( SELECT 1
           FROM ("public"."art_posts" "ap"
             JOIN "public"."registered_arts" "ra" ON (("ra"."id" = "ap"."art_id")))
          WHERE (("ap"."id" = "r"."target_id") AND ("ra"."owner_id" = "auth"."uid"())))))))));



CREATE POLICY "cm_reported_read" ON "public"."case_messages" FOR SELECT TO "authenticated" USING ((("visibility" = ANY (ARRAY['to_reported_user'::"public"."case_message_visibility", 'shared'::"public"."case_message_visibility"])) AND (EXISTS ( SELECT 1
   FROM ("public"."moderations" "m"
     JOIN "public"."reports" "r" ON (("r"."id" = "m"."report_id")))
  WHERE (("m"."id" = "case_messages"."moderation_id") AND ("r"."target_type" = 'artwork'::"public"."report_target_type") AND (EXISTS ( SELECT 1
           FROM ("public"."art_posts" "ap"
             JOIN "public"."registered_arts" "ra" ON (("ra"."id" = "ap"."art_id")))
          WHERE (("ap"."id" = "r"."target_id") AND ("ra"."owner_id" = "auth"."uid"())))))))));



CREATE POLICY "cm_reporters_insert" ON "public"."case_messages" FOR INSERT TO "authenticated" WITH CHECK ((("author_id" = "auth"."uid"()) AND ("author_role" = 'reporter'::"public"."case_message_author_role") AND ("visibility" = 'to_reporter'::"public"."case_message_visibility") AND (EXISTS ( SELECT 1
   FROM ("public"."moderations" "m"
     JOIN "public"."reports" "r" ON (("r"."id" = "m"."report_id")))
  WHERE (("m"."id" = "case_messages"."moderation_id") AND ("r"."reporter_id" = "auth"."uid"()))))));



CREATE POLICY "cm_reporters_read" ON "public"."case_messages" FOR SELECT TO "authenticated" USING ((("visibility" = ANY (ARRAY['to_reporter'::"public"."case_message_visibility", 'shared'::"public"."case_message_visibility"])) AND (EXISTS ( SELECT 1
   FROM ("public"."moderations" "m"
     JOIN "public"."reports" "r" ON (("r"."id" = "m"."report_id")))
  WHERE (("m"."id" = "case_messages"."moderation_id") AND ("r"."reporter_id" = "auth"."uid"()))))));



CREATE POLICY "cma_admins_all" ON "public"."case_message_attachments" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "cma_reporters_read" ON "public"."case_message_attachments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."case_messages" "cm"
     JOIN "public"."moderations" "m" ON (("m"."id" = "cm"."moderation_id")))
     JOIN "public"."reports" "r" ON (("r"."id" = "m"."report_id")))
  WHERE (("cm"."id" = "case_message_attachments"."message_id") AND ("cm"."visibility" = ANY (ARRAY['to_reporter'::"public"."case_message_visibility", 'shared'::"public"."case_message_visibility"])) AND ("r"."reporter_id" = "auth"."uid"())))));



CREATE POLICY "cmr_admins_all" ON "public"."case_message_reads" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "cmr_reporters_manage" ON "public"."case_message_reads" TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."copyright_context_snapshots" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cs_admins_all" ON "public"."copyright_context_snapshots" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."genres" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "genres_admin_delete" ON "public"."genres" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "genres_admin_insert" ON "public"."genres" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "genres_admin_update" ON "public"."genres" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "genres_select_all" ON "public"."genres" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "ma_admins_all" ON "public"."moderation_actions" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "ma_reporters_read" ON "public"."moderation_actions" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM ("public"."moderations" "m"
     JOIN "public"."reports" "r" ON (("r"."id" = "m"."report_id")))
  WHERE (("m"."id" = "moderation_actions"."moderation_id") AND ("r"."reporter_id" = "auth"."uid"())))) AND ("action_type" = ANY (ARRAY['case_resolved'::"public"."moderation_action_type", 'case_dismissed'::"public"."moderation_action_type", 'case_reopened'::"public"."moderation_action_type", 'content_removed'::"public"."moderation_action_type", 'content_restored'::"public"."moderation_action_type", 'content_flagged_nsfw'::"public"."moderation_action_type", 'user_warned'::"public"."moderation_action_type", 'user_suspended'::"public"."moderation_action_type", 'user_banned'::"public"."moderation_action_type", 'appeal_granted'::"public"."moderation_action_type", 'appeal_denied'::"public"."moderation_action_type"]))));



CREATE POLICY "mn_admins_all" ON "public"."moderator_notes" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "mn_reporters_read" ON "public"."moderator_notes" FOR SELECT TO "authenticated" USING ((("visibility" = 'reporter_visible'::"public"."note_visibility") AND (EXISTS ( SELECT 1
   FROM ("public"."moderations" "m"
     JOIN "public"."reports" "r" ON (("r"."id" = "m"."report_id")))
  WHERE (("m"."id" = "moderator_notes"."moderation_id") AND ("r"."reporter_id" = "auth"."uid"()))))));



CREATE POLICY "mod_admins_all" ON "public"."moderations" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "mod_reporters_read" ON "public"."moderations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "moderations"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))));



ALTER TABLE "public"."moderation_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderator_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_insert_admin" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "notifications_select_admin" ON "public"."notifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "ra_admins_all" ON "public"."report_attachments" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "ra_reporters_read" ON "public"."report_attachments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_attachments"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))));



ALTER TABLE "public"."registered_arts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "registered_arts_delete_own" ON "public"."registered_arts" FOR DELETE TO "authenticated" USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "registered_arts_insert_own" ON "public"."registered_arts" FOR INSERT TO "authenticated" WITH CHECK (("owner_id" = "auth"."uid"()));



CREATE POLICY "registered_arts_select_own" ON "public"."registered_arts" FOR SELECT TO "authenticated" USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "registered_arts_select_publicly_posted" ON "public"."registered_arts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."art_posts" "ap"
  WHERE (("ap"."art_id" = "registered_arts"."id") AND ("ap"."visibility" = 'public'::"public"."art_post_visibility") AND ("ap"."is_archived" = false)))));



CREATE POLICY "registered_arts_update_own" ON "public"."registered_arts" FOR UPDATE TO "authenticated" USING (("owner_id" = "auth"."uid"())) WITH CHECK (("owner_id" = "auth"."uid"()));



ALTER TABLE "public"."report_actions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "report_actions_select_reporter_or_admin" ON "public"."report_actions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_actions"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



ALTER TABLE "public"."report_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report_comments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "report_comments_select_reporter_or_admin" ON "public"."report_comments" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_comments"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



ALTER TABLE "public"."report_decisions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "report_decisions_select_reporter_or_admin" ON "public"."report_decisions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."reports"
  WHERE (("reports"."id" = "report_decisions"."report_id") AND ("reports"."reporter_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



ALTER TABLE "public"."report_evidence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report_typing_indicators" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reports_admin_update" ON "public"."reports" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "reports_insert_self" ON "public"."reports" FOR INSERT TO "authenticated" WITH CHECK (("reporter_id" = "auth"."uid"()));



CREATE POLICY "reports_select_own_or_admin" ON "public"."reports" FOR SELECT TO "authenticated" USING ((("reporter_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."settings_audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "settings_audit_logs_insert_admin" ON "public"."settings_audit_logs" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "settings_audit_logs_select_admin" ON "public"."settings_audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "system_settings_select_authenticated" ON "public"."system_settings" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_warnings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_self" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "users_select_all" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "users_update_own" ON "public"."users" FOR UPDATE TO "authenticated" USING ((("id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_art_post_owner_match"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_art_post_owner_match"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_art_post_owner_match"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_moderation_enforcement_stats"("p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_moderation_enforcement_stats"("p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_moderation_enforcement_stats"("p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_moderation_queue_health"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_moderation_queue_health"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_moderation_queue_health"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_moderation_trends"("p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_moderation_trends"("p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_moderation_trends"("p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_moderator_activity"("p_moderator_id" "uuid", "p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_moderator_activity"("p_moderator_id" "uuid", "p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_moderator_activity"("p_moderator_id" "uuid", "p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_preferences"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_preferences"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_preferences"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_art_similarity_scan_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_art_similarity_scan_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_art_similarity_scan_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_artwork_registered"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_artwork_registered"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_artwork_registered"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_blockchain_recorded"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_blockchain_recorded"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_blockchain_recorded"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_report_resolved"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_report_resolved"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_report_resolved"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_report_submitted_to_admins"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_report_submitted_to_admins"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_report_submitted_to_admins"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_report_submitted_to_reporter"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_report_submitted_to_reporter"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_report_submitted_to_reporter"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_art_post_reaction_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_art_post_reaction_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_art_post_reaction_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_art_post_vote_counts_incremental"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_art_post_vote_counts_incremental"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_art_post_vote_counts_incremental"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_moderations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_moderations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_moderations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_preferences_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_preferences_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_preferences_timestamp"() TO "service_role";



GRANT ALL ON TABLE "public"."admin_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."art_genres" TO "anon";
GRANT ALL ON TABLE "public"."art_genres" TO "authenticated";
GRANT ALL ON TABLE "public"."art_genres" TO "service_role";



GRANT ALL ON SEQUENCE "public"."art_genres_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."art_genres_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."art_genres_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."art_posts" TO "anon";
GRANT ALL ON TABLE "public"."art_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."art_posts" TO "service_role";



GRANT ALL ON TABLE "public"."art_reactions" TO "anon";
GRANT ALL ON TABLE "public"."art_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."art_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."art_similarity_scans" TO "anon";
GRANT ALL ON TABLE "public"."art_similarity_scans" TO "authenticated";
GRANT ALL ON TABLE "public"."art_similarity_scans" TO "service_role";



GRANT ALL ON TABLE "public"."artwork_review_actions" TO "anon";
GRANT ALL ON TABLE "public"."artwork_review_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."artwork_review_actions" TO "service_role";



GRANT ALL ON TABLE "public"."artwork_review_evidence" TO "anon";
GRANT ALL ON TABLE "public"."artwork_review_evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."artwork_review_evidence" TO "service_role";



GRANT ALL ON TABLE "public"."artwork_reviews" TO "anon";
GRANT ALL ON TABLE "public"."artwork_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."artwork_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."case_message_attachments" TO "anon";
GRANT ALL ON TABLE "public"."case_message_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."case_message_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."case_message_reads" TO "anon";
GRANT ALL ON TABLE "public"."case_message_reads" TO "authenticated";
GRANT ALL ON TABLE "public"."case_message_reads" TO "service_role";



GRANT ALL ON TABLE "public"."case_messages" TO "anon";
GRANT ALL ON TABLE "public"."case_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."case_messages" TO "service_role";



GRANT ALL ON TABLE "public"."copyright_context_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."copyright_context_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."copyright_context_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."genres" TO "anon";
GRANT ALL ON TABLE "public"."genres" TO "authenticated";
GRANT ALL ON TABLE "public"."genres" TO "service_role";



GRANT ALL ON SEQUENCE "public"."genres_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."genres_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."genres_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."moderation_actions" TO "anon";
GRANT ALL ON TABLE "public"."moderation_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."moderation_actions" TO "service_role";



GRANT ALL ON TABLE "public"."moderations" TO "anon";
GRANT ALL ON TABLE "public"."moderations" TO "authenticated";
GRANT ALL ON TABLE "public"."moderations" TO "service_role";



GRANT ALL ON TABLE "public"."moderator_notes" TO "anon";
GRANT ALL ON TABLE "public"."moderator_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."moderator_notes" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."registered_arts" TO "anon";
GRANT ALL ON TABLE "public"."registered_arts" TO "authenticated";
GRANT ALL ON TABLE "public"."registered_arts" TO "service_role";



GRANT ALL ON TABLE "public"."report_actions" TO "anon";
GRANT ALL ON TABLE "public"."report_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."report_actions" TO "service_role";



GRANT ALL ON TABLE "public"."report_attachments" TO "anon";
GRANT ALL ON TABLE "public"."report_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."report_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."report_comments" TO "anon";
GRANT ALL ON TABLE "public"."report_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."report_comments" TO "service_role";



GRANT ALL ON TABLE "public"."report_decisions" TO "anon";
GRANT ALL ON TABLE "public"."report_decisions" TO "authenticated";
GRANT ALL ON TABLE "public"."report_decisions" TO "service_role";



GRANT ALL ON TABLE "public"."report_evidence" TO "anon";
GRANT ALL ON TABLE "public"."report_evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."report_evidence" TO "service_role";



GRANT ALL ON TABLE "public"."report_typing_indicators" TO "anon";
GRANT ALL ON TABLE "public"."report_typing_indicators" TO "authenticated";
GRANT ALL ON TABLE "public"."report_typing_indicators" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."settings_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."settings_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."settings_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_warnings" TO "anon";
GRANT ALL ON TABLE "public"."user_warnings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_warnings" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







