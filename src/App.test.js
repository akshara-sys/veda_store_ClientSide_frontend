import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Veda Sankalpa store', () => {
  render(<App />);
  const linkElement = screen.getAllByRole('link', { name: /VEDA SANKALPA THE SACRED STORE/i })[0];
  expect(linkElement).toBeInTheDocument();
});
