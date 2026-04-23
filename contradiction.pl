% ============================================================
% contradiction.pl — Contradiction Detection
% Crime Investigation Expert System
% ============================================================
% Detects conflicting witness statements about suspects.
% ============================================================

% ------------------------------------------------------------
% contradicts/2
% Defines pairs of contradictory claims.
% Both directions are needed for proper detection with
% the W1 @< W2 deduplication in find_contradictions.
% ------------------------------------------------------------
contradicts(was_at_scene, was_not_at_scene).
contradicts(was_not_at_scene, was_at_scene).
contradicts(has_motive, no_motive).
contradicts(no_motive, has_motive).
contradicts(has_alibi, was_at_scene).
contradicts(was_at_scene, has_alibi).
contradicts(is_suspicious, is_not_suspicious).
contradicts(is_not_suspicious, is_suspicious).

% ------------------------------------------------------------
% find_contradictions/1
% Finds all contradictory statement pairs.
% Uses W1 @< W2 to avoid reporting duplicates.
% Returns list of contradiction(Suspect, W1, Claim1, W2, Claim2) terms.
% ------------------------------------------------------------
find_contradictions(Contradictions) :-
    findall(
        contradiction(Suspect, W1, Claim1, W2, Claim2),
        (
            witness_statement(W1, Suspect, Claim1),
            witness_statement(W2, Suspect, Claim2),
            W1 @< W2,
            contradicts(Claim1, Claim2)
        ),
        Contradictions
    ).

% ------------------------------------------------------------
% contradiction_count/2
% Counts the number of contradictions involving a specific suspect.
% ------------------------------------------------------------
contradiction_count(Suspect, Count) :-
    findall(1,
        (
            witness_statement(W1, Suspect, Claim1),
            witness_statement(W2, Suspect, Claim2),
            W1 @< W2,
            contradicts(Claim1, Claim2)
        ),
        Ones
    ),
    length(Ones, Count).
