# Scripts

`deploy-frontend.ps1` deploys the frontend with one command:

```powershell
.\scripts\deploy-frontend.ps1
```

It pushes `main` from local, pulls on the VPS, then rebuilds the `frontend` service.
