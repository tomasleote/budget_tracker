import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Budget Tracker heading', async () => {
  render(<App />);
  const heading = await screen.findByText('Budget Tracker');
  expect(heading).toBeInTheDocument();
});
