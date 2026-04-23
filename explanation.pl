% ============================================================
% explanation.pl — Reasoning Explanation Generator
% Crime Investigation Expert System
% ============================================================
% Generates human-readable explanations for analysis results.
% ============================================================

% ------------------------------------------------------------
% explain_suspect/2
% Generates a text explanation for a single suspect's score.
% ------------------------------------------------------------
explain_suspect(Suspect, Explanation) :-
    suspect(Suspect),
    suspicion_score(Suspect, Score),
    evidence_count(Suspect, EC),
    contradiction_count(Suspect, CC),
    (has_motive(Suspect) -> MText = "has a known motive" ; MText = "has no known motive"),
    (was_present(Suspect) -> PText = "was placed at the scene by witnesses" ; PText = "was not placed at the scene"),
    format(atom(Explanation),
        "~w [Score: ~d]: ~w, ~w. ~d piece(s) of physical evidence linked. ~d contradiction(s) in witness statements.",
        [Suspect, Score, MText, PText, EC, CC]).

% ------------------------------------------------------------
% generate_full_explanation/2
% Combines individual suspect explanations into a full narrative.
% Takes the ranked list (Score-Suspect pairs) and produces text.
% ------------------------------------------------------------
generate_full_explanation([], "No suspects to analyze.").
generate_full_explanation(Ranked, Explanation) :-
    Ranked \= [],
    Ranked = [TopScore-TopSuspect|_],
    maplist(explain_entry, Ranked, Parts),
    atomic_list_concat(Parts, ' ', SuspectExplanations),
    (TopScore > 0
    ->  format(atom(Header),
            "Based on the analysis, ~w is the most likely suspect with a score of ~d. ",
            [TopSuspect, TopScore])
    ;   Header = "No suspect has significant evidence against them. "
    ),
    atom_concat(Header, SuspectExplanations, Explanation).

% Helper: explain a single ranked entry
explain_entry(Score-Suspect, Text) :-
    evidence_count(Suspect, EC),
    (has_motive(Suspect) -> MText = "motive" ; MText = "no motive"),
    (was_present(Suspect) -> PText = "at scene" ; PText = "not at scene"),
    contradiction_count(Suspect, CC),
    format(atom(Text),
        "| ~w [~d pts]: ~w, ~w, ~d evidence, ~d contradiction(s).",
        [Suspect, Score, MText, PText, EC, CC]).
