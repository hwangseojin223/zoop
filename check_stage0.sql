SELECT job_candidate_id, post_id, candidate_id, job_cand_curr_stage, github_login FROM job_cand_progress WHERE job_cand_curr_stage = '0' ORDER BY job_cand_created_at DESC;
