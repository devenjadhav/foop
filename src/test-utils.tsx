import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Add providers here as needed (e.g., ThemeProvider, QueryClientProvider)
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method
export { customRender as render };
