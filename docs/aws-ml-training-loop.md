# AWS ML Training Loop for Indra SEO

This project now supports AWS-hosted inference and feedback capture:

1. Inference:
- API: /api/site-intel
- Model runtime: AWS Bedrock via AWS_BEDROCK_MODEL_ID
- Fallback: heuristic scorer when Bedrock is unavailable

2. Feedback data collection:
- API: /api/model-feedback
- DynamoDB table: indra-seo-model-feedback
- Payload includes model source, KPI scores, user rating, and accepted recommendations

3. Continuous improvement pattern:
- Export feedback records daily to S3 (AWS Glue or Lambda scheduled job)
- Build training dataset with fields:
  - website features (technical/functional/user/seo signals)
  - model recommendations
  - userRating and acceptedRecommendations (labels)
- Train ranking/reranking model in SageMaker weekly
- Deploy improved model endpoint or update prompt templates used by Bedrock call

4. Recommended cadence:
- Daily: collect and validate feedback records
- Weekly: retrain/rerank recommendation logic
- Biweekly: evaluate KPI lift on accepted recommendations

5. Governance:
- Keep manual approval before production model/prompt rollout
- Log model version and recommendation IDs for traceability
