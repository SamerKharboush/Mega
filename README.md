# PathAI Studio

> AI-powered digital pathology platform built on GigaPath + UNI 2 foundation models.

![PathAI Studio](https://img.shields.io/badge/PathAI-Studio-14B8A6)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)
![License](https://img.shields.io/badge/License-MIT-blue)

## Overview

PathAI Studio is a web-based SaaS platform where pathologists can:

- Upload whole-slide images (WSI) in SVS, NDPI, TIFF, MRXS, or SCN formats
- Run AI analysis powered by Microsoft GigaPath and Harvard UNI 2 foundation models
- View attention heatmaps on slides for interpretability
- Download structured PDF reports with predictions, confidence scores, and annotations

## Features

- **Cancer Subtyping**: Identify tumor types with SOTA accuracy on 9 subtypes
- **Mutation Prediction**: EGFR, KRAS, TP53 predictions directly from H&E slides
- **Attention Heatmaps**: Visualize where the model focuses for interpretability
- **IHC Quantification**: HER2, Ki-67, PD-L1 automated scoring
- **Survival Prognosis**: Predict OS and PFS from morphology

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| WSI Viewer | OpenSeadragon + Annotorious |
| Auth | Supabase Auth |
| Database | Supabase Postgres + pgvector |
| Storage | Supabase Storage |
| Backend | FastAPI + Celery + Redis |
| GPU | Modal.com serverless |
| ML Models | GigaPath + UNI 2 (HuggingFace) |
| Payments | Stripe (metered + seats) |
| Deploy | Vercel (frontend) + Fly.io (backend) |

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose

### Local Development

1. **Clone and install**

```bash
git clone https://github.com/yourname/pathai-studio
cd pathai-studio
```

2. **Start local services**

```bash
docker-compose up -d
```

3. **Setup Frontend**

```bash
cd frontend
npm install
cp ../.env.example .env.local
npm run dev
```

4. **Setup Backend**

```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # or `.\venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

5. **Run database migrations**

Execute the SQL schema in `BLUEPRINT.md` in your Supabase SQL editor.

## Project Structure

```
pathai-studio/
├── frontend/               # Next.js 14 App
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   └── lib/               # Utilities
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/routes/   # API endpoints
│   │   ├── models/       # ML models
│   │   └── services/     # Business logic
│   └── requirements.txt
├── ml/                    # Training scripts
├── .github/workflows/     # CI/CD
└── docker-compose.yml     # Local dev
```

## API Documentation

Once running, access the interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && pytest
```

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set environment variables
3. Deploy on push to `main`

### Backend (Fly.io)

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Deploy: `fly deploy`

## Pricing

| Plan | Price | Slides | Features |
|------|-------|--------|----------|
| Free Trial | €0 | 20/month | Cancer subtyping only |
| Pro | €299/month | 500 + €0.50/extra | All tasks, PDF reports, 3 seats |
| Enterprise | Custom | Unlimited | On-prem, HIPAA BAA, custom fine-tuning |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Microsoft GigaPath](https://github.com/prov-gigapath/prov-gigapath) - Foundation model
- [Harvard UNI](https://github.com/mahmoodlab/UNI) - Tile encoder
- [OpenSeadragon](https://openseadragon.github.io/) - WSI viewer

---

Built in Tradate, Italy 🇮🇹