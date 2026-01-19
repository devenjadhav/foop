import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('renders the welcome heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /welcome to foop/i })).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<Home />);
    expect(screen.getByText(/b2b automation saas platform/i)).toBeInTheDocument();
  });

  it('renders the get started button', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });
});
