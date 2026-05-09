# Zapier submission notes

Zapier publication is manual and blocked until Zapier account/app review access
is available.

Prepared integration scope:

- Authentication: API key header, `Authorization: Bearer <api_key>`.
- Create Split action: `POST https://api.aistemsplitter.org/v1/audio/splits`.
- Get Split action: `GET https://api.aistemsplitter.org/v1/audio/splits/{splitId}`.
- Public docs: https://aistemsplitter.org/developers/api.

Submission blockers:

1. Create or access the Zapier developer app.
2. Add API key authentication.
3. Configure Create Split and Get Split actions from the API docs.
4. Run Zapier validation with a test API key.
5. Submit for Zapier review.
