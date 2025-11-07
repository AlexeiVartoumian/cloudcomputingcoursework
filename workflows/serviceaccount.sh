gcloud iam workload-identity-pools create "github-pool" \
  --location="global" \
  --display-name="GitHub Actions Pool"

  gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --workload-identity-pool="github-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='AlexeiVartoumian/cloudcomputingcoursework'" \
  --location="global"


 gcloud iam workload-identity-pools providers describe github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --format="value(name)"

  gcloud iam service-accounts add-iam-policy-binding github-actions-sa@cloudcomputing-473914.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/1037056803639/locations/global/workloadIdentityPools/github-pool/attribute.repository/AlexeiVartoumian/cloudcomputingcoursework"


gsutil mb -p cloudcomputing-473914 -l europe-west2 gs://cloudcomputing-473914-terraform-state
gsutil versioning set on gs://cloudcomputing-473914-terraform-state
gsutil iam ch serviceAccount:github-actions-sa@cloudcomputing-473914.iam.gserviceaccount.com:objectAdmin gs://cloudcomputing-473914-terraform-state
