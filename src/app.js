const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'INSOFTCOL S.A. - Laboratorio flujo CI/CD completo',
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    pipeline: {
      ci: 'GitHub Actions',
      cd: 'Jenkins',
      security: ['SonarCloud', 'Snyk'],
      monitoring: ['Prometheus', 'Grafana'],
      orchestration: 'Kubernetes (Kind)'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    app: 'cicd-demo-app',
    company: 'INSOFTCOL S.A.',
    description: 'Laboratorio flujo CI/CD completo - Maestría Arquitectura de Software',
    version: '2.0.0',
    stack: {
      runtime: 'Node.js',
      framework: 'Express',
      containerization: 'Docker (Multi-Arch)',
      orchestration: 'Kubernetes (Kind)',
      ci: 'GitHub Actions',
      cd: 'Jenkins',
      security: {
        sast: 'SonarCloud',
        dependencies: 'Snyk'
      },
      monitoring: {
        metrics: 'Prometheus',
        dashboards: 'Grafana'
      }
    }
  });
});

app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
