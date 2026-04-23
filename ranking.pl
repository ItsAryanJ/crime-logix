% ============================================================
% ranking.pl — Suspect Ranking System
% Crime Investigation Expert System
% ============================================================
% Computes suspicion scores and ranks suspects.
% Formula: Score = 3*evidence + 2*motive + 2*presence - contradictions
% ============================================================

% ------------------------------------------------------------
% motive_score/2
% Returns 2 if suspect has a motive, 0 otherwise.
% ------------------------------------------------------------
motive_score(Suspect, 2) :- has_motive(Suspect), !.
motive_score(_, 0).

% ------------------------------------------------------------
% presence_score/2
% Returns 2 if suspect was at the scene, 0 otherwise.
% ------------------------------------------------------------
presence_score(Suspect, 2) :- was_present(Suspect), !.
presence_score(_, 0).

% ------------------------------------------------------------
% suspicion_score/2
% Computes the total suspicion score for a suspect.
% ------------------------------------------------------------
suspicion_score(Suspect, Score) :-
    suspect(Suspect),
    evidence_count(Suspect, EC),
    motive_score(Suspect, MS),
    presence_score(Suspect, PS),
    contradiction_count(Suspect, CC),
    Score is EC * 3 + MS + PS - CC.

% ------------------------------------------------------------
% rank_suspects/1
% Returns a list of Score-Suspect pairs, sorted descending.
% ------------------------------------------------------------
rank_suspects(Ranked) :-
    findall(Score-Suspect, suspicion_score(Suspect, Score), Pairs),
    msort(Pairs, Sorted),
    reverse(Sorted, Ranked).
