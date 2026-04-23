# 🔍 CrimeLogix — AI Crime Investigation Expert System

An AI-powered crime investigation system that uses **Prolog-based inference** to analyze suspects, evidence, and witness statements — then ranks suspects, detects contradictions, and explains its reasoning.

## Architecture

```
Frontend (HTML/CSS/JS)
    → HTTP POST /api/analyze (JSON)
        → Prolog processes data
            → Asserts facts into knowledge base
            → Applies inference rules
            → Detects contradictions
            → Computes ranking scores
            → Generates explanation
    → Prolog returns JSON
Frontend displays results
```

## Requirements

- **SWI-Prolog** (8.0+) — [Download here](https://www.swi-prolog.org/download/stable)
- A modern web browser (Chrome, Firefox, Edge)

## How to Run

```bash
# Navigate to the project directory
cd crime-logix

# Start the server
swipl server.pl
```

The server starts at **http://localhost:5000**

Open your browser and go to: [http://localhost:5000](http://localhost:5000)

## Usage

1. **Add Suspects** — Enter suspect names
2. **Add Evidence** — Select evidence type, add description, link to a suspect
3. **Add Witness Statements** — Enter witness name, select suspect, choose claim type
4. **Click "Run Investigation"** — System analyzes all data and displays results

You can also click **"Load Sample Case"** to populate a pre-built investigation scenario.

## API Endpoints

### POST `/api/analyze`

Runs a full investigation analysis.

**Request Body:**
```json
{
  "suspects": ["Marcus Webb", "Diana Cross", "Leo Finch"],
  "evidence": [
    {
      "type": "fingerprint",
      "description": "Found on murder weapon",
      "suspect": "Marcus Webb"
    },
    {
      "type": "dna",
      "description": "Hair sample at crime scene",
      "suspect": "Diana Cross"
    }
  ],
  "statements": [
    {
      "witness": "Mrs. Chen",
      "suspect": "Marcus Webb",
      "claim": "was_at_scene"
    },
    {
      "witness": "Mr. Patel",
      "suspect": "Marcus Webb",
      "claim": "has_motive"
    },
    {
      "witness": "Ms. Torres",
      "suspect": "Diana Cross",
      "claim": "was_not_at_scene"
    }
  ]
}
```

**Response:**
```json
{
  "ranking": [
    { "suspect": "Marcus Webb", "score": 9 },
    { "suspect": "Diana Cross", "score": 3 },
    { "suspect": "Leo Finch", "score": 0 }
  ],
  "most_likely": "Marcus Webb",
  "contradictions": [],
  "explanation": "Based on the analysis, Marcus Webb is the most likely suspect..."
}
```

### GET `/api/results`

Returns the results of the last analysis run.

## Claim Types

| Claim | Description |
|-------|------------|
| `was_at_scene` | Witness places suspect at the crime scene |
| `was_not_at_scene` | Witness says suspect was NOT at the scene |
| `has_motive` | Witness claims suspect has a motive |
| `no_motive` | Witness says suspect has no motive |
| `has_alibi` | Witness says suspect has an alibi |
| `is_suspicious` | Witness finds suspect suspicious |
| `is_not_suspicious` | Witness says suspect is not suspicious |

## Scoring Formula

```
Score = (3 × evidence_count) + (2 × has_motive) + (2 × was_present) - (1 × contradictions)
```

- Physical evidence linked to suspect: **+3 per item**
- Has motive (from witness): **+2**
- Placed at scene (from witness): **+2**
- Each contradiction: **-1**

## Contradiction Detection

The system detects conflicting witness statements:

| Claim A | Claim B | Contradiction |
|---------|---------|--------------|
| `was_at_scene` | `was_not_at_scene` | ✓ |
| `has_motive` | `no_motive` | ✓ |
| `has_alibi` | `was_at_scene` | ✓ |
| `is_suspicious` | `is_not_suspicious` | ✓ |

## File Structure

```
crime-logix/
├── server.pl              # HTTP server (entry point)
├── knowledge_base.pl      # Dynamic fact store
├── rules.pl               # Inference rules
├── contradiction.pl       # Contradiction detection
├── ranking.pl             # Suspicion scoring & ranking
├── explanation.pl         # Reasoning explanation generator
├── frontend/
│   ├── index.html         # Main UI
│   ├── styles.css         # Dark noir theme
│   └── script.js          # Frontend logic & API calls
└── README.md              # This file
```

## Tech Stack

- **Backend**: SWI-Prolog (HTTP server + inference engine)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES5+)
- **Communication**: JSON over HTTP (RESTful API)
