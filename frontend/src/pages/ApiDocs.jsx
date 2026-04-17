import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold mb-2">API Documentation</h2>
        <p className="text-text-muted">Integrate with our harvested scientific data via REST APIs.</p>
      </div>

      <div className="glass-panel p-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* We use our custom Swagger UI overrides from index.css */}
        <SwaggerUI url="/api/swagger.json" />
      </div>
    </div>
  );
}
